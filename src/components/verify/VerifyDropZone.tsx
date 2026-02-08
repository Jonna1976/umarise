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
        border border-dashed p-12 text-center cursor-pointer transition-all duration-300 relative
        ${isProcessing 
          ? 'pointer-events-none border-ritual-gold/30 bg-ritual-surface/50' 
          : isDragOver 
            ? 'border-ritual-gold/50 bg-ritual-gold/[0.03]' 
            : 'border-ritual-gold/20 bg-ritual-surface/50 hover:border-ritual-gold/50 hover:bg-ritual-gold/[0.03]'
        }
      `}
    >
      <div className="text-[28px] text-ritual-gold-muted mb-3.5 opacity-40">↑</div>
      <div className="font-serif font-light text-xl text-ritual-cream mb-2">
        Drop your Origin ZIP
      </div>
      <p className="text-sm text-ritual-cream-40">
        or a photo, or a certificate.json
      </p>
      <p className="font-mono text-[9px] tracking-wider text-ritual-gold/30 mt-4">
        Nothing leaves your device. The file is read locally.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept=".zip,.jpg,.jpeg,.png,.pdf,.json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
