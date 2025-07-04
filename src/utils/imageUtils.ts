
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
  
  // For story cover images
  if (imagePath.includes('cover-') || !imagePath.includes('/')) {
    console.log('Constructing Supabase URL for story cover:', imagePath);
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-sections/${imagePath}`);
    
    console.log('Generated Supabase URL for cover:', urlData.publicUrl);
    return urlData.publicUrl;
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
