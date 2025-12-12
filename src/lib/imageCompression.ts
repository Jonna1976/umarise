/**
 * Image compression utility for optimal OCR readability and performance
 * 
 * Target specs for handwriting OCR:
 * - Max dimension: 2000px (sufficient for clear text recognition)
 * - JPEG quality: 80% (good balance of quality vs size)
 * - Typical output: 150-400KB (vs 3-8MB originals)
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.8,
};

/**
 * Compress an image file or data URL to optimal size for OCR
 * @param input - File object or base64 data URL
 * @param options - Compression options
 * @returns Compressed image as base64 data URL
 */
export async function compressImage(
  input: File | string,
  options: CompressionOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Create image element
  const img = await loadImage(input);
  
  // Calculate new dimensions maintaining aspect ratio
  const { width, height } = calculateDimensions(
    img.naturalWidth,
    img.naturalHeight,
    opts.maxWidth,
    opts.maxHeight
  );
  
  // Skip compression if image is already small enough
  if (img.naturalWidth <= opts.maxWidth && img.naturalHeight <= opts.maxHeight) {
    // Still convert to JPEG with target quality for consistency
    return drawToCanvas(img, img.naturalWidth, img.naturalHeight, opts.quality);
  }
  
  return drawToCanvas(img, width, height, opts.quality);
}

/**
 * Load an image from File or data URL
 */
function loadImage(input: File | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    
    if (typeof input === 'string') {
      img.src = input;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(input);
    }
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;
  
  // Scale down if necessary
  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }
  
  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }
  
  return { width, height };
}

/**
 * Draw image to canvas and export as JPEG
 */
function drawToCanvas(
  img: HTMLImageElement,
  width: number,
  height: number,
  quality: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  // Use high-quality image smoothing for downscaling
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(img, 0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Get approximate file size of a base64 data URL in KB
 */
export function getBase64SizeKB(dataUrl: string): number {
  // Remove data URL prefix and calculate size
  const base64 = dataUrl.split(',')[1] || '';
  const bytes = Math.ceil((base64.length * 3) / 4);
  return Math.round(bytes / 1024);
}
