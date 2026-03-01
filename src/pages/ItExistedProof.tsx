import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import JSZip from 'jszip';
import { buildOriginZip, buildZipFileName } from '@/lib/originZip';
import { arrayBufferToBase64, fetchOriginByToken, fetchProofStatus } from '@/lib/coreApi';
import { calculateSHA256 } from '@/lib/originHash';
import { cacheArtifact, clearArtifact, loadArtifact } from '@/lib/artifactCache';
import InlineVerify from '@/components/itexisted/InlineVerify';
import InlineAttestation from '@/components/itexisted/InlineAttestation';
import Circumpunct from '@/components/itexisted/Circumpunct';
import Kaartenbak from '@/components/itexisted/Kaartenbak';
import { useKaartenbak } from '@/contexts/KaartenbakContext';

/** Countdown: shows time remaining until ~2h after capture */
function CountdownTimer({ capturedAt }: { capturedAt: string }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const target = new Date(capturedAt).getTime() + 2 * 60 * 60 * 1000;
  const remaining = Math.max(0, target - now);
  if (remaining <= 0) {
    return (
      <span className="font-mono text-[15px] tracking-[2px] uppercase"
        style={{ color: 'rgba(201,169,110,0.7)' }}>
        Almost ready — refresh to check
      </span>
    );
  }
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  return (
    <span className="font-mono text-[18px] tracking-[2px]"
      style={{ color: '#c9a96e' }}>
      Ready in {h > 0 ? `${h}h ` : ''}{String(m).padStart(2, '0')}m {String(s).padStart(2, '0')}s
    </span>
  );
}

interface ProofState {
  originId: string;
  hash: string;
  capturedAt: string;
  shortToken: string;
  proofStatus: 'pending' | 'anchored';
  bitcoinBlockHeight: number | null;
  deviceSignature: string | null;
  devicePublicKey: string | null;
}

export default function ItExistedProof() {
  const { token: rawToken = '' } = useParams();
  // Normalize token to uppercase for consistent cache key lookups
  const token = rawToken.toUpperCase();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItems, items: kaartenbakItems } = useKaartenbak();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ProofState | null>(null);
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [verifyKey, setVerifyKey] = useState(0);
  const [downloadedZipBlob, setDownloadedZipBlob] = useState<Blob | null>(null);
  const [downloadedZipName, setDownloadedZipName] = useState<string | null>(null);
  const [saveConfirmed, setSaveConfirmed] = useState(false);

  // Artifact file state — persist match across refreshes via localStorage (survives tab close)
  const storageKey = `artifact_matched_${token}`;
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const artifactFileRef = useRef<File | null>(null);
  // Keep ref in sync with state so handlers always read the latest value
  useEffect(() => { artifactFileRef.current = artifactFile; }, [artifactFile]);
  const [artifactStatus, setArtifactStatus] = useState<'idle' | 'checking' | 'matched' | 'mismatch'>(() => {
    try { return localStorage.getItem(storageKey) === 'matched' ? 'matched' : 'idle'; } catch { return 'idle'; }
  });
  const [dragOver, setDragOver] = useState(false);
  const [computedHash, setComputedHash] = useState<string | null>(() => {
    try { return localStorage.getItem(`artifact_hash_${token}`) || null; } catch { return null; }
  });

  // Restore artifact file from IndexedDB cache on mount (if previously confirmed)
  // If cache is empty but status says 'matched', reset to idle so drop zone appears
  const [cacheMissFileName, setCacheMissFileName] = useState<string | null>(null);
  useEffect(() => {
    if (artifactStatus === 'matched' && !artifactFile && token) {
      loadArtifact(token).then(file => {
        if (file) {
          setArtifactFile(file);
          artifactFileRef.current = file;
          console.log('[ArtifactCache] restored:', file.name);
        } else {
          // Cache empty — reset status so user sees the drop zone with filename hint
          console.warn('[ArtifactCache] cache empty for token:', token, '— resetting to idle');
          const savedFileName = kaartenbakItems.find(i => i.shortToken === token)?.fileName || null;
          setCacheMissFileName(savedFileName);
          setArtifactStatus('idle');
          try { localStorage.removeItem(storageKey); } catch {}
        }
      });
    }
  }, [token, artifactStatus]);

  // Auto-confirm Step 1 if file was passed via router state (single-upload flow)
  const passedFileRef = useRef(false);
  useEffect(() => {
    const passedFile = (location.state as any)?.file as File | undefined;
    if (passedFile && state && !passedFileRef.current && artifactStatus === 'idle') {
      passedFileRef.current = true;
      onArtifactFile(passedFile);
    }
  }, [state, location.state, artifactStatus]);
  useEffect(() => {
    if (state?.proofStatus === 'anchored') {
      setOpenStep('verify');
    }
  }, [state?.proofStatus]);

  // Auto-add current anchor to kaartenbak so it shows as a row
  useEffect(() => {
    if (!state) return;
    addItems([{
      originId: state.originId,
      shortToken: state.shortToken,
      hash: state.hash,
      capturedAt: state.capturedAt,
      verifyUrl: `https://itexisted.app/proof/${state.shortToken}`,
      status: state.proofStatus === 'anchored' ? 'anchored' : 'pending',
      fileName: artifactFile?.name ?? null,
    }]);
  }, [state?.originId, state?.proofStatus, artifactFile?.name]);

  const isValidToken = /^[0-9a-fA-F]{8}$/.test(token);

  const load = async () => {
    if (!isValidToken) { setState(null); setLoading(false); return; }
    const resolved = await fetchOriginByToken(token);
    if (!resolved) { setState(null); setLoading(false); return; }

    // Use status from resolve response first (fast path, no binary proof download)
    let proofStatus: 'pending' | 'anchored' = resolved.proof_status === 'anchored' ? 'anchored' : 'pending';
    let bitcoinBlockHeight: number | null = resolved.bitcoin_block_height ?? null;

    // Fallback only if resolve didn't include status
    if (!resolved.proof_status) {
      const proof = await fetchProofStatus(resolved.origin_id);
      proofStatus = proof.status === 'anchored' ? 'anchored' : 'pending';
      bitcoinBlockHeight = proof.bitcoinBlockHeight;
    }

    // Try to recover Layer 2 data from localStorage (set during sealing)
    let deviceSignature: string | null = null;
    let devicePublicKey: string | null = null;
    try {
      const raw = localStorage.getItem('itexisted_last_anchor');
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved.originId === resolved.origin_id || saved.shortToken === (resolved.short_token ?? token.toUpperCase())) {
          deviceSignature = saved.deviceSignature ?? null;
          devicePublicKey = saved.devicePublicKey ?? null;
        }
      }
    } catch { /* ignore */ }
    setState({
      originId: resolved.origin_id,
      hash: resolved.hash,
      capturedAt: resolved.captured_at,
      shortToken: resolved.short_token ?? token.toUpperCase(),
      proofStatus,
      bitcoinBlockHeight,
      deviceSignature,
      devicePublicKey,
    });
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);
  useEffect(() => {
    if (!state || state.proofStatus === 'anchored') return;
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, [state?.proofStatus, token]);

  const captured = useMemo(() => (state ? new Date(state.capturedAt) : new Date()), [state?.capturedAt]);
  const shareUrl = `${window.location.origin}/itexisted/proof/${token.toUpperCase()}`;

  // ── Artifact file handler: hash-verify before accepting ──
  const onArtifactFile = useCallback(async (file: File) => {
    if (!state) return;
    setArtifactStatus('checking');
    try {
      const buffer = await file.arrayBuffer();
      const fileHash = await calculateSHA256(buffer);
      const expectedHash = state.hash.toLowerCase().replace(/^sha256:/, '');
      console.log('[ArtifactCheck] file:', file.name, 'size:', file.size);
      console.log('[ArtifactCheck] fileHash:    ', fileHash);
      console.log('[ArtifactCheck] expectedHash:', expectedHash);
      console.log('[ArtifactCheck] match:', fileHash === expectedHash);
      setComputedHash(fileHash);
      if (fileHash === expectedHash) {
        setArtifactFile(file);
        artifactFileRef.current = file;
        setArtifactStatus('matched');
        try { localStorage.setItem(storageKey, 'matched'); localStorage.setItem(`artifact_hash_${token}`, fileHash); } catch {}
        if (token) cacheArtifact(token, file);
        toast.success('File verified — will be included in your ZIP.');
      } else {
        setArtifactFile(null);
        setArtifactStatus('mismatch');
        toast.error('Hash mismatch — this is not the original file.');
      }
    } catch (e) {
      console.error('[ArtifactCheck] error:', e);
      setArtifactStatus('mismatch');
      toast.error('Could not read file.');
    }
  }, [state]);

  /* ── LOADING ── */
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a0f0a' }}>
        <svg viewBox="0 0 40 40" width={32} height={32}>
          <circle cx="20" cy="20" r="16" fill="none" stroke="rgba(197,147,90,0.3)" strokeWidth="0.8" />
          <circle cx="20" cy="20" r="5" fill="#C5935A">
            <animate attributeName="opacity" values="1;0.2;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
        </svg>
      </main>
    );
  }

  /* ── NOT FOUND ── */
  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center px-8"
        style={{ background: '#0a0f0a' }}>
        <div className="text-center">
          <p className="font-garamond text-[24px] mb-4"
            style={{ color: 'rgba(240,234,214,0.35)' }}>Proof not found.</p>
          <button onClick={() => navigate('/itexisted')}
            className="font-mono text-[14px] tracking-[5px] uppercase transition-colors"
            style={{ color: 'rgba(240,234,214,0.35)' }}>
            Anchor a file
          </button>
        </div>
      </main>
    );
  }

  const testAnchored = new URLSearchParams(window.location.search).get('test') === 'anchored';
  const anchored = testAnchored || state.proofStatus === 'anchored';
  const date = captured.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const time = `${captured.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`;

  /* ── Countdown for pending ── */
  const pendingLabel = (() => {
    const expectedAt = new Date(captured.getTime() + 2 * 60 * 60 * 1000);
    const now = new Date();
    const diffMs = expectedAt.getTime() - now.getTime();
    const diffMin = Math.max(0, Math.round(diffMs / 60000));
    if (diffMin <= 0) return 'Bitcoin proof in progress, any moment now';
    if (diffMin < 60) return `Bitcoin proof in progress, ready in ~${diffMin} min`;
    return `Bitcoin proof in progress, ready in ~${Math.ceil(diffMin / 60)} hours`;
  })();

  /* ── ACTIONS ── */
  const onShare = async () => {
    // Ensure artifact is available — use ref + IndexedDB restore
    let resolvedArtifactForShare = artifactFileRef.current;
    if (!resolvedArtifactForShare && token) {
      const cached = await loadArtifact(token) || await loadArtifact(token.toLowerCase());
      if (cached) { resolvedArtifactForShare = cached; setArtifactFile(cached); artifactFileRef.current = cached; }
    }
    // If artifact + anchored → share ZIP bundle
    if (anchored && resolvedArtifactForShare) {
      try {
        const testAnchored = new URLSearchParams(window.location.search).get('test') === 'anchored';
        let zipBlob: Blob;

        if (testAnchored) {
          zipBlob = await buildOriginZip({
            originId: state.originId, hash: state.hash,
            timestamp: new Date(state.capturedAt), imageUrl: null,
            otsProof: null,
            artifactFile: resolvedArtifactForShare, originalFileName: resolvedArtifactForShare.name,
            deviceSignature: state.deviceSignature,
            devicePublicKey: state.devicePublicKey,
          });
        } else {
          const proof = await fetchProofStatus(state.originId);
          if (proof.status !== 'anchored' || !proof.otsProofBytes) {
            toast.error('Proof not ready yet.');
            return;
          }
          zipBlob = await buildOriginZip({
            originId: state.originId, hash: state.hash,
            timestamp: new Date(state.capturedAt), imageUrl: null,
            otsProof: arrayBufferToBase64(proof.otsProofBytes),
            artifactFile: resolvedArtifactForShare, originalFileName: resolvedArtifactForShare.name,
            deviceSignature: state.deviceSignature,
            devicePublicKey: state.devicePublicKey,
          });
        }

        const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), resolvedArtifactForShare.name, state.shortToken);
        const zipFile = new File([zipBlob], fileName, { type: 'application/zip' });

        // iOS: direct download to avoid byte corruption via navigator.share
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
          const url = URL.createObjectURL(zipBlob);
          const a = document.createElement('a');
          a.href = url; a.download = fileName; a.click();
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          toast.success('ZIP downloaded. Share via email or messaging app.\nSend the original file separately via a secure channel.');
          return;
        }

        if (navigator.share && navigator.canShare?.({ files: [zipFile] })) {
          await navigator.share({
            title: `Origin ${state.shortToken}`,
            text: `Anchored proof for origin ${state.shortToken}.\nSend your original file separately via a secure channel.`,
            files: [zipFile],
          });
          return;
        }

        // Desktop fallback: download
        const url = URL.createObjectURL(zipBlob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        toast.success('ZIP downloaded. Share it manually.');
        return;
      } catch (e) {
        console.warn('[Share] ZIP share failed, falling back to URL:', e);
      }
    }

    // Fallback: share proof URL only
    if (navigator.share) {
      try {
        const msg = `Origin ${state.shortToken}, anchored proof.\nVerify: ${shareUrl}\n\nSend your original file separately via a secure channel, because bytes must stay intact for verification.`;
        await navigator.share({ title: `Origin ${state.shortToken}`, text: msg, url: shareUrl });
        return;
      } catch {
        // cancelled
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Proof URL copied.');
    } catch {
      toast.error('Could not copy URL.');
    }
  };

  const onDownload = async () => {
    if (!anchored) { toast.info('Proof is still pending. Come back in ~2 hours.'); return; }

    const resetArtifactFlow = async (message: string) => {
      await Promise.all([
        clearArtifact(token),
        clearArtifact(token.toLowerCase()),
      ]);
      try {
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`artifact_hash_${token}`);
      } catch {
        // ignore storage failures
      }
      setArtifactFile(null);
      artifactFileRef.current = null;
      setArtifactStatus('idle');
      setComputedHash(null);
      setDownloadedZipBlob(null);
      setDownloadedZipName(null);
      setSaveConfirmed(false);
      setOpenStep('verify-file');
      toast.error(message);
    };

    // ── GATE 1: Ensure artifact is available ──
    let resolvedArtifact = artifactFileRef.current;
    console.log('[onDownload] artifactFileRef.current:', resolvedArtifact?.name ?? 'null', 'size:', resolvedArtifact?.size ?? 0);

    if (!resolvedArtifact && token) {
      console.log('[onDownload] Attempting IndexedDB restore for token:', token);
      const cached = await loadArtifact(token) || await loadArtifact(token.toLowerCase());
      if (cached) {
        resolvedArtifact = cached;
        setArtifactFile(cached);
        artifactFileRef.current = cached;
        cacheArtifact(token, cached); // ensure normalized key
        console.log('[onDownload] ✓ Restored from cache:', cached.name, cached.size, 'bytes');
      }
    }

    if (!resolvedArtifact) {
      console.warn('[onDownload] ⚠ No artifact available — blocking download');
      toast.error('Add your original file in Step 1 first. The ZIP must contain the original to be valid.');
      setOpenStep('verify-file');
      return;
    }

    // ── GATE 2: Artifact hash must still match certificate hash ──
    const artifactHash = await calculateSHA256(await resolvedArtifact.arrayBuffer());
    const expectedHash = state.hash.toLowerCase().replace(/^sha256:/, '');
    if (artifactHash !== expectedHash) {
      console.error('[onDownload] ⚠ Artifact hash mismatch before ZIP build', {
        file: resolvedArtifact.name,
        expected: expectedHash,
        actual: artifactHash,
      });
      await resetArtifactFlow('Original file check expired or mismatched. Re-add the exact original file to create a valid ZIP.');
      return;
    }

    const testMode = new URLSearchParams(window.location.search).get('test') === 'anchored';
    let otsProofBase64: string | null = null;

    if (!testMode) {
      const proof = await fetchProofStatus(state.originId);
      if (proof.status !== 'anchored' || !proof.otsProofBytes) { toast.error('Not ready yet.'); return; }
      otsProofBase64 = arrayBufferToBase64(proof.otsProofBytes);
    }

    console.log('[onDownload] Building ZIP with artifact:', `${resolvedArtifact.name} (${resolvedArtifact.size} bytes)`);

    const zip = await buildOriginZip({
      originId: state.originId, hash: state.hash,
      timestamp: new Date(state.capturedAt), imageUrl: null,
      otsProof: otsProofBase64,
      artifactFile: resolvedArtifact,
      originalFileName: resolvedArtifact?.name ?? null,
      deviceSignature: state.deviceSignature,
      devicePublicKey: state.devicePublicKey,
    });

    // ── GATE 3: ZIP must physically contain artifact.* ──
    const zipContent = await JSZip.loadAsync(zip);
    const hasArtifactInZip = Object.keys(zipContent.files).some((entry) => /^artifact\./i.test(entry) && !zipContent.files[entry].dir);
    if (!hasArtifactInZip) {
      console.error('[onDownload] ⚠ ZIP built without artifact entry — blocking download');
      await resetArtifactFlow('ZIP safety check failed: original file was not included. Re-add your original file and try again.');
      return;
    }

    const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), resolvedArtifact?.name, state.shortToken);

    // Store blob for auto-verification in Step 3
    setDownloadedZipBlob(zip);
    setDownloadedZipName(fileName);

    // Direct download — avoids iOS share sheet ZIP corruption
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url; a.download = fileName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);
  };

  const toggleStep = (id: string) => {
    setOpenStep(prev => prev === id ? null : id);
  };

  /* Step 1 is always accessible. Steps 2-4 require file match. Steps 2+3 also require anchored. */
  const lockedStyle = (artifactStatus !== 'matched') ? { opacity: 0.45, pointerEvents: 'none' as const } : {};
  const fullLockedStyle = (artifactStatus !== 'matched' || !anchored) ? { opacity: 0.45, pointerEvents: 'none' as const } : {};

  return (
    <>
    <Circumpunct />
    <Kaartenbak />
    <main className="min-h-screen flex items-center justify-center px-6"
      style={{ background: '#0a0f0a', WebkitFontSmoothing: 'antialiased', padding: '60px 24px' }}>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full flex flex-col items-start"
        style={{ maxWidth: 420 }}>

        {/* TOP BLOCK */}
        <div className="w-full flex flex-col items-start mb-12">
          {anchored ? (
            <>
              <h1 className="font-playfair text-[28px] md:text-[36px] font-normal flex items-center gap-1"
                style={{ color: '#f0ead6', lineHeight: 1.25 }}>
                Your file is anchored
              </h1>
              <p className="font-garamond italic text-[17px] mt-3 leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>
                It existed. Now it's provable. Your file stays yours.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-start gap-0">
              <h1 className="font-garamond text-[28px] font-normal leading-snug"
                style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
                Anchoring to Bitcoin in progress
              </h1>
              <CountdownTimer capturedAt={state.capturedAt} />
            </div>
          )}
        </div>

        {/* ── RECORD DETAILS ── */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="font-mono text-[11px] tracking-[3px] uppercase"
              style={{ color: 'rgba(197,147,90,0.55)' }}>Doc</span>
            <span className="font-mono text-[13px] tracking-[1px] text-right break-all"
              style={{ color: 'rgba(245,240,232,0.65)', maxWidth: 280 }}>
              {artifactFile && artifactStatus === 'matched'
                ? artifactFile.name
                : kaartenbakItems.find(i => i.shortToken === token)?.fileName || '—'}
            </span>
          </div>
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="font-mono text-[11px] tracking-[3px] uppercase"
              style={{ color: 'rgba(197,147,90,0.55)' }}>Origin ID</span>
            <span className="font-mono text-[13px] tracking-[1px]"
              style={{ color: '#C5935A' }}>{state.shortToken}</span>
          </div>
          <div className="flex justify-between items-baseline mb-2.5">
            <span className="font-mono text-[11px] tracking-[3px] uppercase"
              style={{ color: 'rgba(197,147,90,0.55)' }}>Date</span>
            <span className="font-mono text-[13px]"
              style={{ color: 'rgba(245,240,232,0.65)' }}>{date} · {time}</span>
          </div>
          <div className="flex justify-between items-start">
            <span className="font-mono text-[11px] tracking-[3px] uppercase pt-0.5"
              style={{ color: 'rgba(197,147,90,0.55)' }}>Hash</span>
            <span className="font-mono text-[11px] text-right break-all"
              style={{ color: 'rgba(245,240,232,0.45)', letterSpacing: '0.3px', lineHeight: 1.7, maxWidth: 280 }}>
              {state.hash}
            </span>
          </div>
        </div>


        {/* ── STEPS ── */}
        <div className="w-full flex flex-col items-start">

          {/* Gold divider */}
          <div className="w-full mb-6" style={{ borderTop: '1px solid rgba(197,147,90,0.25)' }} />

          {/* ── STEP 1: VERIFY ORIGINAL FILE ── */}
          <div className="w-full">
            <div className="flex items-center w-full py-3">
              <span className="font-mono text-[13px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: artifactStatus === 'matched' ? '#7fba6a' : '#F5F0E8' }}>
                ✓
              </span>
              <span className="font-mono text-[13px] tracking-[3px] uppercase"
                style={{ color: artifactStatus === 'matched' ? '#7fba6a' : '#F5F0E8' }}>
                {artifactStatus === 'matched' ? 'Original file verified' : 'Verify your original file'}
              </span>
              {artifactStatus === 'mismatch' && (
                <button
                  onClick={() => { setArtifactFile(null); setArtifactStatus('idle'); setComputedHash(null); }}
                  className="font-mono text-[15px] tracking-[1px] uppercase ml-auto"
                  style={{ color: 'rgba(240,234,214,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  New
                </button>
              )}
            </div>
            {artifactStatus !== 'matched' && (
              <div className="pb-4">
                {artifactStatus !== 'mismatch' ? (
                  <label
                    className="block w-full rounded-[8px] border-dashed border-[1.5px] p-6 text-center cursor-pointer transition-all"
                    style={{
                      borderColor: dragOver ? 'rgba(197,147,90,0.7)' : 'rgba(197,147,90,0.4)',
                      background: dragOver ? 'rgba(197,147,90,0.18)' : 'rgba(197,147,90,0.1)',
                    }}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) onArtifactFile(f); }}
                  >
                    <input type="file" className="hidden" accept="*/*"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) onArtifactFile(f); }} />
                    {artifactStatus === 'checking' ? (
                      <p className="font-mono text-[15px] tracking-[2px] uppercase"
                        style={{ color: 'rgba(245,240,232,0.5)' }}>Checking…</p>
                    ) : (
                      <>
                        <p className="font-garamond text-[20px]"
                          style={{ color: '#F5F0E8' }}>
                          {cacheMissFileName ? 'Re-add your original file' : 'Drop your original file.'}
                        </p>
                        {cacheMissFileName ? (
                          <p className="font-mono text-[14px] mt-2"
                            style={{ color: 'rgba(197,147,90,0.7)' }}>
                            {cacheMissFileName}
                          </p>
                        ) : (
                          <p className="font-garamond text-[16px] italic mt-1"
                            style={{ color: 'rgba(245,240,232,0.38)' }}>It is the key to your proof.</p>
                        )}
                      </>
                    )}
                  </label>
                ) : (
                  <div className="flex flex-col gap-1">
                    <p className="font-mono text-[15px] tracking-[1px] uppercase"
                      style={{ color: 'rgba(220,80,60,0.8)' }}>
                      Hash mismatch — wrong file
                    </p>
                    {computedHash && (
                      <p className="font-mono text-[13px] break-all"
                        style={{ color: 'rgba(220,80,60,0.5)', lineHeight: 1.6 }}>
                        {computedHash}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gold divider */}
          <div className="w-full" style={{ borderTop: '1px solid rgba(197,147,90,0.15)' }} />

          {/* ── STEP 2: DOWNLOAD ── */}
          <div className="w-full" style={fullLockedStyle}>
            <button
              onClick={() => onDownload()}
              className="flex items-center w-full text-left py-4"
              style={{ background: 'none', border: 'none', cursor: artifactStatus === 'matched' ? 'pointer' : 'default', padding: '16px 0' }}>
              <span className="font-mono text-[13px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: downloadedZipBlob ? '#7fba6a' : '#F5F0E8' }}>
                {downloadedZipBlob ? '✓' : '→'}
              </span>
              <span className="font-mono text-[13px] tracking-[3px] uppercase"
                style={{ color: downloadedZipBlob ? '#7fba6a' : '#F5F0E8' }}>
                {downloadedZipBlob ? 'Proof downloaded' : 'Download your proof'}
              </span>
            </button>
            {downloadedZipBlob && !saveConfirmed && (
              <div className="pb-4 text-center">
                <button
                  onClick={() => setSaveConfirmed(true)}
                  className="font-mono text-[13px] tracking-[3px] uppercase py-2.5 px-6 rounded-full transition-all"
                  style={{
                    border: '1px solid rgba(197,147,90,0.3)',
                    background: 'rgba(197,147,90,0.06)',
                    color: 'rgba(197,147,90,0.7)',
                    cursor: 'pointer',
                  }}>
                  Yes, saved my proof
                </button>
              </div>
            )}
            {saveConfirmed && (
              <div className="flex items-center py-2 pb-4">
                <span className="font-mono text-[13px] tracking-[3px] flex-shrink-0 mr-3"
                  style={{ color: '#7fba6a' }}>✓</span>
                <span className="font-mono text-[13px] tracking-[3px] uppercase"
                  style={{ color: '#7fba6a' }}>Saved</span>
              </div>
            )}
          </div>

          {/* Gold divider */}
          <div className="w-full" style={{ borderTop: '1px solid rgba(197,147,90,0.15)' }} />

          {/* ── ZIP VERIFIED — automatic, not a user action ── */}
          <div className="w-full" style={fullLockedStyle}>
            <div className="flex items-center w-full py-4">
              <span className="font-mono text-[13px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: downloadedZipBlob ? '#7fba6a' : 'rgba(240,234,214,0.25)' }}>
                {downloadedZipBlob ? '✓' : '·'}
              </span>
              <span className="font-mono text-[13px] tracking-[3px] uppercase"
                style={{ color: downloadedZipBlob ? '#7fba6a' : 'rgba(240,234,214,0.25)' }}>
                {downloadedZipBlob ? 'ZIP verified' : 'Verify your ZIP'}
              </span>
            </div>
            {downloadedZipBlob && (
              <div className="pb-4 rounded-[8px] p-4"
                style={{ background: 'rgba(74,124,89,0.06)', border: '1px solid rgba(74,124,89,0.3)' }}>
                <InlineVerify
                  key={verifyKey}
                  expectedOriginId={state?.originId}
                  expectedShortToken={state?.shortToken}
                  autoVerifyBlob={downloadedZipBlob}
                  autoVerifyName={downloadedZipName}
                />
                <div className="mt-4 pt-3" style={{ borderTop: '1px solid rgba(74,124,89,0.15)' }}>
                  <p className="font-garamond text-[17px] italic"
                    style={{ color: 'rgba(245,240,232,0.3)' }}>
                    Independent verification: <a href="https://verify-anchoring.org" target="_blank" rel="noopener"
                      style={{ color: 'rgba(197,147,90,0.5)', textDecoration: 'underline' }}>verify-anchoring.org</a>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Gold divider */}
          <div className="w-full" style={{ borderTop: '1px solid rgba(197,147,90,0.15)' }} />

          {/* ── ATTESTATION SECTION — visually separate ── */}
          <div className="w-full mt-10 mb-6" style={!saveConfirmed ? { opacity: 0.45, pointerEvents: 'none' as const } : fullLockedStyle}>
            <h2 className="font-garamond italic text-[24px] mb-3"
              style={{ color: 'rgba(245,240,232,0.85)', lineHeight: 1.3 }}>
              Want to add a trust layer?
            </h2>
            <p className="font-garamond italic text-[17px] mb-6"
              style={{ color: 'rgba(245,240,232,0.4)', lineHeight: 1.55 }}>
              A notary or verified third party can attest to this anchor — adding identity and legal weight above the cryptographic proof.
            </p>
            <button
              onClick={() => toggleStep('attest')}
              className="w-full flex items-center justify-center gap-3 py-3.5 rounded-[8px] transition-all"
              style={{
                border: '1px solid rgba(197,147,90,0.3)',
                background: 'rgba(197,147,90,0.04)',
                cursor: 'pointer',
              }}>
              <svg viewBox="0 0 20 20" width={14} height={14} style={{ flexShrink: 0 }}>
                <circle cx="10" cy="10" r="7" fill="none" stroke="rgba(197,147,90,0.5)" strokeWidth="0.8" />
                <circle cx="10" cy="10" r="2.5" fill="rgba(197,147,90,0.7)" />
              </svg>
              <span className="font-mono text-[13px] tracking-[4px] uppercase"
                style={{ color: 'rgba(197,147,90,0.6)' }}>
                Request attestation
              </span>
            </button>
            <div style={{
              maxHeight: openStep === 'attest' ? 800 : 0,
              overflow: 'hidden',
              opacity: openStep === 'attest' ? 1 : 0,
              transition: 'max-height 0.4s ease, opacity 0.3s ease',
            }}>
              <div className="pt-5">
                <InlineAttestation originId={state.originId} shortToken={state.shortToken} />
              </div>
            </div>
          </div>


        </div>
      </motion.div>
    </main>
    </>
  );
}
