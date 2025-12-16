import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import { Page } from '@/lib/pageService';

interface MemoryOrbitViewProps {
  pages: Page[];
  onBack: () => void;
  onSelectPage: (page: Page) => void;
  onOpenSearch: () => void;
  highlightPageId?: string;
}

// Calculate "richness" score for sizing orbs
function calculateRichness(page: Page): number {
  let score = 1;
  
  // Future You Cues are most valuable
  score += (page.futureYouCues?.length || 0) * 2;
  
  // Keywords add value
  score += (page.keywords?.length || 0) * 0.5;
  
  // Highlights/user keywords
  score += (page.highlights?.length || 0) * 1;
  
  // Has summary
  if (page.summary) score += 1;
  
  // Has user note
  if (page.userNote) score += 1;
  
  return Math.min(score, 12); // Cap at 12
}

// Generate organic-feeling positions for orbs
function generateOrbPositions(count: number): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // Golden angle for natural distribution
  
  for (let i = 0; i < count; i++) {
    const radius = 30 + Math.sqrt(i) * 12; // Spiral outward
    const angle = i * goldenAngle;
    
    // Add some randomness for organic feel
    const jitterX = (Math.random() - 0.5) * 15;
    const jitterY = (Math.random() - 0.5) * 15;
    
    positions.push({
      x: 50 + Math.cos(angle) * radius * 0.4 + jitterX,
      y: 50 + Math.sin(angle) * radius * 0.5 + jitterY,
    });
  }
  
  return positions;
}

export function MemoryOrbitView({ 
  pages, 
  onBack, 
  onSelectPage, 
  onOpenSearch,
  highlightPageId 
}: MemoryOrbitViewProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusedPage, setFocusedPage] = useState<Page | null>(null);
  
  // Generate stable positions based on page count
  const positions = useMemo(() => generateOrbPositions(pages.length), [pages.length]);
  
  // Sort pages by richness for layering (richer = more forward)
  const sortedPages = useMemo(() => {
    return [...pages].sort((a, b) => calculateRichness(a) - calculateRichness(b));
  }, [pages]);

  const handleOrbClick = (page: Page) => {
    if (focusedPage?.id === page.id) {
      // Double tap - go to detail
      onSelectPage(page);
    } else {
      // First tap - focus
      setFocusedPage(page);
    }
  };

  return (
    <div className="fixed inset-0 bg-codex-ink-deep overflow-hidden">
      {/* Subtle starfield background */}
      <div className="absolute inset-0 opacity-30">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-codex-cream/40 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-codex-cream/10 hover:bg-codex-cream/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-codex-cream" />
        </button>
        
        <h1 className="text-codex-gold font-serif text-lg">Your Universe</h1>
        
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-full bg-codex-cream/10 hover:bg-codex-cream/20 transition-colors"
        >
          <Search className="w-5 h-5 text-codex-cream" />
        </button>
      </div>

      {/* Page count */}
      <div className="absolute bottom-6 left-0 right-0 text-center z-10">
        <p className="text-codex-cream/40 text-sm">
          {pages.length} {pages.length === 1 ? 'memory' : 'memories'}
        </p>
      </div>

      {/* Floating orbs */}
      <div className="absolute inset-0">
        <AnimatePresence>
          {sortedPages.map((page, index) => {
            const richness = calculateRichness(page);
            const position = positions[index] || { x: 50, y: 50 };
            const isHovered = hoveredId === page.id;
            const isFocused = focusedPage?.id === page.id;
            const isHighlighted = highlightPageId === page.id;
            
            // Size based on richness (40px to 90px)
            const baseSize = 40 + richness * 4;
            const size = isHovered || isFocused ? baseSize * 1.3 : baseSize;
            
            // Border thickness based on richness (2px to 5px)
            const borderWidth = 2 + richness * 0.3;
            
            return (
              <motion.button
                key={page.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  x: isFocused ? '0%' : `${position.x - 50}%`,
                  y: isFocused ? '0%' : `${position.y - 50}%`,
                  zIndex: isFocused ? 50 : isHovered ? 40 : index,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 200, 
                  damping: 20,
                  delay: index * 0.02,
                }}
                onClick={() => handleOrbClick(page)}
                onMouseEnter={() => setHoveredId(page.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="absolute rounded-full overflow-hidden cursor-pointer"
                style={{
                  width: size,
                  height: size,
                  left: isFocused ? '50%' : `${position.x}%`,
                  top: isFocused ? '50%' : `${position.y}%`,
                  transform: isFocused ? 'translate(-50%, -50%)' : 'translate(-50%, -50%)',
                  boxShadow: (isHovered || isFocused || isHighlighted) 
                    ? `0 0 30px 10px rgba(201, 166, 107, 0.4), inset 0 0 20px rgba(201, 166, 107, 0.2)`
                    : `0 0 15px 2px rgba(201, 166, 107, 0.15)`,
                  border: `${borderWidth}px solid`,
                  borderColor: (isHovered || isFocused || isHighlighted) 
                    ? 'rgba(201, 166, 107, 0.9)' 
                    : 'rgba(201, 166, 107, 0.5)',
                }}
              >
                {/* Thumbnail */}
                <img
                  src={page.thumbnailUri || page.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    filter: (isHovered || isFocused) ? 'brightness(1.1)' : 'brightness(0.8)',
                  }}
                />
                
                {/* Subtle overlay gradient */}
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-codex-ink-deep/50"
                  style={{ opacity: (isHovered || isFocused) ? 0 : 0.4 }}
                />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Focused page info panel */}
      <AnimatePresence>
        {focusedPage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 left-4 right-4 z-30"
          >
            <div className="bg-codex-ink/90 backdrop-blur-lg rounded-xl p-4 border border-codex-gold/30">
              {/* Cues */}
              {focusedPage.futureYouCues && focusedPage.futureYouCues.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {focusedPage.futureYouCues.map((cue, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 rounded-full text-xs bg-codex-gold/20 text-codex-gold border border-codex-gold/30"
                    >
                      {cue}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Summary */}
              <p className="text-codex-cream/90 text-sm line-clamp-2 mb-3">
                {focusedPage.summary || focusedPage.ocrText?.slice(0, 100) || 'No summary'}
              </p>
              
              {/* Action hint */}
              <p className="text-codex-cream/40 text-xs text-center">
                Tap again to open
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tap outside to unfocus */}
      {focusedPage && (
        <div 
          className="absolute inset-0 z-20"
          onClick={() => setFocusedPage(null)}
        />
      )}

      {/* Floating animation keyframes */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
