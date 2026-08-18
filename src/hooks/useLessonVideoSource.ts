import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'

export interface LessonVideoSource {
  videoUrl: string
  videoPath: string
}

/**
 * Fetches the real video source of a lesson through a server-side gated RPC.
 *
 * The raw `video_url` / `video_path` columns are NOT readable by clients — the
 * database only hands them back when the lesson (or course) is free, the user
 * purchased the course, has an active membership, or is staff. This makes paid
 * lessons impossible to watch by inspecting network responses.
 */
export const useLessonVideoSource = (lessonId: string | undefined) => {
  return useQuery({
    queryKey: ['lesson-video-source', lessonId],
    enabled: !!lessonId,
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async (): Promise<LessonVideoSource | null> => {
      const { data, error } = await supabase.rpc('get_lesson_video_source', {
        _lesson_id: lessonId!,
      })

      if (error) throw error
      const row = Array.isArray(data) ? data[0] : data
      if (!row) return null
      return {
        videoUrl: (row as { video_url: string | null }).video_url || '',
        videoPath: (row as { video_path: string | null }).video_path || '',
      }
    },
  })
}
