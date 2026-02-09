import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import JSZip from 'jszip';
import { verifyOriginByHash, fetchProofStatus } from '@/lib/coreApi';
import { VerifyDropZone } from '@/components/verify/VerifyDropZone';
import { VerifyProcessLog, type StepState } from '@/components/verify/VerifyProcessLog';
import { VerifyHashDisplay } from '@/components/verify/VerifyHashDisplay';
import { VerifyResult, type VerifyResultData } from '@/components/verify/VerifyResult';
import { VerifyManualForm } from '@/components/verify/VerifyManualForm';
import { OriginMark } from '@/components/prototype/components/OriginMark';

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
    <div className="min-h-screen bg-landing-deep text-landing-cream">
      {/* Header */}
      <header className="border-b border-landing-muted/10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 text-landing-muted/50 hover:text-landing-cream transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </Link>
          <span className="font-serif text-lg text-landing-cream/80 flex items-center gap-2">
            <OriginMark size={16} state="anchored" variant="dark" />
            Umarise
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20">
        {/* Title */}
        <div className="mb-16">
          <h1 className="font-serif text-3xl md:text-4xl text-landing-cream mb-2">
            Verify an Origin
          </h1>
          <p className="text-landing-muted/50 text-sm uppercase tracking-wide">
            Verify the registration, check when it was recorded, download the Bitcoin proof
          </p>
        </div>

        {/* USP strip */}
        <div className="space-y-12 text-landing-muted/80 leading-relaxed">
          <section>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {[
                { title: 'Private', text: 'Your file stays in your browser. Only the hash is checked.' },
                { title: 'Independent', text: 'The Bitcoin proof is yours. Verifiable without Umarise.' },
                { title: 'One action', text: 'Drop the ZIP. The certificate is read and the registration is verified.' },
              ].map(usp => (
                <div key={usp.title} className="bg-landing-muted/5 border border-landing-muted/10 rounded p-4">
                  <h3 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-2">
                    {usp.title}
                  </h3>
                  <p className="text-landing-muted/60 text-sm">{usp.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Drop zone */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              Drop your file
            </h2>
            <div className="max-w-xl mx-auto">
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
            </div>
          </section>

          {/* How it works */}
          <section>
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              How it works
            </h2>

            <ul className="space-y-4 pl-4">
              {[
                {
                  label: 'Drop',
                  text: 'Drop the Origin ZIP you received. It contains the original file, a certificate with the Origin ID and hash, and optionally a Bitcoin proof. You can also drop just the photo or the certificate.json separately. Everything is read in your browser. Nothing is uploaded.',
                },
                {
                  label: 'Verify',
                  text: 'The file is hashed in your browser and compared with the certificate. The hash is checked against the Umarise registry to confirm when it was recorded. If a passkey claim is present, the signature is displayed.',
                },
                {
                  label: 'Keep the proof',
                  text: 'After verification, if the origin is anchored in Bitcoin, a button appears in the result to download the OpenTimestamps proof file. This .ots file is yours to keep forever. You can verify it independently against the Bitcoin blockchain with the OTS verifier or any full node. No Umarise needed.',
                },
              ].map(step => (
                <li key={step.label}>
                  <span className="text-landing-copper">{step.label}</span>
                  <span className="text-landing-muted/50 ml-2">:</span>
                  <span className="ml-2">{step.text}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* What an origin proves */}
          <section className="border-l-2 border-landing-copper/30 pl-6">
            <h2 className="text-sm font-medium tracking-wide text-landing-muted/70 uppercase mb-4">
              What an origin proves
            </h2>
            <p className="text-landing-cream/90 mb-4">
              This file existed at the registered time. That fact is anchored in the Bitcoin blockchain and independently verifiable.
            </p>
            <p className="text-landing-muted/60 mb-4">
              If a passkey was used, it also proves someone claimed this origin with their device's secure enclave. A cryptographic signature, not a name or identity.
            </p>
            <p className="text-landing-muted/50 text-sm">
              An origin does not prove first creation or exclusivity. The same file could be registered elsewhere. The .ots proof survives without Umarise. The origin metadata does not.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-landing-muted/10 py-6 text-center text-sm text-landing-muted/40">
        <p>© {new Date().getFullYear()} Umarise</p>
      </footer>
    </div>
  );
}
