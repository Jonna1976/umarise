import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Artifact {
  id: string;
  type: 'warm' | 'text' | 'sound' | 'digital' | 'organic' | 'sketch';
  origin: string;
  date: Date;
  hash: string;
  imageUrl: string | null;
}

interface ReleaseScreenProps {
  artifact: Artifact;
  onComplete: () => void;
}

/**
 * Screen 4: Release
 * The certificate of beginning.
 * Full resolution stays on device. Only the proof leaves.
 */
export function ReleaseScreen({ artifact, onComplete }: ReleaseScreenProps) {
  const [showCard, setShowCard] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [showNote, setShowNote] = useState(false);

  // Cascade animation timing
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowCard(true), 0),
      setTimeout(() => setShowTitle(true), 600),
      setTimeout(() => setShowOrigin(true), 1000),
      setTimeout(() => setShowDate(true), 1200),
      setTimeout(() => setShowLine(true), 1500),
      setTimeout(() => setShowHash(true), 1800),
      setTimeout(() => setShowNote(true), 2200),
      setTimeout(onComplete, 4500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) + ' · ' + date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center bg-ritual-surface"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Certificate card */}
      <motion.div
        className="w-[280px] rounded-[14px] p-9 pt-11 text-center relative overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, rgba(30, 45, 30, 0.9), rgba(20, 32, 20, 0.95))',
          border: '1px solid hsl(var(--ritual-gold) / 0.15)',
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ 
          opacity: showCard ? 1 : 0, 
          scale: showCard ? 1 : 0.97 
        }}
        transition={{ duration: 0.6 }}
      >
        {/* Radial gold glow behind card */}
        <div 
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 30%, hsl(var(--ritual-gold) / 0.04), transparent 50%)',
          }}
        />

        {/* U symbol - 56x56 */}
        <div className="w-14 h-14 mx-auto mb-4">
          <svg viewBox="0 0 56 56" width="56" height="56">
            <circle 
              cx="28" 
              cy="28" 
              r="23" 
              fill="none" 
              stroke="hsl(var(--ritual-gold))" 
              strokeWidth="0.5" 
              opacity="0.25"
            />
            <path 
              d="M44 16A20 20 0 1 1 39 11" 
              fill="none" 
              stroke="hsl(var(--ritual-gold))" 
              strokeWidth="1.2" 
              strokeLinecap="round" 
              opacity="0.7"
            />
            <motion.circle 
              cx="44" 
              cy="16" 
              r="2.5" 
              fill="hsl(var(--ritual-gold))"
              animate={{ opacity: [0.85, 0.4, 0.85] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <text 
              x="28" 
              y="34" 
              textAnchor="middle" 
              fontFamily="'Playfair Display', Georgia, serif" 
              fontSize="22" 
              fontWeight="400" 
              fill="hsl(var(--ritual-gold))" 
              opacity="0.9"
            >
              U
            </text>
          </svg>
        </div>

        {/* "Marked" title */}
        <motion.h2
          className="font-playfair font-normal text-4xl text-ritual-gold mb-4"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          Marked
        </motion.h2>

        {/* Origin code */}
        <motion.p
          className="font-mono text-[10px] text-ritual-gold-muted tracking-[2px] uppercase mb-1.5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showOrigin ? 1 : 0, y: showOrigin ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          {artifact.origin}
        </motion.p>

        {/* Date */}
        <motion.p
          className="font-garamond text-sm text-ritual-cream-40 mb-5"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showDate ? 1 : 0, y: showDate ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          {formatDate(artifact.date)}
        </motion.p>

        {/* Gold line */}
        <motion.div
          className="w-[50px] h-px mx-auto mb-4"
          style={{ background: 'hsl(var(--ritual-gold))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showLine ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Hash */}
        <motion.p
          className="font-mono text-[10px] text-ritual-gold-muted tracking-[1px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: showHash ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {formatHash(artifact.hash)}
        </motion.p>

        {/* Whisper note */}
        <motion.p
          className="font-garamond italic text-[11px] text-ritual-cream-20 mt-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: showNote ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        >
          sealed on your device · only the proof leaves
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
