import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import JSZip from 'jszip';
import { useKaartenbak, KaartenbakItem } from '@/contexts/KaartenbakContext';
import { loadArtifact } from '@/lib/artifactCache';
import { fetchOriginByToken } from '@/lib/coreApi';
import { toast } from 'sonner';
import HumanSignedBadge from './HumanSignedBadge';

/**
 * Kaartenbak — ephemeral bottom sheet panel.
 * Parses certificate.json from dropped ZIPs. Zero persistence.
 */
export default function Kaartenbak() {
  const navigate = useNavigate();
  const { items, isOpen, setOpen, addItems } = useKaartenbak();
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track which items have their artifact cached in IndexedDB
  const [cacheStatus, setCacheStatus] = useState<Record<string, boolean>>({});

  // Check cache status for all items when panel opens
  useEffect(() => {
    if (!isOpen || items.length === 0) return;
    const checkAll = async () => {
      const status: Record<string, boolean> = {};
      await Promise.all(items.map(async (item) => {
        const token = item.shortToken.toUpperCase();
        const cached = await loadArtifact(token);
        status[item.originId] = !!cached;
      }));
      setCacheStatus(status);
    };
    checkAll();
  }, [isOpen, items]);

  // Refresh pending items' status from registry when panel opens
  useEffect(() => {
    if (!isOpen) return;
    const pendingItems = items.filter(i => i.status === 'pending');
    if (pendingItems.length === 0) return;

    const refreshStatuses = async () => {
      const updates: KaartenbakItem[] = [];
      await Promise.all(pendingItems.map(async (item) => {
        try {
          const resolved = await fetchOriginByToken(item.shortToken);
          if (resolved?.proof_status === 'anchored') {
            updates.push({ ...item, status: 'anchored' });
          }
        } catch { /* ignore network errors */ }
      }));
      if (updates.length > 0) {
        addItems(updates);
      }
    };
    refreshStatuses();
  }, [isOpen]);

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
                <div className="flex items-center gap-3">
                  {/* + new capture */}
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate('/itexisted');
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'rgba(197,147,90,0.55)',
                      fontSize: 20,
                      fontWeight: 700,
                      lineHeight: 1,
                      padding: 0,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(197,147,90,0.9)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(197,147,90,0.55)'; }}
                    aria-label="Anchor another file"
                    title="New capture"
                  >
                    +
                  </button>
                  {/* Close */}
                  <svg viewBox="0 0 24 24" width={18} height={18}
                    style={{ cursor: 'pointer', opacity: 0.5, filter: 'drop-shadow(0 0 4px rgba(197,147,90,0.4))' }}
                    onClick={() => setOpen(false)}>
                    <circle cx="12" cy="12" r="10" fill="none" stroke="rgba(197,147,90,0.5)" strokeWidth="0.9" />
                    <circle cx="12" cy="12" r="3" fill="#C5935A" />
                  </svg>
                </div>
              </div>

              {/* Search */}
              {items.length > 0 && (
                <div className="relative mb-3">
                  <svg viewBox="0 0 20 20" width={14} height={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ opacity: 0.35 }}>
                    <circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="#C5935A" strokeWidth="1.5" />
                    <line x1="12.5" y1="12.5" x2="17" y2="17" stroke="#C5935A" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or date…"
                    style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 12,
                      color: '#F5F0E8',
                      background: 'rgba(197,147,90,0.06)',
                      border: '1px solid rgba(197,147,90,0.12)',
                      borderRadius: 6,
                      padding: '8px 10px 8px 28px',
                      width: '100%',
                      outline: 'none',
                    }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(197,147,90,0.3)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'rgba(197,147,90,0.12)'; }}
                  />
                </div>
              )}

              {/* Anchor list */}
              {items
                .filter((item) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  const name = (item.fileName || '').toLowerCase();
                  const date = formatDate(item.capturedAt).toLowerCase();
                  const token = item.shortToken.toLowerCase();
                  return name.includes(q) || date.includes(q) || token.includes(q);
                })
                .map((item) => (
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

                  {/* Cache status indicator */}
                  {item.status === 'anchored' && cacheStatus[item.originId] === false && (
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      letterSpacing: 1,
                      color: 'rgba(220,160,60,0.6)',
                      flexShrink: 0,
                    }} title="Original file not in cache — re-add on proof page">
                      ⚠
                    </span>
                  )}
                  {cacheStatus[item.originId] === true && (
                    <span style={{
                      fontFamily: "'DM Mono', monospace",
                      fontSize: 10,
                      color: 'rgba(127,186,106,0.6)',
                      flexShrink: 0,
                    }} title="Original file ready in cache">
                      ✓
                    </span>
                  )}

                  <HumanSignedBadge signed={item.deviceSigned ?? false} size="sm" />

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
