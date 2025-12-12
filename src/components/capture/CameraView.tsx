import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, BookOpen, Plus, Images, GripVertical } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onCaptureMultiple: (imageDataUrls: string[]) => void;
  onOpenHistory: () => void;
}

export function CameraView({ onCapture, onCaptureMultiple, onOpenHistory }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isMultiMode = capturedImages.length > 0;

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
      processFiles(files);
    }
  }, [processFiles]);

  // Thumbnail reordering
  const handleThumbnailDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleThumbnailDragOver = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    setCapturedImages(prev => {
      const newImages = [...prev];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(targetIndex, 0, draggedImage);
      return newImages;
    });
    setDraggedIndex(targetIndex);
  }, [draggedIndex]);

  const handleThumbnailDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const addToCollection = useCallback(() => {
    if (capturedImage) {
      setCapturedImages(prev => [...prev, capturedImage]);
      setCapturedImage(null);
      startCamera();
    }
  }, [capturedImage, startCamera]);

  const removeFromCollection = useCallback((index: number) => {
    setCapturedImages(prev => prev.filter((_, i) => i !== index));
  }, []);

  const confirmSingleCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [capturedImage, onCapture]);

  const confirmMultiCapture = useCallback(() => {
    if (capturedImages.length > 0) {
      const allImages = capturedImage 
        ? [...capturedImages, capturedImage]
        : capturedImages;
      onCaptureMultiple(allImages);
      setCapturedImage(null);
      setCapturedImages([]);
    }
  }, [capturedImages, capturedImage, onCaptureMultiple]);

  const cancelMultiMode = useCallback(() => {
    setCapturedImages([]);
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  // Auto-start camera on mount
  useState(() => {
    startCamera();
    return () => stopCamera();
  });

  return (
    <div className="min-h-screen bg-codex-ink flex flex-col relative overflow-hidden">
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

      {/* Multi-image collection bar */}
      <AnimatePresence>
        {capturedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-16 left-0 right-0 z-20 p-3"
          >
            <div className="bg-codex-ink/90 backdrop-blur-md rounded-xl p-3 border border-primary-foreground/20">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Images className="w-4 h-4 text-codex-gold" />
                  <span className="text-primary-foreground text-sm font-medium">
                    {capturedImages.length} {capturedImages.length === 1 ? 'page' : 'pages'} in capsule
                  </span>
                </div>
                <button
                  onClick={cancelMultiMode}
                  className="text-primary-foreground/50 hover:text-primary-foreground text-xs"
                >
                  Cancel
                </button>
              </div>
              
              {/* Draggable thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {capturedImages.map((img, index) => (
                  <motion.div 
                    key={index} 
                    layout
                    className={`relative flex-shrink-0 cursor-grab active:cursor-grabbing ${
                      draggedIndex === index ? 'opacity-50' : ''
                    }`}
                    draggable
                    onDragStart={() => handleThumbnailDragStart(index)}
                    onDragOver={(e) => handleThumbnailDragOver(e, index)}
                    onDragEnd={handleThumbnailDragEnd}
                  >
                    <img
                      src={img}
                      alt={`Page ${index + 1}`}
                      className="w-12 h-16 object-cover rounded-lg border border-primary-foreground/20"
                    />
                    {/* Drag handle indicator */}
                    <div className="absolute inset-x-0 top-0 flex justify-center">
                      <GripVertical className="w-3 h-3 text-primary-foreground/40" />
                    </div>
                    <span className="absolute bottom-0.5 left-0.5 bg-codex-ink/80 text-primary-foreground text-[10px] px-1 rounded">
                      {index + 1}
                    </span>
                    {/* Neutral delete button (not red) */}
                    <button
                      onClick={() => removeFromCollection(index)}
                      className="absolute -top-1 -right-1 w-4 h-4 bg-primary-foreground/20 hover:bg-primary-foreground/40 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3 text-primary-foreground" />
                    </button>
                  </motion.div>
                ))}
              </div>
              
              <p className="text-primary-foreground/40 text-[10px] mt-2 text-center">
                Drag to reorder
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            className="text-center p-8 relative"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {/* Container for circle + orbiting orbs */}
            <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
              
              {/* Orbiting orbs for each captured image */}
              {capturedImages.map((_, index) => {
                const totalOrbs = capturedImages.length;
                const angle = (index / totalOrbs) * 360;
                const orbitRadius = 120; // px from center
                const orbColors = [
                  'from-amber-400 to-amber-600',
                  'from-blue-400 to-blue-600', 
                  'from-teal-400 to-teal-600',
                  'from-purple-400 to-purple-600',
                  'from-rose-400 to-rose-600',
                  'from-emerald-400 to-emerald-600',
                  'from-orange-400 to-orange-600',
                ];
                const colorClass = orbColors[index % orbColors.length];
                
                return (
                  <motion.div
                    key={index}
                    className="absolute w-4 h-4 rounded-full"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      rotate: [angle, angle + 360],
                    }}
                    transition={{
                      opacity: { duration: 0.3 },
                      scale: { duration: 0.3, type: 'spring' },
                      rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
                    }}
                    style={{
                      transformOrigin: 'center center',
                    }}
                  >
                    <motion.div
                      className={`w-4 h-4 rounded-full bg-gradient-to-br ${colorClass} shadow-lg`}
                      style={{
                        transform: `translateX(${orbitRadius}px)`,
                        boxShadow: `0 0 12px 2px rgba(255, 200, 100, 0.4)`,
                      }}
                      animate={{
                        boxShadow: [
                          '0 0 8px 2px rgba(255, 200, 100, 0.3)',
                          '0 0 16px 4px rgba(255, 200, 100, 0.5)',
                          '0 0 8px 2px rgba(255, 200, 100, 0.3)',
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                );
              })}
              
              {/* Glowing portal circle */}
              <motion.button
                onClick={() => fileInputRef.current?.click()}
                className="relative w-36 h-36 rounded-full flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'radial-gradient(circle, rgba(255, 191, 0, 0.15) 0%, rgba(255, 191, 0, 0.05) 50%, transparent 70%)',
                }}
              >
                {/* Outer glow */}
                <div 
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, transparent 40%, rgba(255, 180, 50, 0.1) 60%, transparent 80%)',
                    filter: 'blur(20px)',
                  }}
                />
                
                {/* Main glowing ring */}
                <motion.div
                  className="absolute inset-4 rounded-full"
                  style={{
                    border: '2px solid transparent',
                    background: `linear-gradient(#0a0a0a, #0a0a0a) padding-box, 
                               linear-gradient(135deg, rgba(255, 200, 100, 0.9), rgba(255, 150, 50, 0.6), rgba(255, 200, 100, 0.9)) border-box`,
                    boxShadow: isDraggingOver 
                      ? '0 0 40px 15px rgba(255, 180, 50, 0.5), inset 0 0 30px rgba(255, 180, 50, 0.2)'
                      : '0 0 30px 8px rgba(255, 180, 50, 0.3), inset 0 0 20px rgba(255, 180, 50, 0.1)',
                  }}
                  animate={{
                    boxShadow: isDraggingOver 
                      ? [
                          '0 0 40px 15px rgba(255, 180, 50, 0.5), inset 0 0 30px rgba(255, 180, 50, 0.2)',
                          '0 0 60px 20px rgba(255, 180, 50, 0.7), inset 0 0 40px rgba(255, 180, 50, 0.3)',
                          '0 0 40px 15px rgba(255, 180, 50, 0.5), inset 0 0 30px rgba(255, 180, 50, 0.2)',
                        ]
                      : [
                          '0 0 30px 8px rgba(255, 180, 50, 0.3), inset 0 0 20px rgba(255, 180, 50, 0.1)',
                          '0 0 40px 12px rgba(255, 180, 50, 0.4), inset 0 0 25px rgba(255, 180, 50, 0.15)',
                          '0 0 30px 8px rgba(255, 180, 50, 0.3), inset 0 0 20px rgba(255, 180, 50, 0.1)',
                        ],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Inner subtle glow */}
                <motion.div
                  className="absolute inset-8 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, rgba(255, 200, 100, 0.08) 0%, transparent 70%)',
                  }}
                  animate={{
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                
                {/* Pulsing attraction effect - only visible when dragging */}
                <AnimatePresence>
                  {isDraggingOver && (
                    <>
                      <motion.div
                        className="absolute inset-2 rounded-full border border-codex-gold/60"
                        initial={{ scale: 1.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.8 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-codex-gold/40"
                        initial={{ scale: 1.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{ duration: 0.5, delay: 0.2, repeat: Infinity }}
                      />
                    </>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
            
            {error && (
              <p className="text-primary-foreground/50 mt-6 text-sm">{error}</p>
            )}
            
            <p className="text-primary-foreground/30 text-xs mt-8">
              {capturedImages.length > 0 
                ? `${capturedImages.length} ${capturedImages.length === 1 ? 'page' : 'pages'} captured • tap to add more`
                : 'Tap or drag photos here'
              }
            </p>
            
            <button
              onClick={startCamera}
              className="block mx-auto mt-4 text-primary-foreground/40 text-xs hover:text-primary-foreground/60 transition-colors"
            >
              Try camera instead
            </button>
          </motion.div>
        )}
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button
          onClick={onOpenHistory}
          className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm hover:bg-primary-foreground/20 transition-colors"
        >
          <BookOpen className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
        </button>
        
        {capturedImage && (
          <button
            onClick={retake}
            className="w-10 h-10 rounded-full bg-primary-foreground/10 flex items-center justify-center backdrop-blur-sm hover:bg-primary-foreground/20 transition-colors"
          >
            <X className="w-5 h-5 text-primary-foreground" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Bottom controls */}
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

      {/* Hint text */}
      {isStreaming && !capturedImage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-28 left-0 right-0 text-center text-primary-foreground/50 text-sm"
        >
          {isMultiMode 
            ? `${capturedImages.length} pages captured. Add more or tap Done.`
            : 'Position your page within the frame'}
        </motion.p>
      )}
    </div>
  );
}