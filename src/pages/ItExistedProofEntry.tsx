import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import JSZip from 'jszip';
import { toast } from 'sonner';
import Circumpunct from '@/components/itexisted/Circumpunct';
import Kaartenbak from '@/components/itexisted/Kaartenbak';
import { fetchOriginByToken, fetchProofStatus } from '@/lib/coreApi';
import { isWebAuthnSupported, isPlatformAuthenticatorAvailable, signHash } from '@/lib/webauthn';
import { getPasskeyCredential } from '@/lib/passkeyStore';
import { getDeviceId } from '@/lib/deviceId';
import { supabase } from '@/integrations/supabase/client';
import InlineVerify from '@/components/itexisted/InlineVerify';

interface CertificateData {
  origin_id: string;
  short_token: string;
  hash: string;
  hash_algorithm: string;
  captured_at: string;
  certificate_version?: string;
  identity_binding?: {
    device_signature?: string;
    device_public_key?: string;
  };
}

interface ProofInfo {
  certificate: CertificateData;
  proofStatus: 'pending' | 'anchored';
  bitcoinBlockHeight: number | null;
  zipBlob: Blob;
  zipName: string;
}

export default function ItExistedProofEntry() {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proofInfo, setProofInfo] = useState<ProofInfo | null>(null);
  const [revokeState, setRevokeState] = useState<'idle' | 'confirm' | 'signing' | 'done' | 'error'>('idle');
  const [isAlreadyRevoked, setIsAlreadyRevoked] = useState(false);

  const handleZipDrop = useCallback(async (file: File) => {
    if (!file.name.endsWith('.zip')) {
      toast.error('Drop a proof ZIP file.');
      return;
    }

    setLoading(true);
    try {
      const zip = await JSZip.loadAsync(await file.arrayBuffer());
      const certFile = zip.file('certificate.json');
      if (!certFile) {
        toast.error('No certificate.json found in ZIP.');
        setLoading(false);
        return;
      }

      const certText = await certFile.async('text');
      const cert: CertificateData = JSON.parse(certText);

      if (!cert.origin_id || !cert.hash) {
        toast.error('Invalid certificate format.');
        setLoading(false);
        return;
      }

      // Resolve from registry
      const token = cert.short_token || cert.origin_id.slice(0, 8).toUpperCase();
      let proofStatus: 'pending' | 'anchored' = 'pending';
      let bitcoinBlockHeight: number | null = null;

      try {
        const resolved = await fetchOriginByToken(token);
        if (resolved) {
          proofStatus = resolved.proof_status === 'anchored' ? 'anchored' : 'pending';
          bitcoinBlockHeight = resolved.bitcoin_block_height ?? null;
        }
      } catch {
        // Fallback: try proof status directly
        try {
          const proof = await fetchProofStatus(cert.origin_id);
          proofStatus = proof.status === 'anchored' ? 'anchored' : 'pending';
          bitcoinBlockHeight = proof.bitcoinBlockHeight;
        } catch { /* remain pending */ }
      }

      // Check if already revoked by this device
      const deviceUserId = getDeviceId();
      if (deviceUserId) {
        const { data } = await supabase
          .from('page_association_revocations')
          .select('id')
          .eq('page_id', cert.origin_id)
          .eq('device_user_id', deviceUserId)
          .limit(1);
        if (data && data.length > 0) {
          setIsAlreadyRevoked(true);
        }
      }

      setProofInfo({
        certificate: cert,
        proofStatus,
        bitcoinBlockHeight,
        zipBlob: file,
        zipName: file.name,
      });
    } catch (e) {
      console.error('[ProofEntry] ZIP parse error:', e);
      toast.error('Could not read ZIP file.');
    }
    setLoading(false);
  }, []);

  const handleRevoke = async () => {
    if (!proofInfo) return;
    setRevokeState('signing');

    try {
      // Require passkey
      if (!isWebAuthnSupported() || !(await isPlatformAuthenticatorAvailable())) {
        toast.error('Passkey not available on this device.');
        setRevokeState('error');
        return;
      }

      const credential = getPasskeyCredential();
      if (!credential) {
        toast.error('No passkey registered on this device. Only the original device can revoke.');
        setRevokeState('error');
        return;
      }

      // Sign the origin_id as proof of device ownership
      const sig = await signHash(credential.credentialId, proofInfo.certificate.origin_id);
      if (!sig) {
        toast.error('Passkey signing cancelled.');
        setRevokeState('idle');
        return;
      }

      // Insert revocation record
      const deviceUserId = getDeviceId();
      if (!deviceUserId) {
        toast.error('Device identity not found.');
        setRevokeState('error');
        return;
      }

      const { error } = await supabase
        .from('page_association_revocations')
        .insert({
          page_id: proofInfo.certificate.origin_id,
          device_user_id: deviceUserId,
        });

      if (error) {
        console.error('[Revoke] Insert error:', error);
        toast.error('Revocation failed.');
        setRevokeState('error');
        return;
      }

      setRevokeState('done');
      setIsAlreadyRevoked(true);
      toast.success('Association released.', {
        description: 'The origin remains verifiable. Your involvement is withdrawn.',
      });
    } catch (e) {
      console.error('[Revoke] Error:', e);
      toast.error('Passkey signing failed.');
      setRevokeState('error');
    }
  };

  const date = proofInfo
    ? new Date(proofInfo.certificate.captured_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '';
  const time = proofInfo
    ? `${new Date(proofInfo.certificate.captured_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} UTC`
    : '';

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

          {!proofInfo ? (
            /* ── ZIP DROP ZONE ── */
            <div className="w-full flex flex-col items-center text-center">
              <h1 className="font-playfair text-[28px] md:text-[36px] font-normal mb-3"
                style={{ color: '#f0ead6', lineHeight: 1.25 }}>
                Your proof
              </h1>
              <p className="font-garamond italic text-[18px] mb-10"
                style={{ color: 'rgba(245,240,232,0.45)' }}>
                Drop your proof ZIP to view details.
              </p>

              <label
                className="block w-full rounded-[8px] border-dashed border-[1.5px] p-10 text-center cursor-pointer transition-all"
                style={{
                  borderColor: dragOver ? 'rgba(197,147,90,0.7)' : 'rgba(197,147,90,0.3)',
                  background: dragOver ? 'rgba(197,147,90,0.12)' : 'rgba(197,147,90,0.04)',
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleZipDrop(f); }}
              >
                <input type="file" className="hidden" accept=".zip"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleZipDrop(f); e.target.value = ''; }} />
                {loading ? (
                  <p className="font-mono text-[14px] tracking-[2px] uppercase"
                    style={{ color: 'rgba(245,240,232,0.5)' }}>Reading ZIP…</p>
                ) : (
                  <>
                    {/* Document icon */}
                    <svg viewBox="0 0 24 24" width={32} height={32} className="mx-auto mb-4"
                      style={{ opacity: 0.3 }}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"
                        fill="none" stroke="rgba(197,147,90,0.6)" strokeWidth="1.2" />
                      <path d="M14 2v6h6" fill="none" stroke="rgba(197,147,90,0.6)" strokeWidth="1.2" />
                      <path d="M9 15l2 2 4-4" fill="none" stroke="rgba(197,147,90,0.6)" strokeWidth="1.2" />
                    </svg>
                    <p className="font-garamond text-[18px]"
                      style={{ color: 'rgba(245,240,232,0.6)' }}>
                      Drop proof ZIP
                    </p>
                    <p className="font-mono text-[10px] tracking-[2px] uppercase mt-2"
                      style={{ color: 'rgba(245,240,232,0.2)' }}>
                      or tap to select
                    </p>
                  </>
                )}
              </label>

              <button
                onClick={() => {
                  const isItExisted = window.location.hostname === 'itexisted.app';
                  navigate(isItExisted ? '/' : '/itexisted');
                }}
                className="mt-10 font-mono text-[10px] tracking-[3px] uppercase transition-colors"
                style={{ color: 'rgba(245,240,232,0.2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Anchor a file
              </button>
            </div>
          ) : (
            /* ── PROOF DETAILS ── */
            <div className="w-full">
              <h1 className="font-playfair text-[28px] md:text-[36px] font-normal mb-2"
                style={{ color: '#f0ead6', lineHeight: 1.25 }}>
                {proofInfo.proofStatus === 'anchored' ? (
                  <>Origin <span style={{ color: '#C5935A' }}>anchored</span></>
                ) : (
                  <>Origin <span style={{ color: 'rgba(197,147,90,0.6)' }}>pending</span></>
                )}
              </h1>
              <p className="font-garamond italic text-[17px] mb-8"
                style={{ color: 'rgba(245,240,232,0.45)' }}>
                Proof extracted from your ZIP.
              </p>

              {/* Record details */}
              <div className="w-full mb-8">
                <div className="flex justify-between items-baseline mb-2.5">
                  <span className="font-mono text-[12px] tracking-[3px] uppercase"
                    style={{ color: 'rgba(197,147,90,0.55)' }}>Origin ID</span>
                  <span className="font-mono text-[12px] tracking-[1px]"
                    style={{ color: '#C5935A' }}>{proofInfo.certificate.short_token}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2.5">
                  <span className="font-mono text-[12px] tracking-[3px] uppercase"
                    style={{ color: 'rgba(197,147,90,0.55)' }}>Date</span>
                  <span className="font-mono text-[12px]"
                    style={{ color: 'rgba(245,240,232,0.65)' }}>{date} · {time}</span>
                </div>
                <div className="flex justify-between items-baseline mb-2.5">
                  <span className="font-mono text-[12px] tracking-[3px] uppercase"
                    style={{ color: 'rgba(197,147,90,0.55)' }}>Status</span>
                  <span className="font-mono text-[12px]"
                    style={{ color: proofInfo.proofStatus === 'anchored' ? '#7fba6a' : 'rgba(197,147,90,0.7)' }}>
                    {proofInfo.proofStatus === 'anchored'
                      ? `✓ anchored${proofInfo.bitcoinBlockHeight ? ` · block ${proofInfo.bitcoinBlockHeight.toLocaleString()}` : ''}`
                      : 'pending'}
                  </span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="font-mono text-[12px] tracking-[3px] uppercase pt-0.5"
                    style={{ color: 'rgba(197,147,90,0.55)' }}>Hash</span>
                  <span className="font-mono text-[11px] text-right break-all"
                    style={{ color: 'rgba(245,240,232,0.4)', lineHeight: 1.7, maxWidth: 260 }}>
                    {proofInfo.certificate.hash}
                  </span>
                </div>
              </div>

              {/* ZIP Verification */}
              <div className="w-full mb-6" style={{ borderTop: '1px solid rgba(197,147,90,0.2)' }} />
              <div className="w-full mb-6 rounded-[8px] p-4"
                style={{ background: 'rgba(74,124,89,0.06)', border: '1px solid rgba(74,124,89,0.25)' }}>
                <InlineVerify
                  expectedOriginId={proofInfo.certificate.origin_id}
                  expectedShortToken={proofInfo.certificate.short_token}
                  autoVerifyBlob={proofInfo.zipBlob}
                  autoVerifyName={proofInfo.zipName}
                />
              </div>

              {/* Navigate to full proof page */}
              <button
                onClick={() => {
                  const isItExisted = window.location.hostname === 'itexisted.app';
                  const path = isItExisted
                    ? `/proof/${proofInfo.certificate.short_token}`
                    : `/itexisted/proof/${proofInfo.certificate.short_token}`;
                  navigate(path);
                }}
                className="w-full font-mono text-[12px] tracking-[3px] uppercase py-3 text-center transition-colors mb-8"
                style={{ color: 'rgba(197,147,90,0.6)', background: 'none', border: 'none', cursor: 'pointer' }}>
                → Open full proof page
              </button>

              {/* ── REVOKE SECTION ── */}
              <div className="w-full" style={{ borderTop: '1px solid rgba(245,240,232,0.06)' }} />
              <div className="w-full pt-6">
                {isAlreadyRevoked || revokeState === 'done' ? (
                  <div className="rounded-[8px] p-4"
                    style={{ background: 'rgba(197,147,90,0.04)', border: '1px solid rgba(197,147,90,0.15)' }}>
                    <p className="font-mono text-[11px] tracking-[3px] uppercase mb-2"
                      style={{ color: 'rgba(197,147,90,0.6)' }}>Association released</p>
                    <p className="font-garamond text-[15px] italic"
                      style={{ color: 'rgba(245,240,232,0.4)' }}>
                      The origin remains verifiable. Your involvement is withdrawn.
                    </p>
                  </div>
                ) : revokeState === 'confirm' ? (
                  <div className="rounded-[8px] p-4"
                    style={{ background: 'rgba(245,240,232,0.02)', border: '1px solid rgba(245,240,232,0.08)' }}>
                    <p className="font-garamond text-[17px] mb-2"
                      style={{ color: 'rgba(245,240,232,0.7)' }}>Release this origin?</p>
                    <p className="font-garamond text-[15px] italic mb-4"
                      style={{ color: 'rgba(245,240,232,0.35)' }}>
                      Your passkey will confirm this is your device. The origin stays recorded.
                    </p>
                    <div className="flex gap-4">
                      <button
                        onClick={handleRevoke}
                        disabled={revokeState === 'signing' as any}
                        className="font-mono text-[12px] tracking-[2px] uppercase py-2 px-4 rounded-[6px] transition-all"
                        style={{ border: '1px solid rgba(197,147,90,0.3)', background: 'rgba(197,147,90,0.08)', color: 'rgba(197,147,90,0.7)', cursor: 'pointer' }}>
                        Sign &amp; release
                      </button>
                      <button
                        onClick={() => setRevokeState('idle')}
                        className="font-mono text-[12px] tracking-[2px] uppercase transition-colors"
                        style={{ color: 'rgba(245,240,232,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : revokeState === 'signing' ? (
                  <p className="font-mono text-[12px] tracking-[2px] uppercase"
                    style={{ color: 'rgba(197,147,90,0.5)' }}>
                    Waiting for passkey…
                  </p>
                ) : revokeState === 'error' ? (
                  <div>
                    <p className="font-mono text-[12px] tracking-[2px] uppercase mb-2"
                      style={{ color: 'rgba(220,80,60,0.7)' }}>
                      Revocation failed
                    </p>
                    <button
                      onClick={() => setRevokeState('idle')}
                      className="font-mono text-[11px] tracking-[2px] uppercase transition-colors"
                      style={{ color: 'rgba(245,240,232,0.3)', background: 'none', border: 'none', cursor: 'pointer' }}>
                      Try again
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setRevokeState('confirm')}
                    className="font-mono text-[11px] tracking-[2px] uppercase transition-colors"
                    style={{ color: 'rgba(245,240,232,0.2)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Release association
                  </button>
                )}
              </div>

              {/* Back */}
              <div className="w-full mt-10 text-center">
                <button
                  onClick={() => { setProofInfo(null); setRevokeState('idle'); setIsAlreadyRevoked(false); }}
                  className="font-mono text-[10px] tracking-[3px] uppercase transition-colors"
                  style={{ color: 'rgba(245,240,232,0.15)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  Drop another ZIP
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </>
  );
}
