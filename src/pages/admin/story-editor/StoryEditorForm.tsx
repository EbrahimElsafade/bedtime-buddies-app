import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { StoryDetailsForm } from '@/components/admin/story-editor/StoryDetailsForm'
import { StoryLanguageManager } from '@/components/admin/story-editor/StoryLanguageManager'
import { StoryPublishControls } from '@/components/admin/story-editor/StoryPublishControls'
import { StoryAudioSettings } from '@/components/admin/story-editor/StoryAudioSettings'
import { StorySectionsList } from '@/components/admin/story-editor/StorySectionsList'
import { useStoryForm } from './hooks/useStoryForm'
import { useStoryLanguages } from './hooks/useStoryLanguages'
import { useStorySections } from './hooks/useStorySections'
import { validateImageFile, validateAudioFile } from '@/utils/fileValidation'
import { validateStoryData } from '@/utils/contentValidation'
import { useStoryData } from './hooks/useStoryData'
import { Category, Language } from '@/types/language'

interface StoryEditorFormProps {
  categories: Category[]
  categoriesLoading: boolean
  languages: Language[]
  languagesLoading: boolean
}

export const StoryEditorForm = ({
  categories,
  categoriesLoading,
  languages,
  languagesLoading,
}: StoryEditorFormProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    storyData,
    setStoryData,
    storySections,
    setStorySections,
    coverImageFile,
    coverImagePreview,
    setCoverImagePreview,
    setCoverImageFile,
    storyAudioFiles,
    storyAudioPreviews,
    setStoryAudioPreviews,
    handleCoverImageChange,
    handleStoryAudioChange,
    handleRemoveStoryAudio,
  } = useStoryForm()

  const { isLoading: storyLoading } = useStoryData(
    id,
    isEditing,
    setStoryData,
    setStorySections,
    setCoverImagePreview,
    setStoryAudioPreviews
  )

  const { handleAddLanguage, handleRemoveLanguage } = useStoryLanguages(
    storyData,
    setStoryData,
    storySections,
    setStorySections
  )

  const {
    addNewSection,
    deleteSection,
    handleSectionImageChange,
    handleClearSectionImage,
    handleSectionVideoChange,
    handleClearSectionVideo,
    handleSectionVoiceChange,
    handleRemoveSectionVoice,
    updateSectionText,
  } = useStorySections(storyData, storySections, setStorySections)

  const updateStoryTitle = (language: string, value: string) => {
    setStoryData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [language]: value,
      },
    }))
  }

  const updateStoryDescription = (language: string, value: string) => {
    setStoryData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [language]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate story data
      const contentValidation = validateStoryData({
        title: storyData.title,
        description: storyData.description,
      });
      
      if (!contentValidation.valid) {
        toast.error(contentValidation.error || 'Invalid story data');
        setIsSubmitting(false);
        return;
      }

      let coverImageUrl = storyData.cover_image
      let storyAudioUrls = storyData.story_audio

      // Upload cover image if changed
      if (coverImageFile) {
        // Validate image file
        const imageValidation = validateImageFile(coverImageFile);
        if (!imageValidation.valid) {
          toast.error(imageValidation.error || 'Invalid cover image');
          setIsSubmitting(false);
          return;
        }
        const filename = `cover-${Date.now()}-${coverImageFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('admin-content')
          .upload(`story-covers/${filename}`, coverImageFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) throw uploadError
        coverImageUrl = filename
      }

      // Upload story audio files if in single story mode
      if (
        storyData.audio_mode === 'single_story' &&
        Object.keys(storyAudioFiles).length > 0
      ) {
        const newStoryAudioUrls = { ...storyAudioUrls }

        for (const [language, audioFile] of Object.entries(storyAudioFiles)) {
          // Validate audio file
          const audioValidation = validateAudioFile(audioFile);
          if (!audioValidation.valid) {
            toast.error(`${language} audio: ${audioValidation.error}`);
            setIsSubmitting(false);
            return;
          }

          const filename = `story-audio-${Date.now()}-${language}-${audioFile.name}`
          const { error: uploadError } = await supabase.storage
            .from('admin-content')
            .upload(`story-audio/${filename}`, audioFile, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) throw uploadError
          newStoryAudioUrls[language] = filename
        }

        storyAudioUrls = newStoryAudioUrls
      }

      // Create or update the story
      let storyId = id
      const storyPayload = {
        title: storyData.title,
        description: storyData.description,
        category: storyData.category,
        cover_image: coverImageUrl,
        duration: storyData.duration,
        is_free: storyData.is_free,
        is_published: storyData.is_published,
        languages: storyData.languages,
        audio_mode: storyData.audio_mode,
        story_audio: JSON.stringify(storyAudioUrls),
      }

      if (!isEditing) {
        const { data: newStory, error: storyError } = await supabase
          .from('stories')
          .insert(storyPayload)
          .select('id')
          .single()

        if (storyError) throw storyError
        storyId = newStory.id
      } else {
        const { error: storyError } = await supabase
          .from('stories')
          .update(storyPayload)
          .eq('id', storyId)

        if (storyError) throw storyError
      }

      // Handle story sections
      if (isEditing) {
        const { error: deleteSectionsError } = await supabase
          .from('story_sections')
          .delete()
          .eq('story_id', storyId)

        if (deleteSectionsError) throw deleteSectionsError
      }

      // Insert all sections
      for (const section of storySections) {
        let sectionImageUrl = null
        if (section.imageFile) {
          // Validate section image
          const sectionImageValidation = validateImageFile(section.imageFile);
          if (!sectionImageValidation.valid) {
            toast.error(`Section ${section.order} image: ${sectionImageValidation.error}`);
            setIsSubmitting(false);
            return;
          }

          const filename = `section-${storyId}-${section.order}-${Date.now()}-${section.imageFile.name}`
          const { error: uploadError } = await supabase.storage
            .from('admin-content')
            .upload(`story-sections/${filename}`, section.imageFile, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) throw uploadError
          sectionImageUrl = filename
        } else if (typeof section.image === 'string') {
          sectionImageUrl = section.image
        }

        let sectionVideoUrl = null
        if (section.videoFiles && section.videoFiles.length > 0) {
          const videoFile = section.videoFiles[0] // Take the first file since we're only handling single MP4
          const filename = `story_${storyId}_section_${section.order}_${Date.now()}_${videoFile.name}`
          
          const { error: uploadError } = await supabase.storage
            .from('course-videos')
            .upload(filename, videoFile, {
              cacheControl: '3600',
              upsert: false,
            })

          if (uploadError) throw new Error(`Failed to upload video file: ${uploadError.message}`)
          sectionVideoUrl = filename
        } else if (typeof section.video === 'string') {
          sectionVideoUrl = section.video
        }

        // Upload voice files only if in per_section mode
        const voiceUrls: Record<string, string> = { ...section.voices }
        if (storyData.audio_mode === 'per_section' && section.voiceFiles) {
          for (const [language, voiceFile] of Object.entries(section.voiceFiles)) {
            // Validate voice file
            const voiceValidation = validateAudioFile(voiceFile);
            if (!voiceValidation.valid) {
              toast.error(`Section ${section.order} ${language} voice: ${voiceValidation.error}`);
              setIsSubmitting(false);
              return;
            }

            const filename = `voice-${storyId}-${section.order}-${language}-${Date.now()}-${voiceFile.name}`
            const { error: uploadError } = await supabase.storage
              .from('admin-content')
              .upload(`story-voices/${filename}`, voiceFile, {
                cacheControl: '3600',
                upsert: false,
              })

            if (uploadError) throw uploadError
            voiceUrls[language] = filename
          }
        }

        // Insert section
        const { error: sectionError } = await supabase
          .from('story_sections')
          .insert({
            story_id: storyId,
            order: section.order,
            image: sectionImageUrl,
            video: sectionVideoUrl,
            texts: section.texts,
            voices: storyData.audio_mode === 'per_section' ? voiceUrls : {},
          })

        if (sectionError) throw sectionError
      }

      await queryClient.invalidateQueries({ queryKey: ['admin-story'] })
      await queryClient.invalidateQueries({ queryKey: ['stories'] })

      toast.success(`Story ${isEditing ? 'updated' : 'created'} successfully!`)
      navigate('/admin/stories')
    } catch (error: any) {
      toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} story: ${error.message}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (storyLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">Loading story details...</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-8 grid gap-6">
        <StoryDetailsForm
          storyData={{
            title: storyData.title,
            description: storyData.description,
            category: storyData.category,
            cover_image: storyData.cover_image,
          }}
          categories={categories}
          categoriesLoading={categoriesLoading}
          coverImagePreview={coverImagePreview}
          onTitleChange={updateStoryTitle}
          onDescriptionChange={updateStoryDescription}
          onCategoryChange={value =>
            setStoryData({ ...storyData, category: value })
          }
          onCoverImageChange={handleCoverImageChange}
          onClearCoverImage={() => {
            setCoverImagePreview(null)
            setCoverImageFile(null)
            setStoryData({ ...storyData, cover_image: null })
          }}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <StoryPublishControls
            duration={storyData.duration}
            isFree={storyData.is_free}
            isPublished={storyData.is_published}
            onDurationChange={duration =>
              setStoryData({ ...storyData, duration })
            }
            onFreeChange={is_free => setStoryData({ ...storyData, is_free })}
            onPublishedChange={is_published =>
              setStoryData({ ...storyData, is_published })
            }
          />
        </div>

        <StoryLanguageManager
          selectedLanguages={storyData.languages}
          availableLanguages={languages}
          languagesLoading={languagesLoading}
          onAddLanguage={handleAddLanguage}
          onRemoveLanguage={handleRemoveLanguage}
        />

        <StoryAudioSettings
          audioMode={storyData.audio_mode}
          languages={storyData.languages}
          availableLanguages={languages}
          storyAudioFiles={storyAudioFiles}
          storyAudioPreviews={storyAudioPreviews}
          existingStoryAudio={storyData.story_audio}
          onAudioModeChange={mode =>
            setStoryData({ ...storyData, audio_mode: mode })
          }
          onStoryAudioChange={handleStoryAudioChange}
          onRemoveStoryAudio={handleRemoveStoryAudio}
        />

        <StorySectionsList
          sections={storySections}
          languages={storyData.languages}
          availableLanguages={languages}
          audioMode={storyData.audio_mode}
          onAddSection={addNewSection}
          onDeleteSection={deleteSection}
          onUpdateSectionText={updateSectionText}
          onSectionImageChange={handleSectionImageChange}
          onClearSectionImage={handleClearSectionImage}
          onSectionVideoChange={handleSectionVideoChange}
          onClearSectionVideo={handleClearSectionVideo}
          onSectionVoiceChange={handleSectionVoiceChange}
          onRemoveSectionVoice={handleRemoveSectionVoice}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/stories')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !storyData.title.en}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Update Story' : 'Create Story'}
        </Button>
      </div>
    </form>
  )
}
