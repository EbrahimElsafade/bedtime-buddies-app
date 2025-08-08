
export const sanitizeFilename = (filename: string): string => {
  // Remove or replace problematic characters
  return filename
    // Replace Arabic/Unicode characters with safe alternatives
    .replace(/[أ-ي]/g, '') // Remove Arabic characters
    .replace(/[^\w\s.-]/g, '') // Remove special characters except word chars, spaces, dots, and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .toLowerCase() // Convert to lowercase for consistency
    .substring(0, 200); // Limit length to prevent issues
};

export const generateSafeFilename = (originalFilename: string, prefix: string = '', suffix: string = ''): string => {
  const extension = originalFilename.split('.').pop() || '';
  const nameWithoutExtension = originalFilename.replace(/\.[^/.]+$/, '');
  const sanitizedName = sanitizeFilename(nameWithoutExtension);
  
  // If sanitized name is too short or empty, use a fallback
  const finalName = sanitizedName.length < 3 ? `file-${Date.now()}` : sanitizedName;
  
  return `${prefix}${finalName}${suffix}.${extension}`;
};
