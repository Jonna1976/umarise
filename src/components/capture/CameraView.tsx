import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, Plus, Images, BookOpen } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { triggerHaptic } from '@/lib/haptics';
import { LivingCircle } from './LivingCircle';
import { SealButton } from './SealButton';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onCaptureMultiple: (imageDataUrls: string[]) => void;
  onBrowseAll: () => void;  // Library icon - goes to History/browse
  onOpenSearch: () => void; // Search icon - goes to Search
}

const CAPTURE_HINT_KEY = 'umarise_capture_hint_shown';

export function CameraView({ onCapture, onCaptureMultiple, onBrowseAll, onOpenSearch }: CameraViewProps) {
  const { isDemoMode } = useDemoMode();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [absorbingFiles, setAbsorbingFiles] = useState<{ id: number; x: number; y: number }[]>([]);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isMultiMode = capturedImages.length > 0;
  
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

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
        setError(null);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Camera access denied. You can still upload photos.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
  }, []);

  const takePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Haptic feedback on capture
    triggerHaptic('medium');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const rawImage = canvas.toDataURL('image/jpeg', 0.95);
      // Compress to max 2000px for optimal OCR + performance
      const compressedImage = await compressImage(rawImage);
      setCapturedImage(compressedImage);
      stopCamera();
    }
  }, [stopCamera]);

  const processFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;

    // Haptic feedback on file drop
    triggerHaptic('light');

    const imageFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.startsWith('image/')) {
        imageFiles.push(files[i]);
      }
    }

    if (imageFiles.length === 0) return;

    // Compress all images in parallel for optimal size
    const compressedImages = await Promise.all(
      imageFiles.map(file => compressImage(file))
    );

    // Success haptic after processing
    triggerHaptic('success');

    setCapturedImages(prev => [...prev, ...compressedImages]);
    stopCamera();
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
    event.target.value = '';
  }, [processFiles]);

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
      // Create absorbing animation particles at drop position
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const newAbsorbing = Array.from({ length: files.length }, (_, i) => ({
        id: Date.now() + i,
        x: e.clientX - centerX + (Math.random() - 0.5) * 100,
        y: e.clientY - centerY + (Math.random() - 0.5) * 100,
      }));
      setAbsorbingFiles(newAbsorbing);
      
      // Clear animation after it completes
      setTimeout(() => setAbsorbingFiles([]), 600);
      
      processFiles(files);
    }
  }, [processFiles]);

  // Thumbnail removal only (no reordering in Silent Multi mode)

  const retake = useCallback(() => {
    triggerHaptic('light');
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Quick add: instantly add to collection and continue capturing
  const addToCollection = useCallback(() => {
    if (capturedImage) {
      triggerHaptic('success');
      setCapturedImages(prev => [...prev, capturedImage]);
      setCapturedImage(null);
      startCamera();
    }
  }, [capturedImage, startCamera]);

  const removeFromCollection = useCallback((index: number) => {
    triggerHaptic('light');
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const confirmSingleCapture = useCallback(() => {
    if (capturedImage) {
      triggerHaptic('success');
      onCapture(capturedImage);
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [capturedImage, onCapture]);

  const confirmMultiCapture = useCallback(() => {
    if (capturedImages.length > 0) {
      triggerHaptic('success');
      const allImages = capturedImage 
        ? [...capturedImages, capturedImage]
        : capturedImages;
      onCaptureMultiple(allImages);
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [capturedImages, capturedImage, onCaptureMultiple]);

  const cancelMultiMode = useCallback(() => {
    triggerHaptic('light');
    setCapturedImages([]);
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Auto-start camera on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-codex-ink-deep via-codex-ink to-codex-forest flex flex-col relative overflow-hidden">
      {/* Hidden elements */}
      <canvas ref={canvasRef} className="hidden" />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Camera/Preview area */}
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
        ) : isStreaming ? (
          // Live camera feed
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            
            {/* Capture guide overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-primary-foreground/30 rounded-lg">
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-primary-foreground/60 rounded-tl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-primary-foreground/60 rounded-tr" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-primary-foreground/60 rounded-bl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-primary-foreground/60 rounded-br" />
              </div>
              
              {/* Scanning line effect */}
              <div className="absolute inset-8 overflow-hidden rounded-lg">
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-codex-gold/40 to-transparent animate-scan" />
              </div>
            </div>
          </div>
        ) : (
          // Living Circle interface — the breathing portal
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

            {/* The Living Circle — tap to upload */}
            <LivingCircle
              isDraggingOver={isDraggingOver}
              onClick={() => {
                markHintShown();
                fileInputRef.current?.click();
              }}
            />

            {/* Seal Button — press and hold to confirm */}
            {capturedImages.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12"
              >
                <SealButton
                  count={capturedImages.length}
                  onSeal={confirmMultiCapture}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>

      {/* Top bar - U seal for viewing origins, close when captured */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        {/* History icon - view marked beginnings (temporary: book icon until Wall of Existence) */}
        {!capturedImage && (
          <button
            onClick={onBrowseAll}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105 bg-codex-gold/10"
            aria-label="View marked beginnings"
          >
            <BookOpen className="w-6 h-6 text-codex-gold/80" strokeWidth={1.5} />
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

      {/* Thumbnail strip removed: showing multiple artifacts activates archiving psychology */}
      {/* At the moment of marking, only the current beginning exists */}

      {/* Bottom controls - only visible when camera/preview mode */}
      {(capturedImage || isStreaming) && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center">
          {capturedImage ? (
            // Preview mode: retake, add more, or seal
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
              
              <Button
                onClick={addToCollection}
                variant="ghost"
                size="lg"
                className="text-codex-gold hover:bg-codex-gold/10"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add more
              </Button>
              
              {/* Seal button for single/multi capture */}
              <SealButton
                count={isMultiMode ? capturedImages.length + 1 : 1}
                onSeal={isMultiMode ? confirmMultiCapture : confirmSingleCapture}
              />
            </motion.div>
          ) : isStreaming ? (
            // Camera mode: capture button
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm hover:bg-primary-foreground/20 transition-colors"
              >
                <Images className="w-5 h-5 text-primary-foreground" />
              </button>
              
              <Button
                onClick={takePhoto}
                variant="capture"
                size="capture"
                className="bg-primary-foreground text-codex-ink hover:bg-primary-foreground/90 relative"
              >
                <Camera className="w-7 h-7" strokeWidth={2} />
                {isMultiMode && (
                  <span className="absolute -top-1 -right-1 bg-codex-gold text-codex-ink text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {capturedImages.length}
                  </span>
                )}
              </Button>
              
              {isMultiMode && (
                <SealButton
                  count={capturedImages.length}
                  onSeal={confirmMultiCapture}
                />
              )}
            </motion.div>
          ) : null}
        </div>
      )}

      {/* No instructional text - the gesture is self-explanatory */}

      {/* Brief-modus toggle - temporarily hidden */}

    </div>
  );
}