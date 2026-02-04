import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, RotateCcw, Plus, BookOpen } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { triggerHaptic } from '@/lib/haptics';
import { SealButton } from './SealButton';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onCaptureMultiple: (imageDataUrls: string[]) => void;
  onBrowseAll: () => void;  // Library icon - goes to History/browse
  onOpenSearch: () => void; // Search icon - goes to Search
}

const CAPTURE_HINT_KEY = 'umarise_capture_hint_shown';

/**
 * Origin Seal icon - the U in a circle with opening at 3 o'clock
 * Used as the primary navigation icon to the Wall of Existence (history)
 */
function OriginSeal({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none">
      {/* Outer circle with gap at 3 o'clock */}
      <path
        d="M 44 24 A 20 20 0 1 1 40 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Accent dot at the opening */}
      <circle cx="42" cy="18" r="2.5" fill="currentColor" />
      {/* U letter */}
      <text
        x="24"
        y="30"
        textAnchor="middle"
        fontSize="18"
        fontFamily="serif"
        fill="currentColor"
      >
        U
      </text>
    </svg>
  );
}

export function CameraView({ onCapture, onCaptureMultiple, onBrowseAll, onOpenSearch }: CameraViewProps) {
  const { isDemoMode } = useDemoMode();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [absorbingFiles, setAbsorbingFiles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  
  // Check if this is the user's first visit (for showing hint)
  useEffect(() => {
    const hasSeenHint = localStorage.getItem(CAPTURE_HINT_KEY);
    if (!hasSeenHint) {
      setIsFirstVisit(true);
    }
  }, []);
  
  // Mark hint as shown after first file interaction
  const markHintShown = useCallback(() => {
    if (isFirstVisit) {
      localStorage.setItem(CAPTURE_HINT_KEY, 'true');
      setIsFirstVisit(false);
    }
  }, [isFirstVisit]);

  // Process single file only (multi-capture hidden per Ritual V6)
  const processFile = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) return;

    // Haptic feedback on file selection
    triggerHaptic('light');

    // Compress image for optimal size
    const compressedImage = await compressImage(file);

    // Success haptic after processing
    triggerHaptic('success');

    setCapturedImage(compressedImage);
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Only process first file (single-capture mode)
      processFile(files[0]);
    }
    event.target.value = '';
  }, [processFile]);

  const handleFileUploadOriginal = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
    event.target.value = '';
  }, [processFile]);

  // Drag & drop handlers for file upload
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);
    
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Create absorbing animation particle at drop position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const newAbsorbing = [{
        id: Date.now(),
        x: e.clientX - centerX,
        y: e.clientY - centerY,
      }];
      setAbsorbingFiles(newAbsorbing);
      
      // Clear animation after it completes
      setTimeout(() => setAbsorbingFiles([]), 600);
      
      // Only process first file (single-capture mode)
      processFile(files[0]);
    }
  }, [processFile]);

  const retake = useCallback(() => {
    triggerHaptic('light');
    setCapturedImage(null);
  }, []);

  const confirmSingleCapture = useCallback(() => {
    if (capturedImage) {
      triggerHaptic('success');
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  }, [capturedImage, onCapture]);

  // Trigger file input when + is clicked
  const handleCaptureClick = useCallback(() => {
    markHintShown();
    fileInputRef.current?.click();
  }, [markHintShown]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-ink to-codex-forest flex flex-col relative overflow-hidden">
      {/* Hidden file input - single file only */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main capture area */}
      <div className="flex-1 relative flex items-center justify-center">
        {capturedImage ? (
          // Preview captured image
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full h-full flex items-center justify-center p-4"
          >
            <img
              src={capturedImage}
              alt="Captured page"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </motion.div>
        ) : (
          // Ritual V6 Capture Portal - dashed circle with + icon
          <motion.div
            ref={dropZoneRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Absorbing file animation */}
            <AnimatePresence>
              {absorbingFiles.map((file) => (
                <motion.div
                  key={file.id}
                  className="absolute w-6 h-6 rounded-full bg-codex-gold/80 z-20"
                  initial={{ 
                    x: file.x, 
                    y: file.y, 
                    scale: 1.5, 
                    opacity: 1 
                  }}
                  animate={{ 
                    x: 0, 
                    y: 0, 
                    scale: 0, 
                    opacity: 0 
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.5, 
                    ease: [0.32, 0, 0.67, 0] 
                  }}
                  style={{
                    boxShadow: '0 0 20px 8px rgba(255, 180, 50, 0.6)',
                  }}
                />
              ))}
            </AnimatePresence>

            {/* The Ritual V6 Capture Portal */}
            <motion.button
              onClick={handleCaptureClick}
              className="relative w-40 h-40 flex items-center justify-center cursor-pointer focus:outline-none"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Capture a beginning"
            >
              {/* Dashed circle */}
              <svg 
                viewBox="0 0 160 160" 
                className="absolute inset-0 w-full h-full"
                fill="none"
              >
                {/* Dashed arc with gap at 3 o'clock */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="8 6"
                  className="text-codex-gold/50"
                  fill="none"
                />
              </svg>
              
              {/* Accent dot at 3 o'clock position */}
              <motion.div
                className="absolute w-2.5 h-2.5 rounded-full bg-codex-gold"
                style={{ 
                  top: '50%',
                  right: '8px',
                  transform: 'translateY(-50%)'
                }}
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />

              {/* + icon */}
              <Plus className="w-10 h-10 text-codex-gold/70" strokeWidth={1} />
            </motion.button>

            {/* Drag over indicator */}
            {isDraggingOver && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-codex-gold/5 backdrop-blur-sm"
              >
                <div className="w-48 h-48 rounded-full border-2 border-dashed border-codex-gold/60 flex items-center justify-center">
                  <Plus className="w-12 h-12 text-codex-gold" strokeWidth={1} />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Top bar - Origin seal for Wall of Existence */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        {/* Origin icon (U-seal) - links to history/Wall of Existence */}
        {!capturedImage && (
          <button
            onClick={onBrowseAll}
            className="w-12 h-12 flex items-center justify-center transition-all hover:scale-105"
            aria-label="Wall of Existence"
          >
            <OriginSeal className="w-10 h-10 text-codex-gold/80" />
          </button>
        )}
        
        {/* Close/retake button when image captured */}
        {capturedImage && (
          <>
            <div /> {/* Spacer */}
            <button
              onClick={retake}
              className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm hover:bg-primary-foreground/20 transition-colors"
              aria-label="Close"
            >
              <X className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
            </button>
          </>
        )}
      </div>

      {/* Bottom left - History booklet icon (next to test panel) */}
      {!capturedImage && (
        <div className="absolute bottom-6 left-6 z-10">
          <button
            onClick={onBrowseAll}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground/60 hover:text-muted-foreground transition-colors"
            aria-label="View history"
          >
            <BookOpen className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      )

}

      {/* Bottom controls - only visible when preview mode */}
      {capturedImage && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 items-center"
          >
            <Button
              onClick={retake}
              variant="ghost"
              size="lg"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            
            {/* Seal button for single capture */}
            <SealButton
              count={1}
              onSeal={confirmSingleCapture}
            />
          </motion.div>
        </div>
      )}
    </div>
  );
}