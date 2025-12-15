import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useGamification } from './useGamification'

interface UseContentProgressOptions {
  contentType: 'story_section' | 'course_lesson'
  contentId: string
  parentId: string
  enabled?: boolean
}

/**
 * Hook to automatically record content progress when a section/lesson is opened
 */
export const useContentProgress = ({
  contentType,
  contentId,
  parentId,
  enabled = true,
}: UseContentProgressOptions) => {
  const { isAuthenticated } = useAuth()
  const { recordProgress } = useGamification()
  const hasRecorded = useRef(false)

  const record = useCallback(async () => {
    if (!isAuthenticated || !enabled || hasRecorded.current) return
    if (!contentId || !parentId) return

    hasRecorded.current = true
    await recordProgress(contentType, contentId, parentId)
  }, [isAuthenticated, enabled, contentId, parentId, contentType, recordProgress])

  // Record progress when component mounts (content is opened)
  useEffect(() => {
    record()
  }, [record])

  // Reset when content changes
  useEffect(() => {
    hasRecorded.current = false
  }, [contentId])

  return { recordProgress: record }
}
