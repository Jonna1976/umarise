import { motion } from 'framer-motion';
import { Page, CapsulePages, Project } from '@/lib/pageService';
import { useMemo, useState } from 'react';

interface VaultViewProps {
  items: Array<{ type: 'page'; page: Page } | { type: 'capsule'; capsule: CapsulePages }>;
  projects: Project[];
  onSelectPage: (page: Page) => void;
  onSelectCapsule?: (capsule: CapsulePages) => void;
  highlightPageId?: string;
}

// Get spine color based on tone - minimal colors for density
function getToneColor(tones: string[]): string {
  const primaryTone = tones[0]?.toLowerCase() || 'reflective';
  
  const toneMap: Record<string, string> = {
    focused: 'hsl(165, 25%, 18%)',
    hopeful: 'hsl(38, 40%, 50%)',
    frustrated: 'hsl(160, 20%, 22%)',
    playful: 'hsl(42, 40%, 88%)',
    overwhelmed: 'hsl(160, 12%, 28%)',
    reflective: 'hsl(42, 35%, 90%)',
    curious: 'hsl(165, 22%, 25%)',
    calm: 'hsl(160, 18%, 30%)',
  };
  
  return toneMap[primaryTone] || toneMap.reflective;
}

// Mini book for dense display
function MiniBook({ 
  item, 
  onClick,
  isHighlighted,
  index,
}: { 
  item: { type: 'page'; page: Page } | { type: 'capsule'; capsule: CapsulePages };
  onClick: () => void;
  isHighlighted?: boolean;
  index: number;
}) {
  const representativePage = item.type === 'page' ? item.page : item.capsule.pages[0];
  if (!representativePage) return null;
  
  const color = getToneColor(representativePage.tone);
  const pageCount = item.type === 'capsule' ? item.capsule.pages.length : 1;
  const width = 8 + Math.min(pageCount * 2, 8);
  
  // Extract first letter or keyword initial for quick recognition
  const initial = representativePage.primaryKeyword?.[0]?.toUpperCase() || 
                  representativePage.keywords[0]?.[0]?.toUpperCase() || 
                  '•';
  
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.01, duration: 0.2 }}
      whileHover={{ 
        scale: 2.5, 
        zIndex: 100,
        transition: { duration: 0.15 }
      }}
      onClick={onClick}
      className={`
        relative flex-shrink-0 rounded-[2px] cursor-pointer
        shadow-sm hover:shadow-xl
        transition-shadow duration-200
        group
        ${isHighlighted ? 'ring-1 ring-codex-gold' : ''}
      `}
      style={{ 
        width: `${width}px`, 
        height: '100%',
        backgroundColor: color,
      }}
      title={representativePage.primaryKeyword || representativePage.keywords[0] || representativePage.summary.slice(0, 50)}
    >
      {/* Initial letter - visible on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[6px] font-bold text-white mix-blend-difference">
          {initial}
        </span>
      </div>
      
      {/* Page count indicator for capsules */}
      {pageCount > 1 && (
        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2">
          <div className="w-1 h-1 rounded-full bg-white/50" />
        </div>
      )}
      
      {/* Highlight glow */}
      {isHighlighted && (
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute inset-0 bg-codex-gold/40"
        />
      )}
    </motion.button>
  );
}

export function VaultView({ 
  items, 
  projects, 
  onSelectPage, 
  onSelectCapsule,
  highlightPageId 
}: VaultViewProps) {
  const [hoveredShelf, setHoveredShelf] = useState<number | null>(null);
  
  // Calculate grid dimensions based on item count
  // Goal: fit everything in viewport without scrolling
  const { shelves, booksPerShelf, shelfHeight } = useMemo(() => {
    const itemCount = items.length;
    
    if (itemCount <= 20) {
      return { shelves: 2, booksPerShelf: 10, shelfHeight: 80 };
    } else if (itemCount <= 50) {
      return { shelves: 3, booksPerShelf: 17, shelfHeight: 70 };
    } else if (itemCount <= 100) {
      return { shelves: 4, booksPerShelf: 25, shelfHeight: 60 };
    } else if (itemCount <= 200) {
      return { shelves: 5, booksPerShelf: 40, shelfHeight: 50 };
    } else {
      // 200+ pages - maximum density
      return { shelves: 6, booksPerShelf: 50, shelfHeight: 45 };
    }
  }, [items.length]);
  
  // Distribute items across shelves
  const shelfItems = useMemo(() => {
    const result: typeof items[] = [];
    for (let i = 0; i < shelves; i++) {
      const start = i * booksPerShelf;
      const end = start + booksPerShelf;
      result.push(items.slice(start, end));
    }
    return result;
  }, [items, shelves, booksPerShelf]);
  
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <p className="text-sm">Your vault is empty</p>
      </div>
    );
  }
  
  return (
    <div className="relative px-4 py-6">
      {/* Vault header */}
      <div className="text-center mb-4">
        <span className="text-xs text-muted-foreground font-medium">
          {items.length} memories • {shelves} shelves
        </span>
      </div>
      
      {/* Shelves container with perspective */}
      <div 
        className="relative"
        style={{
          perspective: '800px',
          perspectiveOrigin: 'center 40%'
        }}
      >
        {shelfItems.map((shelfBooks, shelfIndex) => {
          if (shelfBooks.length === 0) return null;
          
          // Calculate depth offset for 3D effect
          const depthOffset = shelfIndex * 2;
          const scaleY = 1 - (shelfIndex * 0.02);
          const opacity = 1 - (shelfIndex * 0.05);
          
          return (
            <motion.div
              key={shelfIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: shelfIndex * 0.1 }}
              className="relative mb-1"
              style={{
                transform: `translateZ(-${depthOffset}px) scaleY(${scaleY})`,
                opacity,
              }}
              onMouseEnter={() => setHoveredShelf(shelfIndex)}
              onMouseLeave={() => setHoveredShelf(null)}
            >
              {/* Shelf unit */}
              <div 
                className={`
                  relative rounded-sm overflow-hidden
                  transition-all duration-200
                  ${hoveredShelf === shelfIndex ? 'ring-1 ring-codex-gold/30' : ''}
                `}
                style={{
                  background: 'linear-gradient(to bottom, hsl(35, 30%, 25%), hsl(35, 25%, 18%))',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)'
                }}
              >
                {/* Back panel */}
                <div 
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(to bottom, hsl(35, 20%, 12%), hsl(35, 15%, 8%))'
                  }}
                />
                
                {/* Books row */}
                <div 
                  className="relative flex items-end justify-center gap-[1px] px-2 py-1"
                  style={{ height: `${shelfHeight}px` }}
                >
                  {shelfBooks.map((item, bookIndex) => (
                    <MiniBook
                      key={item.type === 'page' ? item.page.id : item.capsule.capsuleId}
                      item={item}
                      index={shelfIndex * booksPerShelf + bookIndex}
                      onClick={() => {
                        if (item.type === 'page') {
                          onSelectPage(item.page);
                        } else if (onSelectCapsule) {
                          onSelectCapsule(item.capsule);
                        } else {
                          onSelectPage(item.capsule.pages[0]);
                        }
                      }}
                      isHighlighted={
                        highlightPageId && (
                          (item.type === 'page' && item.page.id === highlightPageId) ||
                          (item.type === 'capsule' && item.capsule.pages.some(p => p.id === highlightPageId))
                        )
                      }
                    />
                  ))}
                </div>
                
                {/* Shelf edge (wood plank) */}
                <div 
                  className="h-2"
                  style={{
                    background: 'linear-gradient(to bottom, hsl(35, 30%, 30%), hsl(35, 25%, 22%))',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.4)'
                  }}
                />
              </div>
              
              {/* Shelf label */}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                <span className="text-[8px] text-muted-foreground/50 font-mono">
                  {shelfIndex + 1}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {/* Ambient glow at bottom */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center bottom, hsl(38, 40%, 20%) 0%, transparent 70%)'
        }}
      />
      
      {/* Stats overlay */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-muted-foreground/60">
          Hover to zoom • Click to open
        </p>
      </div>
    </div>
  );
}
