import { motion } from 'framer-motion';
import { Clock, Tag, FileText, X, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * PageFormatMockup - Reference implementation showing the ideal page format
 * 
 * CRITERIA:
 * 1. Language: English
 * 2. Future You Cue question prominent ("Which 3 words will you type to find this?")
 * 3. Photo: Realistically messy, text-focused (not wide room shots)
 * 4. RAW TEXT: Must match actual handwriting (with OCR errors)
 * 5. Page types: Varied (notebook, spiral, sticky, napkin, etc.)
 * 6. Themes: Diverse, not all about one topic
 * 7. Keywords: Max 5 to avoid chaos
 * 8. Readability: Clean layout, good contrast
 * 9. Close button: Always visible, not buried at bottom
 */

interface PageFormatMockupProps {
  onClose: () => void;
}

export function PageFormatMockup({ onClose }: PageFormatMockupProps) {
  // Example of an ideal page
  const examplePage = {
    futureYouCues: ['pitch', 'moleskine', 'pricing'],
    writtenAt: 'December 14, 2024',
    capturedAt: '2 days ago',
    summary: 'Pricing model for B2B SaaS—freemium vs tiered subscription. Need to validate with 3 founders before finalizing.',
    tone: 'Focused',
    keywords: ['pricing', 'freemium', 'subscription', 'B2B'],
    rawText: `Pricing thoughts Dec 14

Freemium:
- free tier = hook
- conversion 2-5% typical
- works for high volume

Tiered:
- $19/49/99 standard
- per seat or usage?
- enterprise = custom

Next: talk to Lisa, Marco, Anna
about their pricing journey`,
    pageType: 'Moleskine notebook',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-codex-ink-deep/95 backdrop-blur-sm overflow-auto"
    >
      <div className="min-h-screen p-4 pb-24">
        {/* Header - CLOSE BUTTON ALWAYS VISIBLE */}
        <div className="sticky top-0 z-10 bg-codex-ink-deep/90 backdrop-blur-md -mx-4 px-4 py-3 mb-4 border-b border-codex-gold/20">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            <div className="flex items-center gap-2 text-codex-cream/60 text-sm">
              <Clock className="w-4 h-4" />
              <span>{examplePage.capturedAt}</span>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-codex-cream/60 hover:text-codex-cream hover:bg-codex-cream/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="max-w-lg mx-auto space-y-6">
          {/* CRITERIA CHECKLIST - Dev reference */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-xs">
            <h3 className="font-bold text-amber-400 mb-2">PAGE FORMAT CRITERIA</h3>
            <ul className="space-y-1 text-amber-200/80">
              <li>✓ Language: English</li>
              <li>✓ Future You Cue question: Prominent, before other content</li>
              <li>✓ Photo: Text-focused, realistic messy handwriting</li>
              <li>✓ RAW TEXT: Matches photo (with natural OCR errors)</li>
              <li>✓ Keywords: Max 5 (avoid chaos)</li>
              <li>✓ Close button: Always visible in header</li>
              <li>✓ Page type label: Shows source (Moleskine, napkin, etc.)</li>
            </ul>
          </div>

          {/* SECTION 1: FUTURE YOU CUE - MOST IMPORTANT */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-codex-gold/10 border border-codex-gold/30 rounded-xl p-4"
          >
            <p className="text-sm text-codex-gold mb-3 font-medium">
              Which 3 words will you type to find this later?
            </p>
            <div className="flex flex-wrap gap-2">
              {examplePage.futureYouCues.map((cue, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-full bg-codex-gold/20 text-codex-gold text-sm font-medium border border-codex-gold/30"
                >
                  {cue}
                </span>
              ))}
            </div>
            <p className="text-xs text-codex-cream/40 mt-3">
              ↑ These cues are the primary retrieval signal. User confirms or edits AI suggestions.
            </p>
          </motion.div>

          {/* SECTION 2: WRITTEN DATE */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-codex-cream/50" />
            <span className="text-xs text-codex-cream/50 uppercase tracking-wide">Written</span>
            <span className="text-sm text-codex-cream/80">{examplePage.writtenAt}</span>
          </div>

          {/* SECTION 3: ORIGINAL IMAGE - DOMINANT */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Placeholder for realistic handwriting image */}
            <div className="aspect-[4/5] bg-codex-cream/5 rounded-xl border border-codex-gold/20 flex items-center justify-center overflow-hidden">
              <div className="text-center p-6 w-full">
                <div className="w-full bg-gradient-to-br from-amber-100 to-amber-50 rounded-lg p-4 text-left text-codex-ink-deep text-sm leading-relaxed italic">
                  <p className="font-bold mb-2 not-italic">Pricing thoughts Dec 14</p>
                  <p className="mb-2">Freemium:</p>
                  <p className="pl-2">- free tier = hook</p>
                  <p className="pl-2">- conversion 2-5% typical</p>
                  <p className="pl-2 mb-2">- works for high volume</p>
                  <p className="mb-2">Tiered:</p>
                  <p className="pl-2">- $19/49/99 standard</p>
                  <p className="pl-2">- per seat or usage?</p>
                  <p className="pl-2 mb-2">- enterprise = custom</p>
                  <p className="mt-3">Next: talk to Lisa, Marco, Anna</p>
                  <p>about their pricing journey</p>
                </div>
              </div>
            </div>
            {/* Page type badge */}
            <span className="absolute bottom-3 right-3 px-2 py-1 rounded-full bg-codex-ink-deep/80 text-codex-cream/60 text-xs">
              {examplePage.pageType}
            </span>
          </motion.div>

          {/* SECTION 4: SUMMARY */}
          <div>
            <h2 className="font-serif text-lg text-codex-cream leading-snug">
              {examplePage.summary}
            </h2>
          </div>

          {/* SECTION 5: TONE */}
          <div>
            <span className="text-xs text-codex-cream/50 uppercase tracking-wide block mb-2">Tone</span>
            <span className="px-3 py-1 rounded-full bg-codex-teal/20 text-codex-teal text-sm">
              {examplePage.tone}
            </span>
          </div>

          {/* SECTION 6: KEYWORDS - MAX 5 */}
          <div>
            <span className="text-xs text-codex-cream/50 uppercase tracking-wide block mb-2">
              Keywords <span className="text-codex-cream/30">(max 5)</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {examplePage.keywords.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full bg-codex-cream/10 text-codex-cream/80 text-sm"
                >
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* SECTION 7: RAW TEXT - Collapsible */}
          <div className="border-t border-codex-cream/10 pt-4">
            <button className="flex items-center justify-between w-full text-left">
              <span className="text-xs text-codex-cream/50 uppercase tracking-wide flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" />
                Raw Text <span className="text-codex-cream/30">(editable)</span>
              </span>
              <ChevronDown className="w-4 h-4 text-codex-cream/40" />
            </button>
            <div className="mt-3 p-3 bg-codex-cream/5 rounded-lg">
              <pre className="text-sm text-codex-cream/70 whitespace-pre-wrap font-mono">
{examplePage.rawText}
              </pre>
              <p className="text-xs text-codex-cream/30 mt-2 italic">
                ↑ Must match what's on the photo. OCR errors acceptable (reflects reality).
              </p>
            </div>
          </div>

          {/* SECTION 8: Dataset Variety Notes */}
          <div className="bg-codex-forest-deep/30 border border-codex-forest/30 rounded-lg p-4 text-xs">
            <h4 className="font-bold text-codex-teal mb-2">DATASET VARIETY REQUIREMENTS</h4>
            <div className="space-y-2 text-codex-cream/60">
              <p><strong className="text-codex-cream/80">Page types:</strong> Moleskine, spiral notebook, sticky note, loose paper, napkin, index card, back of receipt</p>
              <p><strong className="text-codex-cream/80">Themes:</strong> Business (pitch, pricing), Personal (gratitude, goals), Creative (story ideas, design), Learning (book notes, research)</p>
              <p><strong className="text-codex-cream/80">Named entities:</strong> Real names (Lisa, Marco, Anna, Peter), Companies (Umarise, Moleskine), Places</p>
              <p><strong className="text-codex-cream/80">Cue patterns:</strong> Person names, project names, topic keywords (never generic like "idea", "notes", "thoughts")</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
