import { supabase } from '@/integrations/supabase/client'

export const getImageUrl = (imagePath: string | null): string => {
  // If no image path, return empty string
  if (!imagePath) {
    return ''
  }

  // If it's already a full URL (existing Supabase URLs), return as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }

  // If it's a blob URL (for previews), return as is
  if (imagePath.startsWith('blob:')) {
    return imagePath
  }

  // For story section images
  if (imagePath.includes('section-')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-sections/${imagePath}`)

    return urlData.publicUrl
  }

  if (imagePath.includes('lesson-thumb-')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`course-thumbnails/${imagePath}`)

    return urlData.publicUrl
  }

  if (imagePath.includes('course-')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`course-covers/${imagePath}`)

    return urlData.publicUrl
  }

  // Default fallback - assume it's a relative path and try story-covers
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`story-covers/${imagePath}`)

  return urlData.publicUrl
}

export const getAudioUrl = (audioPath: string | null): string => {
  // If no audio path, return empty string
  if (!audioPath) {
    return ''
  }

  // If it's already a full URL, return as is
  if (audioPath.startsWith('http')) {
    return audioPath
  }

  // If it's a blob URL (for previews), return as is
  if (audioPath.startsWith('blob:')) {
    return audioPath
  }

  // For story voices/section audio
  if (audioPath.includes('voice-') || audioPath.includes('story-voices')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-voices/${audioPath}`)

    return urlData.publicUrl
  }

  // For story audio files
  if (audioPath.includes('audio-') || audioPath.includes('story-audio')) {
    const { data: urlData } = supabase.storage
      .from('admin-content')
      .getPublicUrl(`story-audio/${audioPath}`)

    return urlData.publicUrl
  }

  // Default fallback - assume it's story audio
  const { data: urlData } = supabase.storage
    .from('admin-content')
    .getPublicUrl(`story-audio/${audioPath}`)

  return urlData.publicUrl
}

export const getVideoUrl = (
  videoPath: string | null,
  videoUrl: string | null,
): string => {
  // If there's an external URL, use it
  if (
    videoUrl &&
    (videoUrl.startsWith('http://') || videoUrl.startsWith('https://'))
  ) {
    return videoUrl
  }

  // If there's a storage path, convert to public URL
  if (videoPath) {
    // If it's already a full URL, return as is
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      return videoPath
    }

    // Get the public URL from course-videos storage bucket
    const { data } = supabase.storage
      .from('course-videos')
      .getPublicUrl(videoPath)
    return data.publicUrl
  }

  return ''
}
