import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import type { SkillPathTheme } from '@/components/home/skillPathThemes'
import { isSkillPathTheme } from '@/components/home/skillPathThemes'

export interface SkillPath {
  id: string
  name: Record<string, string>
  icon: string
  description: Record<string, string>
  display_order: number
  course_ids: string[]
  theme: SkillPathTheme
}

export const useSkillPaths = () => {
  return useQuery({
    queryKey: ['skill-paths'],
    queryFn: async (): Promise<SkillPath[]> => {
      const { data: paths, error } = await supabase
        .from('skill_paths')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: true })
      if (error) throw error

      const { data: links, error: linksError } = await supabase
        .from('skill_path_courses')
        .select('skill_path_id, course_id, display_order')
        .order('display_order', { ascending: true })
      if (linksError) throw linksError

      return (paths || []).map((p) => {
        const rawTheme = (p as { theme?: unknown }).theme
        return {
          id: p.id,
          name: (p.name as Record<string, string>) || {},
          icon: p.icon || '📚',
          description: (p.description as Record<string, string>) || {},
          display_order: p.display_order,
          theme: isSkillPathTheme(rawTheme) ? rawTheme : 'blue-neon',
          course_ids: (links || [])
            .filter((l) => l.skill_path_id === p.id)
            .map((l) => l.course_id),
        }
      })
    },
  })
}

export const useSkillPath = (id: string | undefined) => {
  return useQuery({
    queryKey: ['skill-path', id],
    enabled: !!id,
    queryFn: async (): Promise<SkillPath | null> => {
      if (!id) return null
      const { data: p, error } = await supabase
        .from('skill_paths')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (error) throw error
      if (!p) return null
      const { data: links } = await supabase
        .from('skill_path_courses')
        .select('course_id, display_order')
        .eq('skill_path_id', id)
        .order('display_order', { ascending: true })
      const rawTheme = (p as { theme?: unknown }).theme
      return {
        id: p.id,
        name: (p.name as Record<string, string>) || {},
        icon: p.icon || '📚',
        description: (p.description as Record<string, string>) || {},
        display_order: p.display_order,
        theme: isSkillPathTheme(rawTheme) ? rawTheme : 'blue-neon',
        course_ids: (links || []).map((l) => l.course_id),
      }
    },
  })
}

/** Returns map of skillPathId -> { completed, total } for current user */
export const useSkillPathProgress = (paths: SkillPath[] | undefined) => {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['skill-path-progress', user?.id, paths?.map((p) => p.id).join(',')],
    enabled: !!paths,
    queryFn: async (): Promise<Record<string, { completed: number; total: number }>> => {
      const result: Record<string, { completed: number; total: number }> = {}
      if (!paths) return result
      let finishedIds: Set<string> = new Set()
      if (user) {
        const { data } = await supabase
          .from('user_finished_content')
          .select('content_id')
          .eq('user_id', user.id)
          .eq('content_type', 'course')
        finishedIds = new Set((data || []).map((r) => r.content_id))
      }
      for (const p of paths) {
        const total = p.course_ids.length
        const completed = p.course_ids.filter((id) => finishedIds.has(id)).length
        result[p.id] = { completed, total }
      }
      return result
    },
  })
}
