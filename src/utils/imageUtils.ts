
import { supabase } from "@/integrations/supabase/client";

export const getImageUrl = (imagePath: string | null, from?: string): string => {
  console.log('getImageUrl called with:', imagePath, 'from:', from);
  
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
  
  // Use the provided 'from' parameter or default to 'story-covers'
  const folderPath = from || 'story-covers';
  console.log(`Constructing Supabase URL for ${folderPath}:`, imagePath);
  
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`${folderPath}/${imagePath}`);
  
  console.log(`Generated Supabase URL for ${folderPath}:`, urlData.publicUrl);
  return urlData.publicUrl;
};
