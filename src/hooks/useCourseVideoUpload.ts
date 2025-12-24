import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/utils/logger';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

interface VideoUploadResult {
  hlsPath: string;
}

export const useCourseVideoUpload = () => {
  const [uploadStates, setUploadStates] = useState<Record<number, UploadState>>({});

  const uploadAndTranscodeVideo = async (
    file: File,
    courseId: string,
    lessonOrder: number
  ): Promise<VideoUploadResult | null> => {
    setUploadStates(prev => ({
      ...prev,
      [lessonOrder]: { isUploading: true, progress: 0, error: null }
    }));

    try {
      // Validate file size (500MB max for course videos)
      const maxSize = 500 * 1024 * 1024; // 500MB
      if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size is 500MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB`);
      }

      setUploadStates(prev => ({
        ...prev,
        [lessonOrder]: { ...prev[lessonOrder], progress: 10 }
      }));

      // Upload original video to storage
      const timestamp = Date.now();
      const originalPath = `uploads/${courseId}/lesson-${lessonOrder}-${timestamp}-${file.name}`;
      
      const { error: uploadError } = await supabase.storage
        .from('course-videos')
        .upload(originalPath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      setUploadStates(prev => ({
        ...prev,
        [lessonOrder]: { ...prev[lessonOrder], progress: 50 }
      }));

      // Call edge function to transcode video to HLS
      const { data, error: transcodeError } = await supabase.functions.invoke('transcode-video', {
        body: {
          videoPath: originalPath,
          courseId,
          lessonOrder,
        },
      });

      if (transcodeError) {
        throw new Error(`Transcode failed: ${transcodeError.message}`);
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Transcode failed');
      }

      setUploadStates(prev => ({
        ...prev,
        [lessonOrder]: { isUploading: false, progress: 100, error: null }
      }));

      toast.success(`Lesson ${lessonOrder} video uploaded and processed`);

      return {
        hlsPath: data.hlsPath,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      logger.error('Video upload error:', error);
      
      setUploadStates(prev => ({
        ...prev,
        [lessonOrder]: { isUploading: false, progress: 0, error: errorMessage }
      }));

      toast.error(errorMessage);
      return null;
    }
  };

  const getUploadState = (lessonOrder: number): UploadState => {
    return uploadStates[lessonOrder] || { isUploading: false, progress: 0, error: null };
  };

  const clearUploadState = (lessonOrder: number) => {
    setUploadStates(prev => {
      const newState = { ...prev };
      delete newState[lessonOrder];
      return newState;
    });
  };

  return {
    uploadAndTranscodeVideo,
    getUploadState,
    clearUploadState,
  };
};
