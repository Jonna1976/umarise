import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import JSZip from 'jszip';
import { verifyOriginByHash, fetchProofStatus } from '@/lib/coreApi';
import { VerifyDropZone } from '@/components/verify/VerifyDropZone';
import { VerifyProcessLog, type StepState } from '@/components/verify/VerifyProcessLog';
import { VerifyHashDisplay } from '@/components/verify/VerifyHashDisplay';
import { VerifyResult, type VerifyResultData } from '@/components/verify/VerifyResult';
import { VerifyManualForm } from '@/components/verify/VerifyManualForm';

// ─── Helpers ───

const delay = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

async function computeSHA256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

interface CertificateData {
  origin_id: string;
  hash: string;
  algorithm?: string;
  timestamp?: string;
  captured_at?: string;
  proof_status?: string;
  proof_included?: boolean;
  claimed_by?: string | null;
  signature?: string | null;
}

// ─── Initial steps ───

function createInitialSteps(): StepState[] {
  return [
    { id: 'read', status: 'waiting', label: 'Reading file...' },
    { id: 'cert', status: 'waiting', label: 'Extracting certificate.json' },
    { id: 'hash', status: 'waiting', label: 'Hashing photo...' },
    { id: 'match', status: 'waiting', label: 'Comparing hash with certificate' },
    { id: 'claim', status: 'waiting', label: 'Checking identity claim...' },
    { id: 'api', status: 'waiting', label: 'Verifying with registry...' },
  ];
}

// ─── Page Component ───

export default function Verify() {
  const [searchParams] = useSearchParams();

  // State
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<StepState[]>(createInitialSteps());
  const [showSteps, setShowSteps] = useState(false);
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [hashMatch, setHashMatch] = useState<'match' | 'mismatch' | null>(null);
  const [result, setResult] = useState<VerifyResultData | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualOriginId, setManualOriginId] = useState('');
  const [manualHash, setManualHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // URL pre-fill
  useEffect(() => {
    const oid = searchParams.get('origin_id');
    const h = searchParams.get('hash');
    if (oid || h) {
      if (oid) setManualOriginId(oid);
      if (h) setManualHash(h);
      setManualOpen(true);
    }
  }, [searchParams]);

  // Step helpers
  const updateStep = useCallback((id: string, status: StepState['status'], label?: string) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status, label: label ?? s.label } : s));
  }, []);

  const hideStep = useCallback((id: string) => {
    updateStep(id, 'hidden');
  }, [updateStep]);

  // ─── Reset ───
  const resetAll = useCallback(() => {
    setIsProcessing(false);
    setSteps(createInitialSteps());
    setShowSteps(false);
    setComputedHash(null);
    setHashMatch(null);
    setResult(null);
    setManualOriginId('');
    setManualHash('');
    setManualOpen(false);
    setIsVerifying(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // ─── API Verification ───
  async function verifyWithApi(hash: string, certificate?: CertificateData) {
    updateStep('api', 'active', 'Verifying with registry...');
    
    const verifyResult = await verifyOriginByHash(hash);
    
    if (!verifyResult.found || !verifyResult.origin) {
      updateStep('api', 'fail', 'Not found in registry');
      setResult({ status: 'not_found' });
      return;
    }

    const origin = verifyResult.origin;
    updateStep('api', 'done', 'Verified ✓');

    // Fetch proof status to get block height
    let bitcoinBlockHeight: number | null = null;
    let proofStatus: 'pending' | 'anchored' = origin.proof_status || 'pending';

    if (proofStatus === 'anchored') {
      const proofResult = await fetchProofStatus(origin.origin_id);
      if (proofResult.status === 'anchored') {
        bitcoinBlockHeight = proofResult.bitcoinBlockHeight;
      }
    }

    const resultData: VerifyResultData = {
      status: proofStatus === 'anchored' ? 'verified' : 'pending',
      origin_id: origin.origin_id,
      hash: origin.hash,
      captured_at: origin.captured_at,
      proof_status: proofStatus,
      bitcoin_block_height: bitcoinBlockHeight,
      claimed_by: certificate?.claimed_by ?? null,
      signature: certificate?.signature ?? null,
    };

    setResult(resultData);
  }

  // ─── Process ZIP ───
  async function processZip(file: File) {
    setIsProcessing(true);
    setShowSteps(true);
    setResult(null);
    setComputedHash(null);
    setHashMatch(null);

    // Step 1: Read ZIP
    updateStep('read', 'active', `Reading ${file.name}...`);
    await delay(300);

    let zip: JSZip;
    try {
      zip = await JSZip.loadAsync(file);
    } catch {
      updateStep('read', 'fail', 'Failed to read ZIP file');
      setIsProcessing(false);
      return;
    }
    updateStep('read', 'done', `Reading ${file.name}`);

    // Step 2: Extract certificate.json
    updateStep('cert', 'active', 'Extracting certificate.json');
    await delay(300);

    const certFile = zip.file('certificate.json');
    if (!certFile) {
      updateStep('cert', 'fail', 'No certificate.json found in ZIP');
      setIsProcessing(false);
      return;
    }

    let cert: CertificateData;
    try {
      const certText = await certFile.async('text');
      cert = JSON.parse(certText);
    } catch {
      updateStep('cert', 'fail', 'Invalid certificate.json');
      setIsProcessing(false);
      return;
    }
    updateStep('cert', 'done', `Origin ID: ${cert.origin_id.substring(0, 8)}...`);

    // Step 3: Hash photo
    updateStep('hash', 'active', 'Hashing photo...');

    // Find the first image file in the ZIP
    const imageFiles = zip.file(/\.(jpg|jpeg|png)$/i);
    if (imageFiles.length === 0) {
      updateStep('hash', 'fail', 'No image file found in ZIP');
      setIsProcessing(false);
      return;
    }

    const photoBuffer = await imageFiles[0].async('arraybuffer');
    const hash = await computeSHA256(photoBuffer);
    setComputedHash(hash);
    updateStep('hash', 'done', `SHA-256: ${hash.substring(0, 16)}...`);

    // Step 4: Compare hashes
    updateStep('match', 'active', 'Comparing hash with certificate...');
    await delay(200);

    // Normalize cert hash — strip sha256: prefix if present
    const certHash = cert.hash.startsWith('sha256:') ? cert.hash.slice(7) : cert.hash;
    const hashesMatch = hash === certHash;

    if (!hashesMatch) {
      updateStep('match', 'fail', 'Hash does NOT match certificate');
      setHashMatch('mismatch');
      setResult({ status: 'mismatch' });
      setIsProcessing(false);
      return;
    }

    updateStep('match', 'done', 'Hash matches certificate ✓');
    setHashMatch('match');

    // Step 5: Check identity claim
    updateStep('claim', 'active', 'Checking identity claim...');
    await delay(200);

    if (cert.claimed_by && cert.signature) {
      updateStep('claim', 'done', 'Passkey claim found, signature present');
    } else {
      updateStep('claim', 'done', 'Anonymous origin (no passkey)');
    }

    // Step 6: Verify with registry
    await verifyWithApi(hash, cert);
    setIsProcessing(false);
  }

  // ─── Process certificate.json ───
  async function processCertificate(file: File) {
    setIsProcessing(true);
    setShowSteps(true);
    setResult(null);

    updateStep('read', 'active', 'Reading certificate.json...');
    await delay(200);

    let cert: CertificateData;
    try {
      const text = await file.text();
      cert = JSON.parse(text);
    } catch {
      updateStep('read', 'fail', 'Invalid certificate.json');
      setIsProcessing(false);
      return;
    }
    updateStep('read', 'done', `Origin ID: ${cert.origin_id.substring(0, 8)}...`);

    // Hide steps that don't apply
    hideStep('cert');
    hideStep('hash');
    hideStep('match');

    // Pre-fill manual form
    setManualOriginId(cert.origin_id);
    const certHash = cert.hash.startsWith('sha256:') ? cert.hash.slice(7) : cert.hash;
    setManualHash(certHash);

    // Check identity claim
    updateStep('claim', 'active', 'Checking identity claim...');
    await delay(200);

    if (cert.claimed_by && cert.signature) {
      updateStep('claim', 'done', 'Passkey claim found');
    } else {
      updateStep('claim', 'done', 'Anonymous origin');
    }

    // Verify with registry
    await verifyWithApi(certHash, cert);
    setIsProcessing(false);
  }

  // ─── Process single file ───
  async function processSingleFile(file: File) {
    setIsProcessing(true);
    setShowSteps(true);
    setResult(null);

    updateStep('read', 'active', `Reading ${file.name}...`);
    await delay(200);
    updateStep('read', 'done', `Reading ${file.name}`);

    hideStep('cert');

    updateStep('hash', 'active', 'Hashing file...');
    const buffer = await file.arrayBuffer();
    const hash = await computeSHA256(buffer);
    setComputedHash(hash);
    updateStep('hash', 'done', `SHA-256: ${hash.substring(0, 16)}...`);

    // Hide remaining steps — user needs to enter origin_id
    hideStep('match');
    hideStep('claim');
    hideStep('api');

    // Pre-fill manual form and open it
    setManualHash(hash);
    setManualOpen(true);
    setIsProcessing(false);
  }

  // ─── File handler ───
  const handleFile = useCallback(async (file: File) => {
    setSteps(createInitialSteps());
    setResult(null);
    setComputedHash(null);
    setHashMatch(null);

    const name = file.name.toLowerCase();
    const isZip = name.endsWith('.zip') || file.type === 'application/zip';
    const isCert = name === 'certificate.json';

    if (isZip) {
      await processZip(file);
    } else if (isCert) {
      await processCertificate(file);
    } else {
      await processSingleFile(file);
    }
  }, []);

  // ─── Manual verify ───
  const handleManualVerify = useCallback(async () => {
    if (manualHash.trim().length !== 64) return;

    setIsVerifying(true);
    setSteps(createInitialSteps());
    setShowSteps(true);

    hideStep('read');
    hideStep('cert');
    hideStep('hash');
    hideStep('match');
    hideStep('claim');

    await verifyWithApi(manualHash.trim());
    setIsVerifying(false);
  }, [manualHash, manualOriginId]);

  // ─── Render ───
  return (
    <div className="min-h-[100dvh] bg-ritual-bg text-ritual-cream font-garamond leading-relaxed">
      {/* Header */}
      <header className="py-7 px-8 flex items-center justify-between border-b border-ritual-gold/[0.06]">
        <Link to="/" className="font-serif font-light text-sm tracking-[5px] uppercase text-ritual-gold-muted no-underline hover:text-ritual-gold transition-colors">
          Umarise
        </Link>
        <span className="font-mono text-[10px] tracking-[3px] uppercase text-ritual-gold">
          Verify
        </span>
      </header>

      {/* Hero */}
      <section
        className="text-center py-20 px-8 relative"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, #1B2B1B, hsl(var(--ritual-bg)) 70%)',
        }}
      >
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-px bg-ritual-gold opacity-30" />

        <h1 className="font-serif font-light text-[38px] text-ritual-cream mb-4 tracking-wide">
          Verify an Origin
        </h1>
        <p className="text-lg text-ritual-cream-70 max-w-[420px] mx-auto mb-10 leading-relaxed">
          You received a ZIP with an origin claim. Drop it here to check if it's real, when it was registered, and download the Bitcoin proof.
        </p>

        {/* USP strip */}
        <div className="flex justify-center gap-12 flex-wrap max-w-[680px] mx-auto">
          {[
            { icon: '◇', title: 'Private', text: 'Your file stays in your browser. Only the hash is checked.' },
            { icon: '◈', title: 'Independent', text: 'The Bitcoin proof is yours. Verifiable without Umarise.' },
            { icon: '◉', title: 'One action', text: 'Drop the ZIP. We read the certificate and verify everything.' },
          ].map(usp => (
            <div key={usp.title} className="text-center max-w-[160px]">
              <div className="font-serif text-2xl text-ritual-gold mb-2 opacity-80">{usp.icon}</div>
              <div className="font-mono text-[9px] tracking-[3px] uppercase text-ritual-gold mb-1.5">{usp.title}</div>
              <p className="text-sm text-ritual-cream-40 leading-snug">{usp.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main */}
      <main className="max-w-[520px] mx-auto px-6 pt-14 pb-10">
        {/* Drop zone */}
        <VerifyDropZone onFile={handleFile} isProcessing={isProcessing} />

        {/* Process log */}
        <VerifyProcessLog steps={steps} visible={showSteps} />

        {/* Hash display */}
        {computedHash && (
          <VerifyHashDisplay hash={computedHash} matchStatus={hashMatch} />
        )}

        {/* Result */}
        {result && (
          <VerifyResult result={result} onReset={resetAll} />
        )}

        {/* Manual form (hidden when result is shown) */}
        {!result && (
          <VerifyManualForm
            isOpen={manualOpen}
            onToggle={() => setManualOpen(o => !o)}
            originId={manualOriginId}
            hash={manualHash}
            onOriginIdChange={setManualOriginId}
            onHashChange={setManualHash}
            onVerify={handleManualVerify}
            isVerifying={isVerifying}
          />
        )}
      </main>

      {/* How it works */}
      <section className="max-w-[520px] mx-auto px-6 pt-14 pb-14 border-t border-ritual-gold/[0.04]">
        <div className="font-mono text-[9px] tracking-[4px] uppercase text-ritual-gold-muted text-center mb-9">
          How it works
        </div>

        {[
          {
            num: '1',
            title: 'Drop',
            text: 'Drop the Origin ZIP you received. It contains the original file, a certificate with the Origin ID and hash, and optionally a Bitcoin proof. You can also drop just the photo or the certificate.json separately. Everything is read in your browser. Nothing is uploaded.',
          },
          {
            num: '2',
            title: 'Verify',
            text: 'We hash the file, compare it with the certificate, check the Umarise registry, and confirm when it was registered. If a passkey claim is present, we show who signed it.',
          },
          {
            num: '3',
            title: 'Keep the proof',
            text: (
              <>
                If the origin is anchored in Bitcoin, the result shows a download button:{' '}
                <strong className="text-ritual-cream">↓ Download proof.ots</strong>. This{' '}
                <a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" className="text-ritual-gold border-b border-ritual-gold/20 no-underline hover:border-ritual-gold/50 transition-colors">
                  OpenTimestamps
                </a>{' '}
                file is yours to keep. Verify it against the Bitcoin blockchain with the{' '}
                <a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" className="text-ritual-gold border-b border-ritual-gold/20 no-underline hover:border-ritual-gold/50 transition-colors">
                  OTS verifier
                </a>{' '}
                or any full node. No Umarise needed.
              </>
            ),
          },
        ].map(step => (
          <div key={step.num} className="flex gap-5 mb-6 items-start">
            <span className="font-serif font-light text-xl text-ritual-gold opacity-50 flex-shrink-0 w-6 text-right pt-px">
              {step.num}
            </span>
            <div className="flex-1">
              <div className="font-serif text-base text-ritual-cream mb-1">{step.title}</div>
              <p className="text-sm text-ritual-cream-40 leading-relaxed">{step.text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* What an origin proves */}
      <div className="max-w-[520px] mx-auto px-6 pb-20">
        <div className="p-5 border border-ritual-gold/[0.06] bg-ritual-surface/50">
          <div className="font-mono text-[8px] tracking-[3px] uppercase text-ritual-gold-muted mb-2.5">
            What an origin proves
          </div>
          <p className="text-[15px] text-ritual-cream mb-3 leading-relaxed">
            This file existed at the registered time. That fact is anchored in the Bitcoin blockchain and independently verifiable.
          </p>
          <p className="text-[13px] text-ritual-cream-40 leading-relaxed">
            If a passkey was used, it also proves someone claimed this origin with their device's secure enclave. A cryptographic signature, not a name or identity.
          </p>
          <p className="text-[13px] text-ritual-cream-40 leading-relaxed mt-3">
            An origin does not prove first creation or exclusivity. The same file could be registered elsewhere. The{' '}
            <a href="https://opentimestamps.org" target="_blank" rel="noopener noreferrer" className="text-ritual-gold border-b border-ritual-gold/20 no-underline">
              .ots proof
            </a>{' '}
            survives without Umarise. The origin metadata does not.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-ritual-gold/[0.04] flex justify-between items-center">
        <span className="font-mono text-[9px] tracking-wider text-ritual-gold/25">
          umarise.com/verify
        </span>
        <span className="font-mono text-[9px] tracking-wider text-ritual-gold/25">
          Earliest provable occurrence
        </span>
      </footer>
    </div>
  );
}
