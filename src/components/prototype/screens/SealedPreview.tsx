/**
 * SealedPreview — Merged concept: Release + ZIP → one "Sealed" screen
 * 
 * Design direction: "Your origin is ready" enriched with museum-label data.
 * Combines the cascade weight of ReleaseScreen with the actionable purpose of ZipScreen.
 * 
 * Layout:
 * 1. Artifact in golden frame (photo preview or type icon)
 * 2. Museum label beneath: Origin ID + date + hash (subtle, JetBrains Mono)
 * 3. "Your origin is ready" title
 * 4. Three files (photo.jpg, certificate.json, proof.ots)
 * 5. "Save your origin" button
 */

import { useState } from 'react';
import { motion } from 'framer-motion';

// Mock data for preview
const MOCK = {
  originId: 'UM-A7F3B2E1',
  hash: 'a7f3b2e1d9c4f6a8b3e7d1c5f9a2b6e4d8c3f7a1b5e9d2c6f0a4b8e3d7c1f5',
  timestamp: new Date('2026-02-09T09:41:00'),
  imageUrl: null as string | null,
};

export function SealedPreview() {
  const [saved, setSaved] = useState(false);

  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) +
    ' · ' +
    date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  const shortId = MOCK.originId.replace('UM-', '');
  const hashLine1 = MOCK.hash.slice(0, 32);
  const hashLine2 = MOCK.hash.slice(32);

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: 'hsl(var(--ritual-bg))' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* ── Artifact in golden frame ── */}
      <motion.div
        className="w-[200px] h-[200px] rounded-[3px] mb-6 flex items-center justify-center overflow-hidden"
        style={{
          border: '1px solid hsl(var(--ritual-gold) / 0.3)',
          background: 'hsl(var(--ritual-gold) / 0.03)',
        }}
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {/* Placeholder: image icon in ritual gold */}
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="4" width="40" height="40" rx="4"
            stroke="hsl(var(--ritual-gold))" strokeWidth="1" opacity="0.4" />
          <circle cx="16" cy="16" r="4"
            fill="hsl(var(--ritual-gold))" opacity="0.25" />
          <path d="M4 36L14 24L22 32L30 20L44 36"
            stroke="hsl(var(--ritual-gold))" strokeWidth="1" opacity="0.3" />
        </svg>
      </motion.div>

      {/* ── Museum label: Origin ID + date + hash ── */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        {/* Origin ID */}
        <p
          className="font-mono text-[13px] tracking-[2px] uppercase mb-1"
          style={{ color: 'hsl(var(--ritual-gold) / 0.45)' }}
        >
          ORIGIN {shortId}
        </p>

        {/* Date */}
        <p
          className="font-garamond text-[17px] mb-3"
          style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}
        >
          {formatDate(MOCK.timestamp)}
        </p>

        {/* Hash — two lines, very subtle */}
        <div style={{ opacity: 0.35 }}>
          <p
            className="font-mono text-[12px] tracking-[0.5px] leading-relaxed"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            {hashLine1}
          </p>
          <p
            className="font-mono text-[12px] tracking-[0.5px] leading-relaxed"
            style={{ color: 'hsl(var(--ritual-gold-muted))' }}
          >
            {hashLine2}
          </p>
        </div>
      </motion.div>

      {/* ── Gold divider ── */}
      <motion.div
        className="w-[50px] h-px mb-8"
        style={{ background: 'hsl(var(--ritual-gold) / 0.25)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.8 }}
      />

      {/* ── Title ── */}
      <motion.h1
        className="font-playfair text-[30px] text-ritual-gold mb-8"
        style={{ fontWeight: 300 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        Your origin is ready
      </motion.h1>

      {/* ── File list ── */}
      <motion.div
        className="w-full max-w-[280px] space-y-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        {/* photo.jpg */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="1" y="1" width="16" height="16" rx="2"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <circle cx="6" cy="6" r="1.5"
              fill="hsl(var(--ritual-gold))" opacity="0.4" />
            <path d="M1 13L5 9L8 12L11 8L17 14"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.4" />
          </svg>
          <span className="font-garamond text-[17px]" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            photo.jpg <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· original bytes</span>
          </span>
        </div>

        {/* certificate.json */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="2" y="1" width="14" height="16" rx="1.5"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <line x1="5" y1="6" x2="13" y2="6"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
            <line x1="5" y1="9" x2="13" y2="9"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
            <line x1="5" y1="12" x2="10" y2="12"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
          </svg>
          <span className="font-garamond text-[17px]" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            certificate.json <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· hash · origin_id · timestamp</span>
          </span>
        </div>

        {/* proof.ots */}
        <div className="flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="shrink-0">
            <rect x="2" y="1" width="14" height="16" rx="1.5"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.8" opacity="0.5" />
            <circle cx="9" cy="9" r="3"
              stroke="hsl(var(--ritual-gold))" strokeWidth="0.6" opacity="0.3" />
            <circle cx="9" cy="9" r="1"
              fill="hsl(var(--ritual-gold))" opacity="0.4" />
          </svg>
          <span className="font-garamond text-[17px] flex items-center gap-1.5" style={{ color: 'hsl(var(--ritual-cream) / 0.7)' }}>
            proof.ots <span className="italic" style={{ color: 'hsl(var(--ritual-cream) / 0.35)' }}>· anchoring</span>
            <motion.span
              className="inline-block w-[5px] h-[5px] rounded-full bg-ritual-gold"
              animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
          </span>
        </div>
      </motion.div>

      {/* ── Anchoring note (under proof.ots, above Save) ── */}
      <motion.p
        className="font-garamond italic text-[16px] text-center max-w-[280px] mb-8 leading-relaxed"
        style={{ color: 'hsl(var(--ritual-cream) / 0.3)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
      >
        Your proof is anchoring in Bitcoin. This takes 1–2 blocks.
      </motion.p>

      {/* ── Save button ── */}
      <motion.button
        onClick={() => setSaved(true)}
        className="font-playfair text-[17px] px-8 py-3 rounded-full transition-all mb-8"
        style={{
          fontWeight: 300,
          background: saved
            ? 'hsl(var(--ritual-gold) / 0.15)'
            : 'hsl(var(--ritual-gold) / 0.12)',
          border: `1px solid hsl(var(--ritual-gold) / ${saved ? '0.5' : '0.35'})`,
          color: `hsl(var(--ritual-gold) / ${saved ? '1' : '0.85'})`,
        }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        whileTap={!saved ? { scale: 0.97 } : {}}
      >
        {saved ? '✓ Owned' : 'Save your origin'}
      </motion.button>

      {/* ── Privacy note ── */}
      <motion.p
        className="font-garamond italic text-[15px] text-center max-w-[280px]"
        style={{ color: 'hsl(var(--ritual-cream) / 0.2)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 2.2 }}
      >
        your file stays on your device · only the proof leaves
      </motion.p>
    </motion.div>
  );
}
