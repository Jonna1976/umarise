import { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, Plus, Images, Search, Library, Link2 } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';
import { useDemoMode } from '@/contexts/DemoModeContext';
import { triggerHaptic } from '@/lib/haptics';
import { DeviceSyncDrawer } from '@/components/dev/DeviceSyncDrawer';

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
          // Zero UI: Glowing portal upload circle
          <motion.div
            ref={dropZoneRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8 relative group"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Phase 0: No copy, no explanation — pure instinct */}
            {/* Meaning arrives only in Phase 1 (Pause) after the action */}
            
            {/* Container for circle + orbiting orbs - large enough for orbit radius */}
            <div className="relative w-80 h-80 mx-auto flex items-center justify-center overflow-visible">
              
              {/* Absorbing file animation */}
              <AnimatePresence>
                {absorbingFiles.map((file) => (
                  <motion.div
                    key={file.id}
                    className="absolute w-6 h-6 rounded-full bg-codex-gold/80"
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
              
              {/* Single subtle count indicator - no individual artifacts shown */}
              {/* Orbiting orbs removed: showing multiple artifacts activates archiving psychology */}
              
              {/* Wrapper for hover group */}
              <div className="group/capture relative flex flex-col items-center">
              {/* Glowing portal circle - living organism */}
              <motion.button
                onClick={() => {
                  markHintShown();
                  fileInputRef.current?.click();
                }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                className="relative w-44 h-44 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Outer breathing glow */}
                <motion.div 
                  className="absolute inset-0 rounded-full"
                  animate={{
                    boxShadow: isDraggingOver 
                      ? [
                          '0 0 60px 30px rgba(255, 180, 50, 0.4)',
                          '0 0 80px 40px rgba(255, 180, 50, 0.6)',
                          '0 0 60px 30px rgba(255, 180, 50, 0.4)',
                        ]
                      : [
                          '0 0 40px 20px rgba(255, 180, 50, 0.2)',
                          '0 0 60px 30px rgba(255, 180, 50, 0.35)',
                          '0 0 40px 20px rgba(255, 180, 50, 0.2)',
                        ],
                  }}
                  transition={{
                    duration: isDraggingOver ? 1.5 : 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Main glowing ring */}
                <motion.div
                  className="absolute inset-4 rounded-full"
                  style={{
                    border: '3px solid transparent',
                    background: `linear-gradient(#0a0a0a, #0a0a0a) padding-box, 
                               linear-gradient(135deg, rgba(255, 200, 100, 0.95), rgba(255, 150, 50, 0.7), rgba(255, 200, 100, 0.95)) border-box`,
                  }}
                  animate={{
                    boxShadow: isDraggingOver 
                      ? [
                          '0 0 30px 10px rgba(255, 180, 50, 0.5), inset 0 0 40px rgba(255, 180, 50, 0.15)',
                          '0 0 50px 15px rgba(255, 180, 50, 0.7), inset 0 0 60px rgba(255, 180, 50, 0.25)',
                          '0 0 30px 10px rgba(255, 180, 50, 0.5), inset 0 0 40px rgba(255, 180, 50, 0.15)',
                        ]
                      : [
                          '0 0 20px 8px rgba(255, 180, 50, 0.25), inset 0 0 30px rgba(255, 180, 50, 0.08)',
                          '0 0 35px 12px rgba(255, 180, 50, 0.4), inset 0 0 50px rgba(255, 180, 50, 0.15)',
                          '0 0 20px 8px rgba(255, 180, 50, 0.25), inset 0 0 30px rgba(255, 180, 50, 0.08)',
                        ],
                  }}
                  transition={{
                    duration: isDraggingOver ? 1.2 : 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Pulsing black core with starfield - the "living organism" */}
                <motion.div
                  className="absolute inset-6 rounded-full overflow-hidden"
                  style={{
                    background: 'radial-gradient(ellipse at center, #0a0a12 0%, #000005 100%)',
                  }}
                  animate={{
                    scale: isDraggingOver ? [1, 0.92, 1] : [1, 0.96, 1],
                  }}
                  transition={{
                    duration: isDraggingOver ? 0.8 : 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                >
                  {/* Starfield - tiny dots that slowly drift toward center */}
                  {Array.from({ length: 30 }).map((_, i) => {
                    const angle = (i / 30) * 360;
                    const distance = 35 + (i % 5) * 8;
                    const size = 1 + (i % 3) * 0.5;
                    const opacity = 0.3 + (i % 4) * 0.15;
                    const duration = 3 + (i % 4) * 1.5;
                    
                    return (
                      <motion.div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                          width: size,
                          height: size,
                          background: `rgba(255, ${200 + (i % 3) * 20}, ${150 + (i % 5) * 20}, ${opacity})`,
                          left: '50%',
                          top: '50%',
                          boxShadow: `0 0 ${size * 2}px rgba(255, 200, 100, ${opacity * 0.5})`,
                        }}
                        animate={{
                          x: [
                            Math.cos((angle * Math.PI) / 180) * distance,
                            0,
                          ],
                          y: [
                            Math.sin((angle * Math.PI) / 180) * distance,
                            0,
                          ],
                          opacity: [opacity, 0],
                          scale: [1, 0],
                        }}
                        transition={{
                          duration: isDraggingOver ? duration * 0.4 : duration,
                          repeat: Infinity,
                          delay: (i % 8) * 0.3,
                          ease: 'easeIn',
                        }}
                      />
                    );
                  })}
                  
                  {/* Central glow - the "event horizon" */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'radial-gradient(circle, rgba(255, 180, 50, 0.12) 0%, transparent 50%)',
                    }}
                    animate={{
                      opacity: isDraggingOver ? [0.5, 1, 0.5] : [0.3, 0.6, 0.3],
                      scale: isDraggingOver ? [0.8, 1.1, 0.8] : [0.9, 1.05, 0.9],
                    }}
                    transition={{
                      duration: isDraggingOver ? 0.6 : 2,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  
                  {/* Inner glow ring */}
                  <motion.div
                    className="absolute inset-2 rounded-full"
                    style={{
                      boxShadow: 'inset 0 0 30px 10px rgba(255, 180, 50, 0.08)',
                    }}
                    animate={{
                      boxShadow: isDraggingOver 
                        ? [
                            'inset 0 0 30px 10px rgba(255, 180, 50, 0.12)',
                            'inset 0 0 50px 20px rgba(255, 180, 50, 0.2)',
                            'inset 0 0 30px 10px rgba(255, 180, 50, 0.12)',
                          ]
                        : [
                            'inset 0 0 20px 8px rgba(255, 180, 50, 0.05)',
                            'inset 0 0 40px 15px rgba(255, 180, 50, 0.1)',
                            'inset 0 0 20px 8px rgba(255, 180, 50, 0.05)',
                          ],
                    }}
                    transition={{
                      duration: isDraggingOver ? 0.8 : 2.5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  
                  {/* Camera icon - visible on hover (desktop) or first visit (mobile) */}
                  <AnimatePresence>
                    {(isHovering || isFirstVisit || isDraggingOver) && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Camera 
                          className="w-10 h-10 text-codex-gold/70" 
                          strokeWidth={1.5} 
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                
                {/* Sucking ripple effect - always visible, faster when dragging */}
                <motion.div
                  className="absolute inset-1 rounded-full border border-codex-gold/30"
                  animate={{
                    scale: [1.3, 1],
                    opacity: [0, 0.6, 0],
                  }}
                  transition={{
                    duration: isDraggingOver ? 0.8 : 2,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-codex-gold/20"
                  animate={{
                    scale: [1.5, 1],
                    opacity: [0, 0.4, 0],
                  }}
                  transition={{
                    duration: isDraggingOver ? 0.8 : 2,
                    delay: isDraggingOver ? 0.3 : 0.8,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              </motion.button>
              
              {/* Mobile: page count only when capturing */}
              {capturedImages.length > 0 && (
                <p className="md:hidden mt-6 text-center font-handwritten text-primary-foreground/60 text-xl">
                  {capturedImages.length} {capturedImages.length === 1 ? 'page' : 'pages'}
                </p>
              )}
              {/* Desktop: no explanatory text - the portal speaks for itself */}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Top bar - only show close when captured image */}
      {capturedImage && (
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-end items-center z-10">
          <button
            onClick={retake}
            className="w-14 h-14 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm hover:bg-primary-foreground/20 transition-colors"
            aria-label="Close"
          >
            <X className="w-7 h-7 text-primary-foreground" strokeWidth={1.5} />
          </button>
        </div>
      )}

      {/* Thumbnail strip removed: showing multiple artifacts activates archiving psychology */}
      {/* At the moment of marking, only the current beginning exists */}

      {/* Bottom controls - only visible when NOT showing the zen lens view */}
      {(capturedImage || isStreaming || capturedImages.length > 0) && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center">
          {capturedImage ? (
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
              
              <Button
                onClick={isMultiMode ? confirmMultiCapture : confirmSingleCapture}
                variant="capture"
                size="capture"
                className="bg-codex-gold hover:bg-codex-gold/90 relative"
              >
                <Check className="w-7 h-7" strokeWidth={2} />
                {isMultiMode && (
                  <span className="absolute -top-1 -right-1 bg-primary-foreground text-codex-ink text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {capturedImages.length + 1}
                  </span>
                )}
              </Button>
            </motion.div>
          ) : isStreaming ? (
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
                <Button
                  onClick={confirmMultiCapture}
                  variant="soft"
                  size="lg"
                  className="bg-codex-gold/20 text-codex-gold hover:bg-codex-gold/30"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Done ({capturedImages.length})
                </Button>
              )}
            </motion.div>
          ) : isMultiMode ? (
            // When in multi-mode but no camera, show confirm button
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4"
            >
              <Button
                onClick={confirmMultiCapture}
                variant="capture"
                size="capture"
                className="bg-codex-gold hover:bg-codex-gold/90"
              >
                <Check className="w-7 h-7" strokeWidth={2} />
                <span className="ml-2">{capturedImages.length}</span>
              </Button>
            </motion.div>
          ) : null}
        </div>
      )}

      {/* No instructional text - the gesture is self-explanatory */}

      {/* Brief-modus toggle - temporarily hidden */}

    </div>
  );
}