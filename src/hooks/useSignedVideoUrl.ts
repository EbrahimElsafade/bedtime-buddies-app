import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { logger } from '@/utils/logger'

// In-memory cache for signed URLs (shared across components)
const urlCache = new Map<string, { url: string; expiresAt: number }>()

const CACHE_DURATION = 50 * 60 * 1000 // 50 minutes (URLs valid for 60 min)

export const getSignedVideoUrl = async (videoPath: string): Promise<string> => {
  if (!videoPath) return ''

  // If it's already a full URL, return as is
  if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
    return videoPath
  }

  // Check cache
  const cached = urlCache.get(videoPath)
  if (cached && Date.now() < cached.expiresAt) {
    return cached.url
  }

  try {
    const { data, error } = await supabase.functions.invoke('get-signed-video-url', {
      body: { videoPath },
    })

    if (error) {
      logger.error('Failed to get signed video URL:', error)
      return ''
    }

    if (data?.signedUrl) {
      urlCache.set(videoPath, {
        url: data.signedUrl,
        expiresAt: Date.now() + CACHE_DURATION,
      })
      return data.signedUrl
    }

    return ''
  } catch (err) {
    logger.error('Error fetching signed video URL:', err)
    return ''
  }
}

export const useSignedVideoUrl = (videoPath: string | null) => {
  const [url, setUrl] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const currentPathRef = useRef(videoPath)

  useEffect(() => {
    currentPathRef.current = videoPath

    if (!videoPath) {
      setUrl('')
      return
    }

    // Check cache synchronously
    if (videoPath.startsWith('http://') || videoPath.startsWith('https://')) {
      setUrl(videoPath)
      return
    }

    const cached = urlCache.get(videoPath)
    if (cached && Date.now() < cached.expiresAt) {
      setUrl(cached.url)
      return
    }

    setLoading(true)
    getSignedVideoUrl(videoPath).then((signedUrl) => {
      // Only update if the path hasn't changed
      if (currentPathRef.current === videoPath) {
        setUrl(signedUrl)
        setLoading(false)
      }
    })
  }, [videoPath])

  return { url, loading }
}
