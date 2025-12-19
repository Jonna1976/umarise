import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';

interface TrashDropZoneProps {
  trashedCount: number;
  onDrop: (pageId: string) => void;
  onOpenTrash: () => void;
  isDragging: boolean;
}

export function TrashDropZone({ trashedCount, onDrop, onOpenTrash, isDragging }: TrashDropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    
    const pageId = e.dataTransfer.getData('text/plain');
    console.log('[TrashDropZone] Drop received, pageId:', pageId);
    if (pageId) {
      // Haptic feedback on successful drop
      triggerHaptic('medium');
      onDrop(pageId);
    }
  }, [onDrop]);

  return (
    <motion.div
      className="fixed bottom-6 left-6 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDragging ? 1 : (trashedCount > 0 ? 0.8 : 0.4),
        scale: isOver ? 1.3 : 1,
        y: isDragging ? -10 : 0,
      }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onOpenTrash}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200
          ${isOver 
            ? 'bg-destructive/40 shadow-lg shadow-destructive/30 ring-2 ring-destructive' 
            : isDragging
              ? 'bg-secondary/80 ring-1 ring-border'
              : 'bg-transparent hover:bg-secondary/50'
          }
        `}
        title={trashedCount > 0 ? `Prullenbak (${trashedCount})` : 'Prullenbak'}
      >
        <Trash2 
          className={`w-5 h-5 transition-colors ${
            isOver ? 'text-destructive' : 'text-muted-foreground'
          }`} 
        />
        
        {/* Badge for count */}
        <AnimatePresence>
          {trashedCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-[10px] font-medium"
            >
              {trashedCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </motion.div>
  );
}
