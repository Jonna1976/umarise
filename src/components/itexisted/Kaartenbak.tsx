import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { useKaartenbak, KaartenbakItem } from '@/contexts/KaartenbakContext';
import { toast } from 'sonner';

/**
 * Kaartenbak — ephemeral bottom sheet panel.
 * Parses certificate.json from dropped ZIPs. Zero persistence.
 */
export default function Kaartenbak() {
  const navigate = useNavigate();
  const { items, isOpen, setOpen, addItems } = useKaartenbak();
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseZips = useCallback(async (files: FileList | File[]) => {
    setProcessing(true);
    const parsed: KaartenbakItem[] = [];

    for (const file of Array.from(files)) {
      if (!file.name.toLowerCase().endsWith('.zip')) continue;
      try {
        const zip = await JSZip.loadAsync(file);
        const certFile = zip.file('certificate.json');
        if (!certFile) continue;
        const text = await certFile.async('text');
        const cert = JSON.parse(text);

        if (cert.origin_id && cert.hash) {
          const shortToken = cert.short_token || cert.origin_id.slice(0, 8).toUpperCase();
          // Try to find artifact filename from ZIP
          const artifactEntry = Object.keys(zip.files).find(n => n.startsWith('artifact.'));
          // Also check for original filenames in ZIP (non-standard files)
          const allFiles = Object.keys(zip.files).filter(n => 
            !['certificate.json', 'proof.ots', 'attestation.json', 'VERIFY.txt'].includes(n) && !n.startsWith('artifact.')
          );
          const fileName = allFiles[0] || (artifactEntry ? artifactEntry : null);
          parsed.push({
            originId: cert.origin_id,
            shortToken,
            hash: cert.hash,
            capturedAt: cert.captured_at || cert.timestamp || new Date().toISOString(),
            verifyUrl: `https://itexisted.app/proof/${shortToken}`,
            status: cert.bitcoin_block_height ? 'anchored' : 'pending',
            fileName: fileName || null,
          });
        }
      } catch (e) {
        console.warn('[Kaartenbak] Failed to parse ZIP:', file.name, e);
      }
    }

    if (parsed.length > 0) {
      addItems(parsed);
      toast.success(`${parsed.length} anchor${parsed.length > 1 ? 's' : ''} loaded`);
    } else if (Array.from(files).some(f => f.name.toLowerCase().endsWith('.zip'))) {
      toast.error('No valid certificates found in ZIP(s).');
    }
    setProcessing(false);
  }, [addItems]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) parseZips(e.dataTransfer.files);
  }, [parseZips]);

  const navigateToProof = useCallback((shortToken: string) => {
    const isItExistedDomain = window.location.hostname === 'itexisted.app';
    const path = isItExistedDomain ? `/proof/${shortToken}` : `/itexisted/proof/${shortToken}`;
    setOpen(false);
    navigate(path);
  }, [navigate, setOpen]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const day = d.getDate();
    const month = d.toLocaleDateString('en-GB', { month: 'short' });
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    return `${day} ${month} · ${h}:${m}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(5,10,5,0.6)' }}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto"
            style={{
              background: '#0a150a',
              borderTop: '1px solid rgba(197,147,90,0.15)',
              borderRadius: '14px 14px 0 0',
              maxHeight: '70vh',
              overflow: 'hidden',
              maxWidth: 468,
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div style={{ width: 28, height: 3, background: 'rgba(197,147,90,0.2)', borderRadius: 2 }} />
            </div>

            <div className="px-5 pb-7 overflow-y-auto" style={{ maxHeight: 'calc(70vh - 20px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <span style={{
                  fontFamily: "'DM Mono', monospace",
                  fontSize: 9,
                  letterSpacing: 4,
                  textTransform: 'uppercase' as const,
                  color: 'rgba(197,147,90,0.4)',
                }}>
                  {items.length > 0 ? 'Your anchors' : 'Drop ZIPs'}
                </span>
                <svg viewBox="0 0 24 24" width={18} height={18}
                  style={{ cursor: 'pointer', opacity: 0.5, filter: 'drop-shadow(0 0 4px rgba(197,147,90,0.4))' }}
                  onClick={() => setOpen(false)}>
                  <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(197,147,90,0.5)" strokeWidth="0.9" />
                  <circle cx="12" cy="12" r="3" fill="#C5935A" />
                </svg>
              </div>

              {/* Anchor list */}
              {items.map((item) => (
                <button
                  key={item.originId}
                  onClick={() => navigateToProof(item.shortToken)}
                  className="flex items-center gap-3 w-full text-left transition-all group"
                  style={{
                    padding: '14px 0',
                    background: 'none',
                    border: 'none',
                    borderBottom: '1px solid rgba(197,147,90,0.07)',
                    cursor: 'pointer',
                  }}
                >
                  {/* Mini circumpunct per item */}
                  {item.status === 'pending' ? (
                    <svg viewBox="0 0 20 20" width={16} height={16} style={{ flexShrink: 0 }}>
                      <circle cx="10" cy="10" r="3" fill="#C5935A" opacity={0.5}>
                        <animate attributeName="opacity" values="1;0.2;1" dur="2.5s" repeatCount="indefinite" />
                      </circle>
                    </svg>
                  ) : (
                    <svg viewBox="0 0 20 20" width={16} height={16}
                      style={{ flexShrink: 0, filter: 'drop-shadow(0 0 4px rgba(197,147,90,0.4))' }}>
                      <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(197,147,90,0.45)" strokeWidth="0.8" />
                      <circle cx="10" cy="10" r="3" fill="#C5935A" />
                    </svg>
                  )}

                  <span className="group-hover:text-[#F5F0E8] transition-colors" style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 14,
                    letterSpacing: 1.5,
                    color: item.status === 'pending' ? 'rgba(197,147,90,0.4)' : '#C5935A',
                    flexShrink: 0,
                  }}>
                    {item.shortToken}
                  </span>

                  {item.fileName && (
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 13,
                      color: 'rgba(245,240,232,0.35)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                      textAlign: 'right',
                    }}>
                      {item.fileName}
                    </span>
                  )}

                  {!item.fileName && <span style={{ flex: 1 }} />}

                  <span style={{
                    fontFamily: "'DM Mono', monospace",
                    fontSize: 13,
                    color: 'rgba(245,240,232,0.4)',
                  }}>
                    {formatDate(item.capturedAt)}
                  </span>
                </button>
              ))}

              {/* Empty state — drop zone only when no items */}
              {items.length === 0 && (
                <label
                  className="block w-full rounded-[8px] border-dashed border-[1.5px] p-5 text-center cursor-pointer transition-all"
                  style={{
                    borderColor: dragOver ? 'rgba(197,147,90,0.7)' : 'rgba(197,147,90,0.2)',
                    background: dragOver ? 'rgba(197,147,90,0.12)' : 'transparent',
                  }}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".zip"
                    multiple
                    onChange={(e) => { if (e.target.files?.length) parseZips(e.target.files); e.target.value = ''; }}
                  />
                  {processing ? (
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: 'rgba(245,240,232,0.4)', letterSpacing: 2 }}>
                      Reading…
                    </span>
                  ) : (
                    <>
                      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 16, color: '#F5F0E8', display: 'block' }}>
                        Drop your proof ZIPs here
                      </span>
                      <span style={{ fontFamily: "'EB Garamond', serif", fontSize: 13, fontStyle: 'italic', color: 'rgba(245,240,232,0.3)', display: 'block', marginTop: 4 }}>
                        The ZIPs are the database
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
