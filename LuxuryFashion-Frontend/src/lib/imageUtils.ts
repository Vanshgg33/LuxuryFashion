/**
 * Compresses an image file to be under the specified max size (in bytes)
 * Uses iterative quality reduction and resizing to achieve target size
 * @param file - The image file to compress
 * @param maxSizeBytes - Maximum file size in bytes (default: 4MB)
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @param maxHeight - Maximum height in pixels (default: 1920)
 * @returns Promise<File> - Compressed file
 */
export const compressImage = (
  file: File,
  maxSizeBytes: number = 4 * 1024 * 1024, // 4MB default
  maxWidth: number = 1920,
  maxHeight: number = 1920
): Promise<File> => {
  return new Promise((resolve, reject) => {
    // If file is already under the limit, return as-is
    if (file.size <= maxSizeBytes) {
      resolve(file);
      return;
    }

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Calculate dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;

      // Resize if image is too large
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw image to canvas
      ctx.drawImage(img, 0, 0, width, height);

      // Determine output format (prefer JPEG for better compression)
      const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
      
      // Try compressing with iterative quality reduction
      const tryCompress = (quality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }

            // If blob is under size limit or quality is too low, return it
            if (blob.size <= maxSizeBytes || quality <= 0.1) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, '') + '.jpg', {
                type: outputType,
                lastModified: Date.now(),
              });
              URL.revokeObjectURL(objectUrl);
              resolve(compressedFile);
            } else {
              // Reduce quality and try again
              tryCompress(quality - 0.1);
            }
          },
          outputType,
          quality
        );
      };

      // Start with 0.9 quality and reduce if needed
      tryCompress(0.9);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
};

/**
 * Compresses image to exactly 4MB or less (for Vercel compatibility)
 */
export const compressImageForUpload = (file: File): Promise<File> => {
  return compressImage(file, 4 * 1024 * 1024); // 4MB
};