import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateAudioFile, validateVideoFile } from '@/utils/fileValidation';

export const useInstantUpload = () => {
  const [uploadingFiles, setUploadingFiles] = useState<Record<string, boolean>>({});

  const uploadVideo = async (
    file: File,
    storyId: string,
    sectionOrder: number
  ): Promise<string | null> => {
    const uploadKey = `video-${sectionOrder}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid video file');
        return null;
      }

      const filename = `story_${storyId}_section_${sectionOrder}_${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('course-videos')
        .upload(filename, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      toast.success('Video uploaded successfully');
      return filename;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to upload video: ${errorMessage}`);
      return null;
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const uploadAudio = async (
    file: File,
    storyId: string,
    sectionOrder: number,
    language: string,
    type: 'story' | 'section'
  ): Promise<string | null> => {
    const uploadKey = `audio-${type}-${sectionOrder}-${language}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));

    try {
      const validation = validateAudioFile(file);
      if (!validation.valid) {
        toast.error(validation.error || 'Invalid audio file');
        return null;
      }

      const folder = type === 'story' ? 'story-audio' : 'story-voices';
      const filename = type === 'story'
        ? `story-audio-${Date.now()}-${language}-${file.name}`
        : `voice-${storyId}_${sectionOrder}_${language}_${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from('admin-content')
        .upload(`${folder}/${filename}`, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      toast.success(`${language} audio uploaded successfully`);
      return filename;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast.error(`Failed to upload ${language} audio: ${errorMessage}`);
      return null;
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const isUploading = (key: string) => uploadingFiles[key] || false;

  return {
    uploadVideo,
    uploadAudio,
    isUploading,
    uploadingFiles,
  };
};
