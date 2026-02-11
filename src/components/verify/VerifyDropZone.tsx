import { useState, useRef, useCallback } from 'react';

interface VerifyDropZoneProps {
  onFile: (file: File) => void;
  isProcessing: boolean;
}

export function VerifyDropZone({ onFile, isProcessing }: VerifyDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  }, [onFile]);

  const handleClick = useCallback(() => {
    if (!isProcessing) inputRef.current?.click();
  }, [isProcessing]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    // Reset so same file can be selected again
    e.target.value = '';
  }, [onFile]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`
        border border-dashed p-12 text-center cursor-pointer transition-all duration-300 relative rounded
        ${isProcessing 
          ? 'pointer-events-none border-landing-muted/30 bg-landing-muted/5' 
          : isDragOver 
            ? 'border-landing-copper/50 bg-landing-muted/5' 
            : 'border-landing-muted/20 bg-landing-muted/5 hover:border-landing-copper/50 hover:bg-landing-muted/10'
        }
      `}
    >
      {/* Ghost circumpunct — empty ring, no dot (invites upload) */}
      <svg width="48" height="48" viewBox="0 0 48 48" className="mx-auto mb-4">
        <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(197,147,90,0.12)" strokeWidth="1.2"/>
      </svg>
      <div className="font-serif text-xl text-landing-cream mb-2">
        Drop your Anchor ZIP
      </div>
      <p className="text-sm text-landing-muted/50">
        or a photo, or a certificate.json
      </p>
      <p className="font-mono text-[10px] tracking-wider text-landing-muted/30 mt-4">
        Nothing leaves your device. The file is read locally.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.jpg,.jpeg,.png,.pdf,.json,.mp4,.mov,.webm,.mp3,.wav,.m4a,.heic,.webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
