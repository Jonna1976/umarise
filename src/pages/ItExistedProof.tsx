import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Copy } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { buildOriginZip, buildZipFileName } from '@/lib/originZip';
import { arrayBufferToBase64, fetchOriginByToken, fetchProofStatus } from '@/lib/coreApi';
import { calculateSHA256 } from '@/lib/originHash';
import { cacheArtifact, loadArtifact } from '@/lib/artifactCache';
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
  const { token = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { addItems } = useKaartenbak();
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<ProofState | null>(null);
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [verifyKey, setVerifyKey] = useState(0);
  const [downloadedZipBlob, setDownloadedZipBlob] = useState<Blob | null>(null);
  const [downloadedZipName, setDownloadedZipName] = useState<string | null>(null);

  // Artifact file state — persist match across refreshes via sessionStorage
  const storageKey = `artifact_matched_${token}`;
  const [artifactFile, setArtifactFile] = useState<File | null>(null);
  const [artifactStatus, setArtifactStatus] = useState<'idle' | 'checking' | 'matched' | 'mismatch'>(() => {
    try { return sessionStorage.getItem(storageKey) === 'matched' ? 'matched' : 'idle'; } catch { return 'idle'; }
  });
  const [dragOver, setDragOver] = useState(false);
  const [computedHash, setComputedHash] = useState<string | null>(() => {
    try { return sessionStorage.getItem(`artifact_hash_${token}`) || null; } catch { return null; }
  });

  // Restore artifact file from IndexedDB cache on mount (if previously confirmed)
  useEffect(() => {
    if (artifactStatus === 'matched' && !artifactFile && token) {
      loadArtifact(token).then(file => {
        if (file) {
          setArtifactFile(file);
          console.log('[ArtifactCache] restored:', file.name);
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
        setArtifactStatus('matched');
        try { sessionStorage.setItem(storageKey, 'matched'); sessionStorage.setItem(`artifact_hash_${token}`, fileHash); } catch {}
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
    // If artifact + anchored → share ZIP bundle
    if (anchored && artifactFile) {
      try {
        const testAnchored = new URLSearchParams(window.location.search).get('test') === 'anchored';
        let zipBlob: Blob;

        if (testAnchored) {
          zipBlob = await buildOriginZip({
            originId: state.originId, hash: state.hash,
            timestamp: new Date(state.capturedAt), imageUrl: null,
            otsProof: null,
            artifactFile, originalFileName: artifactFile.name,
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
            artifactFile, originalFileName: artifactFile.name,
            deviceSignature: state.deviceSignature,
            devicePublicKey: state.devicePublicKey,
          });
        }

        const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), artifactFile.name, state.shortToken);
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
    const testMode = new URLSearchParams(window.location.search).get('test') === 'anchored';
    let otsProofBase64: string | null = null;

    if (!testMode) {
      const proof = await fetchProofStatus(state.originId);
      if (proof.status !== 'anchored' || !proof.otsProofBytes) { toast.error('Not ready yet.'); return; }
      otsProofBase64 = arrayBufferToBase64(proof.otsProofBytes);
    }

    const zip = await buildOriginZip({
      originId: state.originId, hash: state.hash,
      timestamp: new Date(state.capturedAt), imageUrl: null,
      otsProof: otsProofBase64,
      artifactFile: artifactFile,
      originalFileName: artifactFile?.name ?? null,
      deviceSignature: state.deviceSignature,
      devicePublicKey: state.devicePublicKey,
    });
    const fileName = buildZipFileName(state.originId, new Date(state.capturedAt), artifactFile?.name, state.shortToken);
    
    // Store blob for auto-verification in Step 3
    setDownloadedZipBlob(zip);
    setDownloadedZipName(fileName);
    
    const url = URL.createObjectURL(zip);
    const a = document.createElement('a');
    a.href = url; a.download = fileName; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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
                <motion.span
                  className="inline-block"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.8 }}>
                  <svg viewBox="0 0 42 42" width="20" height="20" style={{ overflow: 'visible', display: 'inline-block', verticalAlign: '3px', marginLeft: '3px', filter: 'drop-shadow(0 0 7px rgba(197,147,90,0.5))' }}>
                    <motion.circle
                      cx="21" cy="38" fill="none"
                      stroke="rgba(197,147,90,0.45)" strokeWidth="0.9"
                      initial={{ r: 0, opacity: 0 }}
                      animate={{ r: 15, opacity: 1 }}
                      transition={{ duration: 0.9, delay: 2.2, ease: [0.2, 0, 0.2, 1] }}
                    />
                    <motion.circle
                      cx="21" cy="38" r="3.5" fill="#C5935A"
                      animate={{
                        opacity: [0.6, 1, 0.6],
                        filter: [
                          'drop-shadow(0 0 4px rgba(197,147,90,0.3))',
                          'drop-shadow(0 0 12px rgba(197,147,90,0.8))',
                          'drop-shadow(0 0 4px rgba(197,147,90,0.3))',
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </svg>
                </motion.span>
              </h1>
              <p className="font-garamond italic text-[15px] mt-3 leading-relaxed" style={{ color: 'rgba(245,240,232,0.6)' }}>
                It existed. Now it's provable. Your file stays yours.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-start gap-1">
              <h1 className="font-garamond text-[34px] font-normal"
                style={{ color: '#f0ead6', letterSpacing: '-0.3px' }}>
                Anchoring to Bitcoin in progress
              </h1>
              <CountdownTimer capturedAt={state.capturedAt} />
            </div>
          )}
        </div>

        {/* ── RECORD DETAILS ── */}
        <div className="w-full mb-8">
          {artifactFile && artifactStatus === 'matched' && (
            <div className="flex justify-between items-baseline mb-2.5">
              <span className="font-mono text-[11px] tracking-[3px] uppercase"
                style={{ color: 'rgba(197,147,90,0.55)' }}>Doc</span>
              <span className="font-mono text-[13px] tracking-[1px] text-right break-all"
                style={{ color: 'rgba(245,240,232,0.65)', maxWidth: 280 }}>
                {artifactFile.name}
              </span>
            </div>
          )}
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
                          style={{ color: '#F5F0E8' }}>Drop your original file.</p>
                        <p className="font-garamond text-[16px] italic mt-1"
                          style={{ color: 'rgba(245,240,232,0.38)' }}>It is the key to your proof.</p>
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
                style={{ color: downloadedZipBlob ? '#7fba6a' : 'rgba(197,147,90,0.7)' }}>
                ✓
              </span>
              <span className="font-mono text-[13px] tracking-[3px] uppercase"
                style={{ color: downloadedZipBlob ? '#7fba6a' : 'rgba(197,147,90,0.7)' }}>
                {downloadedZipBlob ? 'Proof downloaded' : 'Download your proof'}
              </span>
            </button>
          </div>

          {/* Gold divider */}
          <div className="w-full" style={{ borderTop: '1px solid rgba(197,147,90,0.15)' }} />

          {/* ── STEP 3: VERIFY ── */}
          <div className="w-full" style={fullLockedStyle}>
            <div className="flex items-center w-full py-4">
              <span className="font-mono text-[13px] tracking-[3px] flex-shrink-0 mr-3"
                style={{ color: downloadedZipBlob ? '#7fba6a' : 'rgba(197,147,90,0.7)' }}>
                ✓
              </span>
              <span className="font-mono text-[13px] tracking-[3px] uppercase"
                style={{ color: downloadedZipBlob ? '#7fba6a' : 'rgba(197,147,90,0.7)' }}>
                {downloadedZipBlob ? 'ZIP verified' : 'Verify your ZIP'}
              </span>
            </div>
            {downloadedZipBlob && (
              <div className="pb-4">
                <InlineVerify
                  key={verifyKey}
                  expectedOriginId={state?.originId}
                  expectedShortToken={state?.shortToken}
                  autoVerifyBlob={downloadedZipBlob}
                  autoVerifyName={downloadedZipName}
                />
                <p className="font-garamond text-[14px] italic mt-3"
                  style={{ color: 'rgba(245,240,232,0.3)' }}>
                  Independent verification: <a href="https://verify-anchoring.org" target="_blank" rel="noopener"
                    style={{ color: 'rgba(197,147,90,0.5)', textDecoration: 'underline' }}>verify-anchoring.org</a>
                </p>
              </div>
            )}
          </div>

          {/* Gold divider */}
          <div className="w-full" style={{ borderTop: '1px solid rgba(197,147,90,0.15)' }} />

          {/* ── ATTESTATION SECTION — visually separate ── */}
          <div className="w-full mt-10 mb-6" style={fullLockedStyle}>
            <h2 className="font-garamond italic text-[24px] mb-3"
              style={{ color: 'rgba(245,240,232,0.85)', lineHeight: 1.3 }}>
              Want to add a trust layer?
            </h2>
            <p className="font-garamond italic text-[16px] mb-6"
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

          {/* ── ANCHOR ANOTHER ── */}
          <div className="w-full flex items-center justify-center gap-3 mt-6 mb-8 opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
            style={!anchored ? { opacity: 0.25 } : {}}
            onClick={() => navigate('/itexisted')}>
            <div
              className="flex items-center justify-center rounded-full"
              style={{
                width: 32, height: 32,
                border: '1px solid rgba(245,240,232,0.3)',
              }}>
              <span style={{ color: 'rgba(245,240,232,0.6)', fontSize: 18, lineHeight: 1 }}>+</span>
            </div>
            <span className="font-mono text-[13px] tracking-[4px] uppercase"
              style={{ color: 'rgba(245,240,232,0.5)' }}>
              Anchor another file
            </span>
          </div>

        </div>
      </motion.div>
    </main>
    </>
  );
}
