
import { supabase } from "@/integrations/supabase/client";

export const getImageUrl = (imagePath: string | null): string => {
  console.log('getImageUrl called with:', imagePath);
  
  // If no image path, return empty string
  if (!imagePath) {
    console.log('No image path provided');
    return '';
  }
  
  // If it's already a full URL (existing Supabase URLs), return as is
  if (imagePath.startsWith('http')) {
    console.log('Full URL detected, returning as is:', imagePath);
    return imagePath;
  }
  
  // If it's a blob URL (for previews), return as is
  if (imagePath.startsWith('blob:')) {
    console.log('Blob URL detected, returning as is:', imagePath);
    return imagePath;
  }
  
  // For story section images
  if (imagePath.includes('section-')) {
    console.log('Constructing Supabase URL for story section:', imagePath);
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-sections/${imagePath}`);
    
    console.log('Generated Supabase URL for section:', urlData.publicUrl);
    return urlData.publicUrl;
  }
  
  // Default fallback - assume it's a relative path and try story-covers
  console.log('Fallback: Constructing Supabase URL for:', imagePath);
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`story-covers/${imagePath}`);
  
  console.log('Generated fallback Supabase URL:', urlData.publicUrl);
  return urlData.publicUrl;
};

export const getAudioUrl = (audioPath: string | null): string => {
  console.log('getAudioUrl called with:', audioPath);
  
  // If no audio path, return empty string
  if (!audioPath) {
    console.log('No audio path provided');
    return '';
  }
  
  // If it's already a full URL, return as is
  if (audioPath.startsWith('http')) {
    console.log('Full audio URL detected, returning as is:', audioPath);
    return audioPath;
  }
  
  // If it's a blob URL (for previews), return as is
  if (audioPath.startsWith('blob:')) {
    console.log('Blob audio URL detected, returning as is:', audioPath);
    return audioPath;
  }
  
  // For story voices/section audio
  if (audioPath.includes('voice-') || audioPath.includes('story-voices')) {
    console.log('Constructing Supabase URL for story voice:', audioPath);
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-voices/${audioPath}`);
    
    console.log('Generated Supabase URL for voice:', urlData.publicUrl);
    return urlData.publicUrl;
  }
  
  // For story audio files
  if (audioPath.includes('audio-') || audioPath.includes('story-audio')) {
    console.log('Constructing Supabase URL for story audio:', audioPath);
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-audio/${audioPath}`);
    
    console.log('Generated Supabase URL for audio:', urlData.publicUrl);
    return urlData.publicUrl;
  }
  
  // Default fallback - assume it's story audio
  console.log('Fallback: Constructing Supabase URL for audio:', audioPath);
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`story-audio/${audioPath}`);
  
  console.log('Generated fallback Supabase URL for audio:', urlData.publicUrl);
  return urlData.publicUrl;
};
