import { useEffect, useState } from 'react'

// Minimal typed interface for the parts of the YouTube Player we use
type YTPlayerInstance = {
  getDuration: () => number
  destroy: () => void
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: Element | string | HTMLElement,
        options: {
          height?: string
          width?: string
          videoId: string
          events?: {
            onReady?: (e: { target: YTPlayerInstance }) => void
            onError?: (e: unknown) => void
          }
        },
      ) => YTPlayerInstance
    }
    onYouTubeIframeAPIReady?: () => void
  }
}

// Parse YouTube video ID from typical URLs or accept plain video IDs
const parseYouTubeId = (urlOrId: string): string | null => {
  if (!urlOrId) return null
  const value = urlOrId.trim()

  // If it's already a plain 11-char YouTube ID, return it
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value

  // Otherwise try to extract from known URL patterns
  const patterns = [
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = value.match(p)
    if (m && m[1]) return m[1]
  }
  return null
}

let apiLoadingPromise: Promise<void> | null = null
const loadYouTubeIframeAPI = (): Promise<void> => {
  if (typeof window === 'undefined') return Promise.resolve()
  if (window.YT && window.YT.Player) return Promise.resolve()
  if (apiLoadingPromise) return apiLoadingPromise

  apiLoadingPromise = new Promise((resolve, reject) => {
    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    tag.async = true
    tag.onerror = () => reject(new Error('Failed to load YouTube API'))
    document.body.appendChild(tag)

    window.onYouTubeIframeAPIReady = () => {
      resolve()
    }
  })

  return apiLoadingPromise
}

export const getYouTubeDuration = async (videoUrl: string): Promise<number | null> => {
  const videoId = parseYouTubeId(videoUrl)
  if (!videoId) return null

  await loadYouTubeIframeAPI()

  return new Promise((resolve) => {
    const container = document.createElement('div')
    container.style.position = 'absolute'
    container.style.left = '-9999px'
    container.style.top = '0'
    document.body.appendChild(container)

    const PlayerConstructor = window.YT?.Player
    if (!PlayerConstructor) {
      container.remove()
      resolve(null)
      return
    }

    let player: YTPlayerInstance | null = null
    try {
      player = new PlayerConstructor(container, {
        height: '0',
        width: '0',
        videoId,
        events: {
            onReady: (e: { target: YTPlayerInstance }) => {
            try {
              const d = e.target.getDuration()
              try { e.target.destroy?.() } catch (err) { console.warn('YT destroy failed', err) }
              container.remove()
              if (isNaN(d)) {
                resolve(null)
              } else {
                resolve(Math.floor(d))
              }
            } catch (_err) {
              try { e.target.destroy?.() } catch (err) { console.warn('YT destroy failed', err) }
              container.remove()
              resolve(null)
            }
          },
          onError: () => {
            try { player?.destroy?.() } catch (err) { console.warn('YT destroy failed', err) }
            container.remove()
            resolve(null)
          },
        },
      })
    } catch (_err) {
      try { player?.destroy?.() } catch (err) { console.warn('YT destroy failed', err) }
      container.remove()
      resolve(null)
    }
  })
}

export const useYouTubeDuration = (videoUrl?: string) => {
  const [duration, setDuration] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    if (!videoUrl) return
    setLoading(true)
    setError(null)
    getYouTubeDuration(videoUrl)
      .then(d => {
        if (!mounted) return
        setDuration(d)
      })
      .catch(err => {
        if (!mounted) return
        setError(err instanceof Error ? err.message : String(err))
      })
      .finally(() => {
        if (!mounted) return
        setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [videoUrl])

  return { duration, loading, error }
}

export default useYouTubeDuration
