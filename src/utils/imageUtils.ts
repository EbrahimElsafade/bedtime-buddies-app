
import { supabase } from "@/integrations/supabase/client";

export const getImageUrl = (imagePath: string | null): string => {
  // If no image path, return empty string
  if (!imagePath) {
    return '';
  }
  
  // If it's already a full URL (existing Supabase URLs), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a blob URL (for previews), return as is
  if (imagePath.startsWith('blob:')) {
    return imagePath;
  }
  
  // For story section images
  if (imagePath.includes('section-')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-sections/${imagePath}`);
    
    return urlData.publicUrl;
  }
  
  // Default fallback - assume it's a relative path and try story-covers
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`story-covers/${imagePath}`);
  
  return urlData.publicUrl;
};

export const getAudioUrl = (audioPath: string | null): string => {
  // If no audio path, return empty string
  if (!audioPath) {
    return '';
  }
  
  // If it's already a full URL, return as is
  if (audioPath.startsWith('http')) {
    return audioPath;
  }
  
  // If it's a blob URL (for previews), return as is
  if (audioPath.startsWith('blob:')) {
    return audioPath;
  }
  
  // For story voices/section audio
  if (audioPath.includes('voice-') || audioPath.includes('story-voices')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-voices/${audioPath}`);
    
    return urlData.publicUrl;
  }
  
  // For story audio files
  if (audioPath.includes('audio-') || audioPath.includes('story-audio')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-audio/${audioPath}`);
    
    return urlData.publicUrl;
  }
  
  // Default fallback - assume it's story audio
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`story-audio/${audioPath}`);
  
  return urlData.publicUrl;
};
