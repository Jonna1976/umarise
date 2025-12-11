import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Camera, X, RotateCcw, Check, BookOpen } from 'lucide-react';

interface CameraViewProps {
  onCapture: (imageDataUrl: string) => void;
  onOpenHistory: () => void;
}

export function CameraView({ onCapture, onOpenHistory }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  const takePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(imageDataUrl);
      stopCamera();
    }
  }, [stopCamera]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCapturedImage(result);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  }, [stopCamera]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
    }
  }, [capturedImage, onCapture]);

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
        capture="environment"
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
                {/* Corner markers */}
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
          // No camera / upload fallback
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center p-8"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary-foreground/10 flex items-center justify-center mx-auto mb-6">
              <Camera className="w-10 h-10 text-primary-foreground/60" strokeWidth={1.5} />
            </div>
            
            {error && (
              <p className="text-primary-foreground/70 mb-6">{error}</p>
            )}
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="soft"
              size="lg"
            >
              Upload a photo
            </Button>
            
            <button
              onClick={startCamera}
              className="block mx-auto mt-4 text-primary-foreground/50 text-sm hover:text-primary-foreground/70 transition-colors"
            >
              Try camera again
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
            className="flex gap-4 items-center"
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
              onClick={confirmCapture}
              variant="capture"
              size="capture"
              className="bg-codex-gold hover:bg-codex-gold/90"
            >
              <Check className="w-7 h-7" strokeWidth={2} />
            </Button>
          </motion.div>
        ) : isStreaming ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Button
              onClick={takePhoto}
              variant="capture"
              size="capture"
              className="bg-primary-foreground text-codex-ink hover:bg-primary-foreground/90"
            >
              <Camera className="w-7 h-7" strokeWidth={2} />
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
          Position your page within the frame
        </motion.p>
      )}
    </div>
  );
}
