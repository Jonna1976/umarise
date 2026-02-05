/**
 * Thumbnail Service for Umarise v4
 * 
 * Generates compressed thumbnails for local storage in IndexedDB.
 * Target: ~400px max dimension, JPEG 70%, <50KB
 */

const MAX_DIMENSION = 400;
const JPEG_QUALITY = 0.7;
const MAX_SIZE_BYTES = 50 * 1024; // 50KB

/**
 * Generate a thumbnail from an image data URL
 * 
 * @param imageDataUrl - Original image as data URL
 * @returns Thumbnail as Blob
 */
export async function generateThumbnail(imageDataUrl: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        // Calculate dimensions maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Use high-quality image scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob with quality reduction if needed
        let quality = JPEG_QUALITY;
        
        const attemptConversion = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to create thumbnail blob'));
                return;
              }
              
              // If still too large, reduce quality further
              if (blob.size > MAX_SIZE_BYTES && q > 0.3) {
                attemptConversion(q - 0.1);
              } else {
                console.log(`[Thumbnail] Generated: ${width}x${height}, ${(blob.size / 1024).toFixed(1)}KB, q=${q.toFixed(1)}`);
                resolve(blob);
              }
            },
            'image/jpeg',
            q
          );
        };
        
        attemptConversion(quality);
      } catch (e) {
        reject(e);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for thumbnail'));
    };
    
    img.src = imageDataUrl;
  });
}

/**
 * Convert a Blob to a data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Create an object URL for a thumbnail blob
 * Remember to revoke with URL.revokeObjectURL() when done
 */
export function createThumbnailUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Determine size class based on image dimensions
 */
export function determineSizeClass(width: number, height: number): 'small' | 'medium' | 'large' {
  const pixels = width * height;
  
  if (pixels < 500000) return 'small';   // < 0.5MP
  if (pixels < 2000000) return 'medium'; // < 2MP
  return 'large';                        // >= 2MP
}
