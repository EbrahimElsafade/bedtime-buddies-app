import { useState, useEffect, useCallback, useMemo, useRef } from 'react'

interface UseInfiniteScrollOptions {
  pageSize?: number
  threshold?: number // pixels from bottom to trigger load
}

interface UseInfiniteScrollResult<T> {
  visibleItems: T[]
  hasMore: boolean
  loadMore: () => void
  isLoadingMore: boolean
  reset: () => void
  loadedCount: number
  totalCount: number
}

export function useInfiniteScroll<T>(
  items: T[],
  options: UseInfiniteScrollOptions = {}
): UseInfiniteScrollResult<T> {
  const { pageSize = 12, threshold = 200 } = options
  
  const [loadedCount, setLoadedCount] = useState(pageSize)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadingRef = useRef(false)

  const visibleItems = useMemo(() => 
    items.slice(0, loadedCount)
  , [items, loadedCount])

  const hasMore = loadedCount < items.length

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return
    
    loadingRef.current = true
    setIsLoadingMore(true)
    
    // Small delay for smooth UX
    setTimeout(() => {
      setLoadedCount(prev => Math.min(prev + pageSize, items.length))
      setIsLoadingMore(false)
      loadingRef.current = false
    }, 150)
  }, [hasMore, pageSize, items.length])

  const reset = useCallback(() => {
    setLoadedCount(pageSize)
  }, [pageSize])

  // Reset when items change (e.g., filter applied)
  useEffect(() => {
    setLoadedCount(pageSize)
  }, [items.length, pageSize])

  // Scroll listener for auto-loading
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || loadingRef.current) return

      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight

      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loadMore()
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadMore, threshold])

  return {
    visibleItems,
    hasMore,
    loadMore,
    isLoadingMore,
    reset,
    loadedCount,
    totalCount: items.length,
  }
}
