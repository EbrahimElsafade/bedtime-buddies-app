
import { supabase } from "@/integrations/supabase/client";

export const getImageUrl = (coverImage: string | null): string => {
  console.log('getImageUrl called with:', coverImage);
  
  // If no cover image, return default
  if (!coverImage) {
    console.log('No cover image, returning default');
    return 'https://images.unsplash.com/photo-1532251632967-86af52cbab08?q=80&w=1000';
  }
  
  // If it's already a full URL (like Unsplash or existing Supabase URLs), return as is
  if (coverImage.startsWith('http')) {
    console.log('Full URL detected, returning as is:', coverImage);
    return coverImage;
  }
  
  // If it's a blob URL (for previews), return as is
  if (coverImage.startsWith('blob:')) {
    console.log('Blob URL detected, returning as is:', coverImage);
    return coverImage;
  }
  
  // If it's a relative path, construct the Supabase storage URL using the admin-content bucket
  console.log('Constructing Supabase URL for:', coverImage);
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`story-covers/${coverImage}`);
  
  console.log('Generated Supabase URL:', urlData.publicUrl);
  return urlData.publicUrl;
};
