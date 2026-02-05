import { useEffect, useRef, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { OriginButton } from '../components/OriginButton';
import { ArtifactFrame } from '../components/ArtifactFrame';
import { BackupNudge } from '../components/BackupNudge';
import { useMarkCount } from '@/hooks/useMarkCount';
import { useMarks, DisplayMark } from '@/hooks/useMarks';
import { getDisplayImageUrl } from '@/hooks/useResolvedImageUrl';

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
const MOCK_ARTIFACTS = [
  { id: '1', type: 'warm' as const, date: '4 Feb 2026', hash: '884d5f17...553df0a3', origin: 'ORIGIN 1916F13F', size: 'large-landscape', offset: 'high' },
  { id: '2', type: 'text' as const, date: '28 Jan 2026', hash: 'f3d18ca2...91bb7e05', origin: 'ORIGIN 7B3E09A1', size: 'small-square', offset: 'low' },
  { id: '3', type: 'text' as const, date: '15 Jan 2026', hash: '6e0a44d7...c28f1b93', origin: 'ORIGIN 4D2F88C6', size: 'portrait', offset: 'high' },
  { id: '4', type: 'sketch' as const, date: '3 Jan 2026', hash: 'a1b2c3d4...e5f6g7h8', origin: 'ORIGIN E9A10B3C', size: 'landscape-small', offset: 'lower' },
  { id: '5', type: 'digital' as const, date: '21 Dec 2025', hash: '7c9e2f31...0a4b8d56', origin: 'ORIGIN 5F7C2D88', size: 'medium-square', offset: 'highest' },
  { id: '6', type: 'sound' as const, date: '14 Dec 2025', hash: 'b2e7a91c...4f0d3c88', origin: 'ORIGIN 0A8B4E17', size: 'tiny', offset: 'low' },
  { id: '7', type: 'organic' as const, date: '1 Dec 2025', hash: 'd4c6b8a2...1e3f5079', origin: 'ORIGIN 3C6D9F42', size: 'panoramic', offset: 'middle' },
];

/**
 * Screen 6: Wall of Existence
 * Your beginnings on the wall. Each frame resonates differently.
 * Tap any frame to open it. Hover to zoom. Long-press ∪ to backup.
 */
export function WallOfExistence({ onClose, onBulkExport }: WallOfExistenceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [showBackupHint, setShowBackupHint] = useState(false);
  const [focusedArtifacts, setFocusedArtifacts] = useState<Set<string>>(new Set());
  const { shouldShowBackupNudge, markBackupNudgeShown } = useMarkCount();
  const { marks, isLoading, importLegacyMarks } = useMarks();

  // Import legacy marks on first load
  useEffect(() => {
    importLegacyMarks();
  }, [importLegacyMarks]);

  // Convert marks to artifact display format with dual-source fallback
  const artifacts = useMemo(() => {
    if (marks.length === 0 && !isLoading) {
      // Show mock data when no marks exist
      return MOCK_ARTIFACTS;
    }

    return marks.map((mark, index) => {
      // Format date
      const date = mark.timestamp.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });

      // Format hash (first 8...last 8)
      const hash = mark.hash 
        ? `${mark.hash.substring(0, 8)}...${mark.hash.substring(mark.hash.length - 8)}`
        : 'pending...';

      // Format origin ID
      const origin = mark.originId.toUpperCase().replace('UM-', 'ORIGIN ');

      // Determine image source (dual-source fallback chain)
      let imageUrl: string | undefined;
      if (mark.thumbnailUrl) {
        // Priority 1: IndexedDB thumbnail (new v4 marks)
        imageUrl = mark.thumbnailUrl;
      } else if (mark.legacyImageUrl) {
        // Priority 2: Supabase image_url (legacy marks)
        imageUrl = getDisplayImageUrl(mark.legacyImageUrl);
      }
      // Priority 3: No image - ArtifactFrame will show hash+date only

      return {
        id: mark.id,
        type: mark.type,
        date,
        hash,
        origin,
        size: getSizeFromMark(mark),
        offset: OFFSET_PATTERN[index % OFFSET_PATTERN.length],
        imageUrl,
      };
    });
  }, [marks, isLoading]);

  // Initial scroll animation and backup hint
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    // Gentle scroll hint
    setTimeout(() => {
      scrollEl.scrollTo({ left: 45, behavior: 'smooth' });
      setTimeout(() => scrollEl.scrollTo({ left: 0, behavior: 'smooth' }), 600);
    }, 800);

    // Show backup hint
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

    // Parallax light source
    lightEl.style.transform = `translateX(calc(-50% + ${-scrollEl.scrollLeft * 0.15}px))`;

    // Focus effect on artifacts
    const artifacts = scrollEl.querySelectorAll('[data-artifact-id]');
    const scrollRect = scrollEl.getBoundingClientRect();
    const newFocused = new Set<string>();

    artifacts.forEach((artifact) => {
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
      className="min-h-screen bg-ritual-surface relative overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Atmospheric layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Vertical line texture */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'repeating-linear-gradient(90deg, transparent, hsl(var(--ritual-gold) / 0.006) 1px, transparent 2px, transparent 40px)',
          }}
        />
        
        {/* Radial gold light source (parallax) */}
        <div
          ref={lightRef}
          className="absolute -top-[10%] left-1/2 w-[200px] h-[200px] transition-transform duration-[600ms] ease-out"
          style={{
            transform: 'translateX(-50%)',
            background: 'radial-gradient(ellipse, hsl(var(--ritual-gold) / 0.06), transparent 70%)',
          }}
        />

        {/* Ceiling shadow */}
        <div 
          className="absolute top-0 left-0 right-0 h-[15%]"
          style={{ background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2), transparent)' }}
        />

        {/* Floor shadow */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[35%]"
          style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.1) 40%, transparent)' }}
        />

        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{ boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.5)' }}
        />

        {/* Dust particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-[2px] h-[2px] rounded-full pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${35 + Math.random() * 40}%`,
              background: 'hsl(var(--ritual-gold) / 0.12)',
            }}
            animate={{
              y: -80,
              x: 18,
              opacity: [0, 0.35, 0.15, 0],
            }}
            transition={{
              duration: 6 + Math.random() * 8,
              delay: Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* U button to close wall and return to capture - top: 38px, left: 16px per walkthrough spec */}
      <OriginButton 
        onClick={onClose} 
        className="absolute top-[38px] left-[16px] z-50 opacity-70 hover:opacity-100 transition-opacity" 
      />

      {/* New mark button - bottom center */}
      <motion.button
        onClick={onClose}
        className="absolute bottom-[60px] left-1/2 -translate-x-1/2 z-50
                   w-12 h-12 rounded-full flex items-center justify-center
                   transition-all duration-300"
        style={{
          background: 'hsl(var(--ritual-gold) / 0.08)',
          border: '1px solid hsl(var(--ritual-gold) / 0.25)',
        }}
        whileHover={{ 
          scale: 1.05,
          background: 'hsl(var(--ritual-gold) / 0.15)',
        }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <span className="font-playfair text-2xl text-ritual-gold opacity-60">+</span>
      </motion.button>

      {/* Backup hint */}
      <motion.p
        className="absolute top-[86px] left-4 z-50 font-garamond italic text-[10px] text-ritual-gold-muted pointer-events-none"
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
            // Loading state
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
              />
            ))
          )}
          {/* End spacer */}
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
    </motion.div>
  );
}
