/**
 * RelatedPages - Connection Layer UI (B)
 * 
 * Displays related pages based on shared cues, entities, keywords.
 * Makes "compounding value" visible and transparent.
 * 
 * Each connection shows WHY it's related (reason chip).
 * No black box - users can verify connections themselves.
 */

import { motion } from 'framer-motion';
import { Tag, User, Hash, ChevronRight, Link2 } from 'lucide-react';
import { Page } from '@/lib/abstractions/types';
import { RelatedPage, formatReason, getReasonIcon } from '@/lib/relatedPages';
import { format } from 'date-fns';
import { getDisplayImageUrl } from '@/hooks/useResolvedImageUrl';

interface RelatedPagesProps {
  relatedPages: RelatedPage[];
  onPageClick: (page: Page, reasons: RelatedPage['reasons']) => void;
}

function ReasonIcon({ type }: { type: 'cue' | 'entity' | 'keyword' }) {
  const iconClass = "w-3 h-3";
  switch (type) {
    case 'cue':
      return <Tag className={iconClass} />;
    case 'entity':
      return <User className={iconClass} />;
    case 'keyword':
      return <Hash className={iconClass} />;
  }
}

function getReasonColor(type: 'cue' | 'entity' | 'keyword'): string {
  switch (type) {
    case 'cue':
      return 'bg-codex-gold/20 text-codex-gold border-codex-gold/30';
    case 'entity':
      return 'bg-codex-teal/20 text-codex-teal border-codex-teal/30';
    case 'keyword':
      return 'bg-codex-cream/10 text-codex-cream/70 border-codex-cream/20';
  }
}

export function RelatedPages({ relatedPages, onPageClick }: RelatedPagesProps) {
  if (relatedPages.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <Link2 className="w-4 h-4 text-codex-gold/70" />
        <span className="text-xs text-codex-cream/50 uppercase tracking-wide">
          Related pages
        </span>
        <span className="text-xs text-codex-cream/30">
          ({relatedPages.length})
        </span>
      </div>

      {/* Related pages list */}
      <div className="space-y-2">
        {relatedPages.map((related, index) => (
          <motion.button
            key={related.page.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 + index * 0.05 }}
            onClick={() => onPageClick(related.page, related.reasons)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-codex-cream/5 hover:bg-codex-cream/10 border border-codex-cream/10 hover:border-codex-gold/30 transition-all group text-left"
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-codex-ink-deep">
              <img
                src={getDisplayImageUrl(related.page.imageUrl)}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Primary cue or one-line hint */}
              <p className="text-sm text-codex-cream truncate">
                {related.page.futureYouCues?.[0] || 
                 related.page.oneLineHint || 
                 related.page.summary?.slice(0, 50) + '...' ||
                 'Untitled'}
              </p>
              
              {/* Date */}
              <p className="text-xs text-codex-cream/40 mt-0.5">
                {format(related.page.writtenAt || related.page.createdAt, 'd MMM yyyy')}
              </p>
            </div>

            {/* Reason chip - shows WHY it's related (transparent, verifiable) */}
            <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs border ${getReasonColor(related.primaryReason.type)}`}>
              <ReasonIcon type={related.primaryReason.type} />
              <span className="max-w-[80px] truncate">
                {related.primaryReason.value}
              </span>
            </div>

            {/* Arrow */}
            <ChevronRight className="w-4 h-4 text-codex-cream/30 group-hover:text-codex-gold/70 transition-colors flex-shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Transparency note - shows this is based on verifiable data */}
      <p className="text-xs text-codex-cream/30 mt-3 italic">
        Connections based on shared cues, names, and topics you can verify.
      </p>
    </motion.div>
  );
}
