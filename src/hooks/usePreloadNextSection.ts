import { useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Story } from '@/types/story'
import { getImageUrl } from '@/utils/imageUtils'

export const usePreloadNextSection = (
  story: Story,
  currentSectionIndex: number
) => {
  const preloadedVideoRef = useRef<HTMLVideoElement | null>(null)
  const preloadedImageRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    // Clean up previous preloads
    if (preloadedVideoRef.current) {
      preloadedVideoRef.current.pause()
      preloadedVideoRef.current.src = ''
      preloadedVideoRef.current = null
    }
    if (preloadedImageRef.current) {
      preloadedImageRef.current.src = ''
      preloadedImageRef.current = null
    }

    // Check if there's a next section
    const nextSectionIndex = currentSectionIndex + 1
    if (nextSectionIndex >= story.sections.length) {
      return
    }

    const nextSection = story.sections[nextSectionIndex]

    // Preload next section's video
    if (nextSection?.video) {
      const video = document.createElement('video')
      video.preload = 'auto'
      video.muted = true
      video.playsInline = true
      
      // Get video URL from Supabase storage
      const { data } = supabase.storage
        .from('course-videos')
        .getPublicUrl(nextSection.video)
      
      if (data?.publicUrl) {
        video.src = data.publicUrl
        // Load the video in the background
        video.load()
        preloadedVideoRef.current = video
      }
    }

    // Preload next section's image
    if (nextSection?.image) {
      const img = new Image()
      const imageUrl = getImageUrl(nextSection.image)
      img.src = imageUrl
      preloadedImageRef.current = img
    } else if (story.cover_image && !nextSection?.video) {
      // Preload cover image if it will be shown as fallback
      const img = new Image()
      const imageUrl = getImageUrl(story.cover_image)
      img.src = imageUrl
      preloadedImageRef.current = img
    }

    // Cleanup on unmount or when section changes
    return () => {
      if (preloadedVideoRef.current) {
        preloadedVideoRef.current.pause()
        preloadedVideoRef.current.src = ''
        preloadedVideoRef.current = null
      }
      if (preloadedImageRef.current) {
        preloadedImageRef.current.src = ''
        preloadedImageRef.current = null
      }
    }
  }, [currentSectionIndex, story])
}
