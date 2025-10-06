import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { getImageUrl } from '@/utils/imageUtils'
import { StoryFormData, StorySectionForm } from './useStoryForm'
import {
  parseTitle,
  parseDescription,
  parseStoryAudio,
  parseStorySections,
} from '../utils/storyDataParser'

export const useStoryData = (
  id: string | undefined,
  isEditing: boolean,
  setStoryData: React.Dispatch<React.SetStateAction<StoryFormData>>,
  setStorySections: React.Dispatch<React.SetStateAction<StorySectionForm[]>>,
  setCoverImagePreview: React.Dispatch<React.SetStateAction<string | null>>,
  setStoryAudioPreviews: React.Dispatch<React.SetStateAction<Record<string, string>>>
) => {
  const { data: storyDetails, isLoading } = useQuery({
    queryKey: ['admin-story', id],
    queryFn: async () => {
      if (!isEditing || !id) return null

      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()

      if (storyError) {
        toast.error('Failed to fetch story details')
        throw storyError
      }

      const { data: sections, error: sectionsError } = await supabase
        .from('story_sections')
        .select('*')
        .eq('story_id', id)
        .order('order', { ascending: true })

      if (sectionsError) {
        toast.error('Failed to fetch story sections')
        throw sectionsError
      }

      return {
        story,
        sections: sections || [],
      }
    },
    enabled: isEditing && !!id && id !== 'new',
    staleTime: Infinity,
  })

  useEffect(() => {
    if (storyDetails) {
      const { story, sections } = storyDetails

      if (story.cover_image) {
        setCoverImagePreview(getImageUrl(story.cover_image))
      }

      const titleObj = parseTitle(story.title)
      const descriptionObj = parseDescription(story.description)
      const storyAudioObj = parseStoryAudio(story.story_audio)

      if (storyAudioObj && Object.keys(storyAudioObj).length > 0) {
        const audioUrls: Record<string, string> = {}
        Object.entries(storyAudioObj as Record<string, string>).forEach(
          ([lang, audioFile]) => {
            if (audioFile) {
              audioUrls[lang] = getImageUrl(audioFile)
            }
          },
        )
        setStoryAudioPreviews(audioUrls)
      }

      setStoryData({
        title: titleObj,
        description: descriptionObj,
        category: story.category || '',
        duration: story.duration || 5,
        is_free: story.is_free,
        is_published: story.is_published,
        languages: story.languages || ['en'],
        cover_image: story.cover_image,
        audio_mode: (story.audio_mode || 'per_section') as
          | 'per_section'
          | 'single_story',
        story_audio: storyAudioObj,
      })

      if (sections && sections.length > 0) {
        setStorySections(parseStorySections(sections))
      } else {
        setStorySections([])
      }
    }
  }, [storyDetails, setStoryData, setStorySections, setCoverImagePreview, setStoryAudioPreviews])

  return { isLoading }
}
