import { useEffect, useState, useCallback } from 'react';
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
 * 
 * Per briefing sectie 4 (S4):
 * - "Origin marked" title (22px Playfair 300, gold)
 * - U-zegel (56x56 SVG)
 * - ORIGIN ID [8-karakter hex] — JetBrains Mono 9px
 * - Datum en tijd — EB Garamond 13px
 * - Volledige SHA-256 hash (twee regels) — JetBrains Mono 9px, 0.45 opacity
 * - ⏳ PENDING status
 * - "Bitcoin anchoring takes 1–2 blocks. Your origin is registered. No action needed."
 * - Privacy-notitie: "your file stays on your device · only the proof leaves"
 * 
 * NO email prompt. NO skip button. NO registration. Auto-advance after cascade.
 */
export function ReleaseScreen({ artifact, onComplete }: ReleaseScreenProps) {
  const [showCard, setShowCard] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showOrigin, setShowOrigin] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [showHash, setShowHash] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showAnchorNote, setShowAnchorNote] = useState(false);
  const [showNote, setShowNote] = useState(false);

  // Cascade animation timing:
  // 0.0s card, 0.6s title, 1.0s origin, 1.2s date, 1.5s line, 1.8s hash, 2.2s status, 2.6s anchor note, 3.0s privacy note
  // Auto-advance to S5 after 6s (enough time to read)
  useEffect(() => {
    const timers = [
      setTimeout(() => setShowCard(true), 0),
      setTimeout(() => setShowTitle(true), 600),
      setTimeout(() => setShowOrigin(true), 1000),
      setTimeout(() => setShowDate(true), 1200),
      setTimeout(() => setShowLine(true), 1500),
      setTimeout(() => setShowHash(true), 1800),
      setTimeout(() => setShowStatus(true), 2200),
      setTimeout(() => setShowAnchorNote(true), 2600),
      setTimeout(() => setShowNote(true), 3000),
      // Auto-advance after 6 seconds — user can also tap to skip
      setTimeout(() => onComplete(), 6000),
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

  // Full hash on two lines per briefing — not truncated
  const formatHashTwoLines = (hash: string) => {
    if (hash.length <= 32) return [hash, ''];
    const mid = Math.ceil(hash.length / 2);
    return [hash.slice(0, mid), hash.slice(mid)];
  };

  const [hashLine1, hashLine2] = formatHashTwoLines(artifact.hash);

  return (
    <motion.div
      className="min-h-screen flex items-center justify-center cursor-pointer"
      style={{ background: 'hsl(var(--ritual-surface))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      onClick={onComplete}
    >
      {/* Certificate card - 280px, radius 14px, padding 44px 36px 36px */}
      <motion.div
        className="w-[280px] rounded-[14px] text-center relative overflow-hidden"
        style={{
          padding: '44px 36px 36px',
          background: 'linear-gradient(170deg, rgba(30, 45, 30, 0.9), rgba(20, 32, 20, 0.95))',
          border: '1px solid hsl(var(--ritual-gold) / 0.15)',
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ 
          opacity: showCard ? 1 : 0, 
          scale: showCard ? 1 : 0.97 
        }}
        transition={{ duration: 0.6 }}
        onClick={(e) => e.stopPropagation()}
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

        {/* Title — per briefing sectie 10: 22px Playfair 300, #C5935A */}
        <motion.h2
          className="font-playfair text-[26px] text-ritual-gold mb-[18px]"
          style={{ fontWeight: 300 }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showTitle ? 1 : 0, y: showTitle ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          Anchored
        </motion.h2>

        {/* Origin code — JetBrains Mono 9px, 0.45 opacity per v7 spec */}
        <motion.p
          className="font-mono text-[11px] tracking-[2px] uppercase mb-1.5"
          style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showOrigin ? 1 : 0, y: showOrigin ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          {artifact.origin}
        </motion.p>

        {/* Date — EB Garamond 13px */}
        <motion.p
          className="font-garamond text-[15px] mb-5"
          style={{ color: 'hsl(var(--ritual-cream) / 0.4)' }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: showDate ? 1 : 0, y: showDate ? 0 : 6 }}
          transition={{ duration: 0.5 }}
        >
          {formatDate(artifact.date)}
        </motion.p>

        {/* Gold line - 50px */}
        <motion.div
          className="w-[50px] h-px mx-auto mb-4"
          style={{ background: 'hsl(var(--ritual-gold))' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showLine ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        />

        {/* Full SHA-256 hash on two lines — JetBrains Mono 9px, 0.45 opacity */}
        <motion.div
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: showHash ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <p 
            className="font-mono text-[11px] tracking-[0.5px] leading-relaxed"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            {hashLine1}
          </p>
          {hashLine2 && (
            <p 
              className="font-mono text-[11px] tracking-[0.5px] leading-relaxed"
              style={{ color: 'hsl(var(--ritual-gold-muted))' }}
            >
              {hashLine2}
            </p>
          )}
        </motion.div>

        {/* ⏳ PENDING status */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: showStatus ? 0.6 : 0 }}
          transition={{ duration: 0.4 }}
        >
          <motion.span
            className="w-[6px] h-[6px] rounded-full"
            style={{ background: 'hsl(var(--ritual-gold))' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <span 
            className="font-mono text-[11px] tracking-[1.5px] uppercase"
            style={{ color: 'hsl(var(--ritual-gold) / 0.6)' }}
          >
            PENDING
          </span>
        </motion.div>

        {/* Anchoring note — per briefing: exact text */}
        <motion.p
          className="font-garamond italic text-[13px] leading-relaxed mb-4"
          style={{ color: 'hsl(var(--ritual-cream) / 0.3)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showAnchorNote ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          Bitcoin anchoring takes 1–2 blocks. Your origin is registered. No action needed.
        </motion.p>

        {/* Privacy note */}
        <motion.p
          className="font-garamond italic text-[13px]"
          style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showNote ? 0.45 : 0 }}
          transition={{ duration: 0.4 }}
        >
          your file stays on your device · only the proof leaves
        </motion.p>
      </motion.div>
    </motion.div>
  );
}