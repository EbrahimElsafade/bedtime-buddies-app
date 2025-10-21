/**
 * File validation utilities for secure file uploads
 * Validates file types, sizes, and MIME types to prevent malicious uploads
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

/**
 * Validates an image file for upload
 */
export const validateImageFile = (file: File): FileValidationResult => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid image type. Allowed types: JPEG, PNG, WebP`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Image too large. Maximum size: ${MAX_IMAGE_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file extension matches MIME type
  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];
  if (!extension || !validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file extension',
    };
  }

  return { valid: true };
};

/**
 * Validates an audio file for upload
 */
export const validateAudioFile = (file: File): FileValidationResult => {
  if (!ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid audio type. Allowed types: MP3, WAV`,
    };
  }

  if (file.size > MAX_AUDIO_SIZE) {
    return {
      valid: false,
      error: `Audio file too large. Maximum size: ${MAX_AUDIO_SIZE / 1024 / 1024}MB`,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['mp3', 'wav'];
  if (!extension || !validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid audio file extension',
    };
  }

  return { valid: true };
};

/**
 * Validates a video file for upload
 */
export const validateVideoFile = (file: File): FileValidationResult => {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid video type. Allowed types: MP4, WebM, MOV`,
    };
  }

  if (file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `Video file too large. Maximum size: ${MAX_VIDEO_SIZE / 1024 / 1024}MB`,
    };
  }

  const extension = file.name.split('.').pop()?.toLowerCase();
  const validExtensions = ['mp4', 'webm', 'mov'];
  if (!extension || !validExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid video file extension',
    };
  }

  return { valid: true };
};

/**
 * Generic file validator that determines type and applies appropriate validation
 */
export const validateFile = (
  file: File,
  expectedType: 'image' | 'audio' | 'video'
): FileValidationResult => {
  switch (expectedType) {
    case 'image':
      return validateImageFile(file);
    case 'audio':
      return validateAudioFile(file);
    case 'video':
      return validateVideoFile(file);
    default:
      return { valid: false, error: 'Unknown file type' };
  }
};
