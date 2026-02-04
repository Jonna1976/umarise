import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { OriginButton } from '../components/OriginButton';
import { ArtifactFrame } from '../components/ArtifactFrame';

interface WallOfExistenceProps {
  onClose: () => void;
}

// Mock artifacts for demo
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
export function WallOfExistence({ onClose }: WallOfExistenceProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const lightRef = useRef<HTMLDivElement>(null);
  const [showBackupHint, setShowBackupHint] = useState(false);
  const [focusedArtifacts, setFocusedArtifacts] = useState<Set<string>>(new Set());

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

      {/* U button to close wall - top: 38px, left: 16px per walkthrough spec */}
      <OriginButton 
        onClick={onClose} 
        className="absolute top-[38px] left-[16px] z-50 opacity-70 hover:opacity-100 transition-opacity" 
      />

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
          {MOCK_ARTIFACTS.map((artifact) => (
            <ArtifactFrame
              key={artifact.id}
              artifact={artifact}
              isFocused={focusedArtifacts.has(artifact.id)}
            />
          ))}
          {/* End spacer */}
          <div className="w-[100px] flex-shrink-0" />
        </div>
      </div>
    </motion.div>
  );
}
