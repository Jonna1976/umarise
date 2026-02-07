/**
 * Screen 7: Marked Origins
 * 
 * Per briefing sectie 4 (S7):
 * - Title: "Marked Origins" — 20px Playfair 300, cream, centered, padding-top 44px
 * - Hint: "Tap an origin to view, save as ZIP, or link your passkey." — 12px Garamond italic
 * - Origins: horizontal scrolling, museum-style, each in own frame with date below
 * - Detail view on tap (handled by MarkDetailModal)
 * - U button top-left for close. Long-press for backup.
 * - NO "New origin" button. NO "Prove card". NO bulk-passkey.
 */

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { OriginButton } from '../components/OriginButton';
import { ArtifactFrame } from '../components/ArtifactFrame';
import { BackupNudge } from '../components/BackupNudge';
import { MarkDetailModal } from '../components/MarkDetailModal';
import { useMarkCount } from '@/hooks/useMarkCount';
import { useMarks, DisplayMark } from '@/hooks/useMarks';
import { getDisplayImageUrl } from '@/hooks/useResolvedImageUrl';

interface WallArtifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  date: string;
  hash: string;
  origin: string;
  size: string;
  offset: string;
  imageUrl?: string;
  otsStatus: 'pending' | 'submitted' | 'anchored';
  timestamp: Date;
  originId: string;
}

interface WallOfExistenceProps {
  onClose: () => void;
  onBulkExport?: () => void;
}

// Size mapping based on aspect ratio
function getSizeFromMark(mark: DisplayMark): string {
  switch (mark.sizeClass) {
    case 'large': return 'large-landscape';
    case 'small': return 'portrait';
    default: return 'medium-square';
  }
}

// Offset pattern for visual variety
const OFFSET_PATTERN = ['high', 'low', 'middle', 'lower', 'highest'] as const;

// Fallback mock artifacts for demo mode when no marks exist
const MOCK_ARTIFACTS: WallArtifact[] = [
  { id: '1', type: 'warm', date: '4 Feb 2026', hash: '884d5f17553df0a3884d5f17553df0a3884d5f17553df0a3', origin: 'ORIGIN 1916F13F', size: 'large-landscape', offset: 'high', otsStatus: 'anchored', timestamp: new Date('2026-02-04'), originId: 'UM-1916F13F' },
  { id: '2', type: 'text', date: '28 Jan 2026', hash: 'f3d18ca291bb7e05f3d18ca291bb7e05f3d18ca291bb7e05', origin: 'ORIGIN 7B3E09A1', size: 'small-square', offset: 'low', otsStatus: 'pending', timestamp: new Date('2026-01-28'), originId: 'UM-7B3E09A1' },
  { id: '3', type: 'text', date: '15 Jan 2026', hash: '6e0a44d7c28f1b936e0a44d7c28f1b936e0a44d7c28f1b93', origin: 'ORIGIN 4D2F88C6', size: 'portrait', offset: 'high', otsStatus: 'submitted', timestamp: new Date('2026-01-15'), originId: 'UM-4D2F88C6' },
  { id: '4', type: 'sketch', date: '3 Jan 2026', hash: 'a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8a1b2c3d4e5f6a7b8', origin: 'ORIGIN E9A10B3C', size: 'landscape-small', offset: 'lower', otsStatus: 'anchored', timestamp: new Date('2026-01-03'), originId: 'UM-E9A10B3C' },
  { id: '5', type: 'digital', date: '21 Dec 2025', hash: '7c9e2f310a4b8d567c9e2f310a4b8d567c9e2f310a4b8d56', origin: 'ORIGIN 5F7C2D88', size: 'medium-square', offset: 'highest', otsStatus: 'pending', timestamp: new Date('2025-12-21'), originId: 'UM-5F7C2D88' },
  { id: '6', type: 'sound', date: '14 Dec 2025', hash: 'b2e7a91c4f0d3c88b2e7a91c4f0d3c88b2e7a91c4f0d3c88', origin: 'ORIGIN 0A8B4E17', size: 'tiny', offset: 'low', otsStatus: 'anchored', timestamp: new Date('2025-12-14'), originId: 'UM-0A8B4E17' },
  { id: '7', type: 'organic', date: '1 Dec 2025', hash: 'd4c6b8a21e3f5079d4c6b8a21e3f5079d4c6b8a21e3f5079', origin: 'ORIGIN 3C6D9F42', size: 'panoramic', offset: 'middle', otsStatus: 'pending', timestamp: new Date('2025-12-01'), originId: 'UM-3C6D9F42' },
];

export function WallOfExistence({ onClose, onBulkExport }: WallOfExistenceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [showBackupHint, setShowBackupHint] = useState(false);
  const [focusedArtifacts, setFocusedArtifacts] = useState<Set<string>>(new Set());
  const [selectedMark, setSelectedMark] = useState<WallArtifact | null>(null);
  const { shouldShowBackupNudge, markBackupNudgeShown } = useMarkCount();
  const { marks, isLoading, importLegacyMarks } = useMarks();

  const handleArtifactClick = useCallback((artifact: WallArtifact) => {
    setSelectedMark(artifact);
  }, []);

  // Import legacy marks on first load
  useEffect(() => {
    importLegacyMarks();
  }, [importLegacyMarks]);

  // Convert marks to artifact display format
  const artifacts = useMemo(() => {
    if (marks.length === 0 && !isLoading) {
      return MOCK_ARTIFACTS;
    }

    return marks.map((mark, index) => {
      const date = mark.timestamp.toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      });
      const hash = mark.hash 
        ? `${mark.hash.substring(0, 8)}...${mark.hash.substring(mark.hash.length - 8)}`
        : 'pending...';
      const origin = mark.originId.toUpperCase().replace('UM-', 'ORIGIN ');

      let imageUrl: string | undefined;
      if (mark.thumbnailUrl) {
        imageUrl = mark.thumbnailUrl;
      } else if (mark.legacyImageUrl) {
        imageUrl = getDisplayImageUrl(mark.legacyImageUrl);
      }

      return {
        id: mark.id,
        type: mark.type,
        date,
        hash,
        origin,
        size: getSizeFromMark(mark),
        offset: OFFSET_PATTERN[index % OFFSET_PATTERN.length],
        imageUrl,
        otsStatus: mark.otsStatus,
        timestamp: mark.timestamp,
        originId: mark.originId,
      } as WallArtifact;
    });
  }, [marks, isLoading]);

  // Scroll hint and backup hint
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    setTimeout(() => {
      scrollEl.scrollTo({ left: 45, behavior: 'smooth' });
      setTimeout(() => scrollEl.scrollTo({ left: 0, behavior: 'smooth' }), 600);
    }, 800);

    setTimeout(() => {
      setShowBackupHint(true);
      setTimeout(() => setShowBackupHint(false), 3000);
    }, 2000);
  }, []);

  // Scroll handler for parallax and focus effects
  const handleScroll = () => {
    const scrollEl = scrollRef.current;
    const lightEl = lightRef.current;
    if (!scrollEl || !lightEl) return;

    lightEl.style.transform = `translateX(calc(-50% + ${-scrollEl.scrollLeft * 0.15}px))`;

    const artifactEls = scrollEl.querySelectorAll('[data-artifact-id]');
    const scrollRect = scrollEl.getBoundingClientRect();
    const newFocused = new Set<string>();

    artifactEls.forEach((artifact) => {
      const rect = artifact.getBoundingClientRect();
      const center = rect.left + rect.width / 2 - scrollRect.left;
      const distance = Math.abs(center - scrollRect.width / 2);
      const maxDistance = scrollRect.width * 0.6;

      if (distance < maxDistance) {
        newFocused.add(artifact.getAttribute('data-artifact-id') || '');
      }
    });

    setFocusedArtifacts(newFocused);
  };

  return (
    <motion.div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Atmospheric layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, hsl(var(--ritual-gold) / 0.006) 1px, transparent 2px, transparent 40px)',
          }}
        />
        <div
          ref={lightRef}
          className="absolute -top-[10%] left-1/2 w-[200px] h-[200px] transition-transform duration-[600ms] ease-out"
          style={{
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, hsl(var(--ritual-gold) / 0.06), transparent 70%)',
          }}
        />
        <div 
          className="absolute top-0 left-0 right-0 h-[15%]"
          style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), transparent)' }}
        />
        <div 
          className="absolute bottom-0 left-0 right-0 h-[35%]"
          style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 40%, transparent)' }}
        />
        <div 
          className="absolute inset-0"
          style={{ boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.5)' }}
        />
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${35 + Math.random() * 40}%`,
              background: 'hsl(var(--ritual-gold) / 0.12)',
            }}
            animate={{ y: -80, x: 18, opacity: [0, 0.35, 0.15, 0] }}
            transition={{
              duration: 6 + Math.random() * 8,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* U button — close wall, long-press for backup */}
      <OriginButton 
        onClick={onClose} 
        className="absolute top-[38px] left-[16px] z-50 opacity-70 hover:opacity-100 transition-opacity" 
      />

      {/* Title: "Marked Origins" — 20px Playfair 300, cream, centered, pt-44px */}
      <motion.div
        className="absolute top-0 left-0 right-0 z-20 flex flex-col items-center pt-[44px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h1 
          className="font-playfair text-[20px] text-ritual-cream"
          style={{ fontWeight: 300 }}
        >
          Marked Origins
        </h1>

        {/* Hint — 12px EB Garamond italic, low opacity */}
        <p 
          className="font-garamond italic text-[12px] mt-2 text-center px-8"
          style={{ color: 'hsl(var(--ritual-cream) / 0.3)' }}
        >
          Tap an origin to view, save as ZIP, or link your passkey.
        </p>
      </motion.div>

      {/* Backup hint (appears on long-press ∪) */}
      <motion.p
        className="absolute top-[86px] left-4 z-50 font-garamond italic text-[10px] pointer-events-none"
        style={{ color: 'hsl(var(--ritual-gold-muted))' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: showBackupHint ? 0.5 : 0 }}
        transition={{ duration: 0.6 }}
      >
        long-press ∪ to backup
      </motion.p>

      {/* Scrolling artifact track */}
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-x-auto overflow-y-hidden z-10 scrollbar-hide"
        onScroll={handleScroll}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex items-center h-full px-[60px] min-w-max gap-[50px]">
          {isLoading ? (
            <div className="flex items-center justify-center w-full">
              <motion.div
                className="w-3 h-3 rounded-full bg-ritual-gold"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            </div>
          ) : (
            artifacts.map((artifact) => (
              <ArtifactFrame
                key={artifact.id}
                artifact={artifact}
                isFocused={focusedArtifacts.has(artifact.id)}
                onClick={() => handleArtifactClick(artifact)}
              />
            ))
          )}
          <div className="w-[100px] flex-shrink-0" />
        </div>
      </div>

      {/* Backup nudge - appears once after 3rd mark */}
      {shouldShowBackupNudge && (
        <BackupNudge
          onDismiss={markBackupNudgeShown}
          onExport={() => {
            onBulkExport?.();
            markBackupNudgeShown();
          }}
        />
      )}

      {/* Mark detail modal */}
      {selectedMark && (
        <MarkDetailModal
          mark={{
            id: selectedMark.id,
            originId: selectedMark.originId,
            hash: selectedMark.hash.includes('...') 
              ? marks.find(m => m.id === selectedMark.id)?.hash || selectedMark.hash
              : selectedMark.hash,
            timestamp: selectedMark.timestamp,
            otsStatus: selectedMark.otsStatus,
            imageUrl: selectedMark.imageUrl,
          }}
          onClose={() => setSelectedMark(null)}
        />
      )}
    </motion.div>
  );
}
