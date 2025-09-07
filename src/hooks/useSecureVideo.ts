import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface SecureVideoResult {
  videoUrl: string | null;
  isLoading: boolean;
  error: string | null;
  requiresSubscription: boolean;
  hasVideo: boolean;
}

export const useSecureVideo = () => {
  const [videoData, setVideoData] = useState<Record<string, SecureVideoResult>>({});
  const { user } = useAuth();

  const getSecureVideoUrl = useCallback(async (lessonId: string): Promise<SecureVideoResult> => {
    // Return cached result if available and not expired
    const cached = videoData[lessonId];
    if (cached && cached.videoUrl) {
      return cached;
    }

    setVideoData(prev => ({
      ...prev,
      [lessonId]: {
        videoUrl: null,
        isLoading: true,
        error: null,
        requiresSubscription: false,
        hasVideo: true,
      }
    }));

    try {
      if (!user) {
        const result = {
          videoUrl: null,
          isLoading: false,
          error: 'Authentication required',
          requiresSubscription: false,
          hasVideo: true,
        };
        setVideoData(prev => ({ ...prev, [lessonId]: result }));
        return result;
      }

      const { data, error } = await supabase.functions.invoke('generate-video-url', {
        body: { lessonId },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        const result = {
          videoUrl: null,
          isLoading: false,
          error: data.error,
          requiresSubscription: data.requiresSubscription || false,
          hasVideo: data.hasVideo !== false,
        };
        setVideoData(prev => ({ ...prev, [lessonId]: result }));
        return result;
      }

      const result = {
        videoUrl: data.videoUrl,
        isLoading: false,
        error: null,
        requiresSubscription: false,
        hasVideo: true,
      };
      setVideoData(prev => ({ ...prev, [lessonId]: result }));
      return result;

    } catch (error) {
      console.error('Error getting secure video URL:', error);
      const result = {
        videoUrl: null,
        isLoading: false,
        error: 'Failed to load video',
        requiresSubscription: false,
        hasVideo: true,
      };
      setVideoData(prev => ({ ...prev, [lessonId]: result }));
      return result;
    }
  }, [user, videoData]);

  const clearVideoCache = useCallback((lessonId?: string) => {
    if (lessonId) {
      setVideoData(prev => {
        const newData = { ...prev };
        delete newData[lessonId];
        return newData;
      });
    } else {
      setVideoData({});
    }
  }, []);

  return {
    getSecureVideoUrl,
    clearVideoCache,
    videoData,
  };
};