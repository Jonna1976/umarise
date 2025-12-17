import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';

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
    setIsOver(false);
    
    const pageId = e.dataTransfer.getData('text/plain');
    if (pageId) {
      onDrop(pageId);
    }
  }, [onDrop]);

  return (
    <motion.div
      className="fixed bottom-6 left-20 z-40"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: isDragging || trashedCount > 0 ? 1 : 0.4,
        scale: isOver ? 1.2 : 1,
      }}
      transition={{ duration: 0.2 }}
    >
      <button
        onClick={onOpenTrash}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative w-14 h-14 rounded-xl flex items-center justify-center
          transition-all duration-200
          ${isOver 
            ? 'bg-destructive/30 border-2 border-destructive shadow-lg shadow-destructive/20' 
            : trashedCount > 0
              ? 'bg-secondary/80 border border-border hover:bg-secondary'
              : 'bg-secondary/50 border border-border/50 hover:bg-secondary/80'
          }
          ${isDragging ? 'ring-2 ring-destructive/30 ring-offset-2 ring-offset-background' : ''}
        `}
        title={trashedCount > 0 ? `Prullenbak (${trashedCount})` : 'Sleep hier naartoe om te verwijderen'}
      >
        <Trash2 
          className={`w-6 h-6 transition-colors ${
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
              className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs font-medium"
            >
              {trashedCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>
      
      {/* Hint when dragging */}
      <AnimatePresence>
        {isDragging && !isOver && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded shadow"
          >
            Sleep hierheen
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
