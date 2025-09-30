import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { getImageUrl } from '@/utils/imageUtils'
import { Story, StorySection } from '@/types/story'
import { StoryDetailsForm } from '@/components/admin/story-editor/StoryDetailsForm'
import { StoryLanguageManager } from '@/components/admin/story-editor/StoryLanguageManager'
import { StoryPublishControls } from '@/components/admin/story-editor/StoryPublishControls'
import { StoryAudioSettings } from '@/components/admin/story-editor/StoryAudioSettings'
import { StorySectionsList } from '@/components/admin/story-editor/StorySectionsList'

interface StorySectionForm extends Omit<StorySection, 'id'> {
  id?: string
  imageFile?: File | null
  imagePreview?: string | null
  voiceFiles?: Record<string, File>
  voicePreviews?: Record<string, string>
}

// Fixed app languages
const APP_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ar', name: 'Arabic' },
  { code: 'fr', name: 'French' },
]

const StoryEditor = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== 'new' && !!id

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null,
  )
  const [storyAudioFiles, setStoryAudioFiles] = useState<Record<string, File>>(
    {},
  )
  const [storyAudioPreviews, setStoryAudioPreviews] = useState<
    Record<string, string>
  >({})

  // Story form data - Updated to handle multilingual titles and descriptions with fixed languages
  const [storyData, setStoryData] = useState({
    title: { en: '', ar: '', fr: '' } as Record<string, string>,
    description: { en: '', ar: '', fr: '' } as Record<string, string>,
    category: '',
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ['en'],
    cover_image: null as string | null,
    audio_mode: 'per_section' as 'per_section' | 'single_story',
    story_audio: {} as Record<string, string>,
  })

  // Story sections
  const [storySections, setStorySections] = useState<StorySectionForm[]>([])

  // Fetch categories from database
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['story-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_categories')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  // Fetch languages from database
  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ['story-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_languages')
        .select('*')
        .order('name')

      if (error) throw error
      return data
    },
  })

  // Fetch story data if editing
  const { data: storyDetails, isLoading } = useQuery({
    queryKey: ['admin-story', id],
    queryFn: async () => {
      if (!isEditing || !id) return null

      console.log('Fetching story for ID:', id)

      // Fetch story details
      const { data: story, error: storyError } = await supabase
        .from('stories')
        .select('*')
        .eq('id', id)
        .single()

      if (storyError) {
        console.error('Story fetch error:', storyError)
        toast.error('Failed to fetch story details')
        throw storyError
      }

      // Fetch story sections
      const { data: sections, error: sectionsError } = await supabase
        .from('story_sections')
        .select('*')
        .eq('story_id', id)
        .order('order', { ascending: true })

      if (sectionsError) {
        console.error('Sections fetch error:', sectionsError)
        toast.error('Failed to fetch story sections')
        throw sectionsError
      }

      console.log('Fetched story sections:', sections)

      return {
        story,
        sections: sections || [],
      }
    },
    enabled: isEditing && !!id && id !== 'new',
    staleTime: Infinity,
  })

  useEffect(() => {
    console.log(
      'StoryEditor - isEditing:',
      isEditing,
      'id:',
      id,
      'storyDetails:',
      storyDetails,
    )

    if (storyDetails) {
      const { story, sections } = storyDetails

      // Handle cover image preview
      if (story.cover_image) {
        const imageUrl = getImageUrl(story.cover_image)
        console.log('Setting preview image URL:', imageUrl)
        setCoverImagePreview(imageUrl)
      }

      // Handle multilingual title and description with fixed languages
      let titleObj = { en: '', ar: '', fr: '' }
      let descriptionObj = { en: '', ar: '', fr: '' }
      let storyAudioObj = {}

      // Parse title
      if (typeof story.title === 'string') {
        try {
          const parsed = JSON.parse(story.title)
          titleObj = {
            en: parsed.en || '',
            ar: parsed.ar || '',
            fr: parsed.fr || '',
          }
        } catch {
          titleObj = { en: story.title, ar: '', fr: '' }
        }
      } else if (story.title && typeof story.title === 'object') {
        const existingTitle = story.title as Record<string, string>
        titleObj = {
          en: existingTitle.en || '',
          ar: existingTitle.ar || '',
          fr: existingTitle.fr || '',
        }
      }

      // Parse description
      if (typeof story.description === 'string') {
        try {
          const parsed = JSON.parse(story.description)
          descriptionObj = {
            en: parsed.en || '',
            ar: parsed.ar || '',
            fr: parsed.fr || '',
          }
        } catch {
          descriptionObj = { en: story.description, ar: '', fr: '' }
        }
      } else if (story.description && typeof story.description === 'object') {
        const existingDescription = story.description as Record<string, string>
        descriptionObj = {
          en: existingDescription.en || '',
          ar: existingDescription.ar || '',
          fr: existingDescription.fr || '',
        }
      }

      // Parse story audio
      if (typeof story.story_audio === 'string') {
        try {
          storyAudioObj = JSON.parse(story.story_audio)
        } catch {
          storyAudioObj = { en: story.story_audio }
        }
      } else if (story.story_audio && typeof story.story_audio === 'object') {
        storyAudioObj = story.story_audio as Record<string, string>
      }

      // Set story audio previews
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

      // Process sections for the form
      if (sections && sections.length > 0) {
        console.log('Processing sections:', sections)
        const sectionsForForm: StorySectionForm[] = sections.map(section => {
          console.log('Processing section:', section)

          // Parse texts
          let texts = {}
          if (typeof section.texts === 'string') {
            try {
              texts = JSON.parse(section.texts)
            } catch {
              texts = { en: section.texts }
            }
          } else if (section.texts && typeof section.texts === 'object') {
            texts = section.texts
          }

          // Parse voices
          let voices = {}
          if (typeof section.voices === 'string') {
            try {
              voices = JSON.parse(section.voices)
            } catch {
              voices = { en: section.voices }
            }
          } else if (section.voices && typeof section.voices === 'object') {
            voices = section.voices
          }

          // Set up voice previews
          const voicePreviews: Record<string, string> = {}
          if (voices && typeof voices === 'object') {
            Object.entries(voices as Record<string, string>).forEach(
              ([lang, voiceFile]) => {
                if (voiceFile) {
                  voicePreviews[lang] = getImageUrl(voiceFile)
                }
              },
            )
          }

          return {
            id: section.id,
            order: section.order,
            texts: texts as Record<string, string>,
            voices: voices as Record<string, string>,
            image: section.image || undefined,
            imagePreview: section.image ? getImageUrl(section.image) : null,
            voicePreviews,
          }
        })

        console.log('Setting sections for form:', sectionsForForm)
        setStorySections(sectionsForForm)
      } else {
        console.log('No sections found, initializing empty sections')
        setStorySections([])
      }
    }
  }, [storyDetails, isEditing, id])

  // Initialize sections when languages change
  useEffect(() => {
    if (
      storySections.length === 0 &&
      storyData.languages.length > 0 &&
      !isEditing
    ) {
      addNewSection()
    }
  }, [storyData.languages, isEditing])

  // Set default category when categories are loaded and no category is set
  useEffect(() => {
    if (
      categories &&
      categories.length > 0 &&
      !storyData.category &&
      !isEditing
    ) {
      setStoryData(prev => ({ ...prev, category: categories[0].name }))
    }
  }, [categories, storyData.category, isEditing])

  // Initialize story audio for new languages
  useEffect(() => {
    const updatedStoryAudio = { ...storyData.story_audio }

    storyData.languages.forEach(lang => {
      if (!updatedStoryAudio[lang]) {
        updatedStoryAudio[lang] = ''
      }
    })

    if (
      JSON.stringify(updatedStoryAudio) !==
      JSON.stringify(storyData.story_audio)
    ) {
      setStoryData(prev => ({
        ...prev,
        story_audio: updatedStoryAudio,
      }))
    }
  }, [storyData.languages])

  // Handle file input change for cover image
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      console.log('New image file selected:', file.name, file.size)
      setCoverImageFile(file)

      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      console.log('Created preview URL:', objectUrl)
      setCoverImagePreview(objectUrl)
    }
  }

  // Improved story audio file handling
  const handleStoryAudioChange = (language: string, file: File) => {
    setStoryAudioFiles(prev => ({ ...prev, [language]: file }))
    setStoryAudioPreviews(prev => ({
      ...prev,
      [language]: URL.createObjectURL(file),
    }))
  }

  const handleRemoveStoryAudio = (language: string) => {
    const newStoryAudioFiles = { ...storyAudioFiles }
    const newStoryAudioPreviews = { ...storyAudioPreviews }
    delete newStoryAudioFiles[language]
    delete newStoryAudioPreviews[language]
    setStoryAudioFiles(newStoryAudioFiles)
    setStoryAudioPreviews(newStoryAudioPreviews)
    setStoryData(prev => ({
      ...prev,
      story_audio: {
        ...prev.story_audio,
        [language]: '',
      },
    }))
  }

  // Handle adding a new language
  const handleAddLanguage = (language: string) => {
    if (!storyData.languages.includes(language)) {
      const updatedLanguages = [...storyData.languages, language]
      const updatedStoryAudio = { ...storyData.story_audio, [language]: '' }

      setStoryData({
        ...storyData,
        languages: updatedLanguages,
        story_audio: updatedStoryAudio,
      })

      // Add language fields to all sections
      const updatedSections = storySections.map(section => ({
        ...section,
        texts: {
          ...section.texts,
          [language]: '',
        },
        voices: {
          ...section.voices,
          [language]: '',
        },
      }))
      setStorySections(updatedSections)
    }
  }

  // Handle removing a language
  const handleRemoveLanguage = (language: string) => {
    const updatedLanguages = storyData.languages.filter(
      lang => lang !== language,
    )
    const updatedStoryAudio = { ...storyData.story_audio }
    delete updatedStoryAudio[language]

    setStoryData({
      ...storyData,
      languages: updatedLanguages,
      story_audio: updatedStoryAudio,
    })

    // Remove language fields from all sections
    const updatedSections = storySections.map(section => {
      const newTexts = { ...section.texts }
      const newVoices = { ...section.voices }
      delete newTexts[language]
      delete newVoices[language]

      return {
        ...section,
        texts: newTexts,
        voices: newVoices,
      }
    })
    setStorySections(updatedSections)

    // Remove audio files for this language
    const newStoryAudioFiles = { ...storyAudioFiles }
    const newStoryAudioPreviews = { ...storyAudioPreviews }
    delete newStoryAudioFiles[language]
    delete newStoryAudioPreviews[language]
    setStoryAudioFiles(newStoryAudioFiles)
    setStoryAudioPreviews(newStoryAudioPreviews)
  }

  // Functions to update multilingual titles and descriptions
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

  // Section management functions
  const addNewSection = () => {
    const newSection: StorySectionForm = {
      order: storySections.length + 1,
      texts: storyData.languages.reduce(
        (acc, lang) => {
          acc[lang] = ''
          return acc
        },
        {} as Record<string, string>,
      ),
      voices: storyData.languages.reduce(
        (acc, lang) => {
          acc[lang] = ''
          return acc
        },
        {} as Record<string, string>,
      ),
      imagePreview: null,
    }

    setStorySections([...storySections, newSection])
  }

  const deleteSection = (index: number) => {
    const updatedSections = storySections.filter((_, i) => i !== index)
    // Reorder sections
    const reorderedSections = updatedSections.map((section, idx) => ({
      ...section,
      order: idx + 1,
    }))
    setStorySections(reorderedSections)
  }

  const updateSectionText = (
    sectionIndex: number,
    language: string,
    text: string,
  ) => {
    const updatedSections = [...storySections]
    updatedSections[sectionIndex].texts[language] = text
    setStorySections(updatedSections)
  }

  const handleSectionImageChange = (
    sectionIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const updatedSections = [...storySections]
      updatedSections[sectionIndex].imageFile = file
      updatedSections[sectionIndex].imagePreview = URL.createObjectURL(file)
      setStorySections(updatedSections)
    }
  }

  // Improved section voice file handling
  const handleSectionVoiceChange = (
    sectionIndex: number,
    language: string,
    file: File,
  ) => {
    const updatedSections = [...storySections]
    if (!updatedSections[sectionIndex].voiceFiles) {
      updatedSections[sectionIndex].voiceFiles = {}
    }
    if (!updatedSections[sectionIndex].voicePreviews) {
      updatedSections[sectionIndex].voicePreviews = {}
    }
    updatedSections[sectionIndex].voiceFiles![language] = file
    updatedSections[sectionIndex].voicePreviews![language] =
      URL.createObjectURL(file)
    setStorySections(updatedSections)
  }

  const handleRemoveSectionVoice = (sectionIndex: number, language: string) => {
    const updatedSections = [...storySections]
    if (updatedSections[sectionIndex].voiceFiles) {
      delete updatedSections[sectionIndex].voiceFiles![language]
    }
    if (updatedSections[sectionIndex].voicePreviews) {
      delete updatedSections[sectionIndex].voicePreviews![language]
    }
    // Clear the voices field for this language
    updatedSections[sectionIndex].voices = {
      ...updatedSections[sectionIndex].voices,
      [language]: '',
    }
    setStorySections(updatedSections)
  }

  // Handle save/submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      let coverImageUrl = storyData.cover_image
      let storyAudioUrls = storyData.story_audio

      // Upload cover image if changed
      if (coverImageFile) {
        console.log(
          'Uploading image file:',
          coverImageFile.name,
          'Size:',
          coverImageFile.size,
        )
        const filename = `cover-${Date.now()}-${coverImageFile.name}`

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('admin-content')
          .upload(`story-covers/${filename}`, coverImageFile, {
            cacheControl: '3600',
            upsert: false,
          })

        if (uploadError) {
          console.error('Upload error:', uploadError)
          throw uploadError
        }

        console.log('Upload successful:', uploadData)
        coverImageUrl = filename
        console.log('Storing filename in DB:', coverImageUrl)
      }

      // Upload story audio files if changed and in single story mode
      if (
        storyData.audio_mode === 'single_story' &&
        Object.keys(storyAudioFiles).length > 0
      ) {
        const newStoryAudioUrls = { ...storyAudioUrls }

        for (const [language, audioFile] of Object.entries(storyAudioFiles)) {
          const filename = `story-audio-${Date.now()}-${language}-${audioFile.name}`

          const { data: uploadData, error: uploadError } =
            await supabase.storage
              .from('admin-content')
              .upload(`story-audio/${filename}`, audioFile, {
                cacheControl: '3600',
                upsert: false,
              })

          if (uploadError) {
            throw uploadError
          }

          newStoryAudioUrls[language] = filename
        }

        storyAudioUrls = newStoryAudioUrls
      }

      // Create or update the story with multilingual data
      let storyId = id
      if (!isEditing) {
        const { data: newStory, error: storyError } = await supabase
          .from('stories')
          .insert({
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
          })
          .select('id')
          .single()

        if (storyError) throw storyError
        storyId = newStory.id
      } else {
        const { error: storyError } = await supabase
          .from('stories')
          .update({
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
          })
          .eq('id', storyId)

        if (storyError) throw storyError
      }

      // Handle story sections
      if (isEditing) {
        // Delete existing sections for this story
        const { error: deleteSectionsError } = await supabase
          .from('story_sections')
          .delete()
          .eq('story_id', storyId)

        if (deleteSectionsError) throw deleteSectionsError
      }

      // Insert all sections
      for (const section of storySections) {
        // Upload section image if it's a file
        let sectionImageUrl = null
        if (section.imageFile) {
          const filename = `section-${storyId}-${section.order}-${Date.now()}-${section.imageFile.name}`

          const { data: uploadData, error: uploadError } =
            await supabase.storage
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

        // Upload voice files only if in per_section mode
        const voiceUrls: Record<string, string> = { ...section.voices }
        if (storyData.audio_mode === 'per_section' && section.voiceFiles) {
          for (const [language, voiceFile] of Object.entries(
            section.voiceFiles,
          )) {
            const filename = `voice-${storyId}-${section.order}-${language}-${Date.now()}-${voiceFile.name}`

            const { data: uploadData, error: uploadError } =
              await supabase.storage
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
            texts: section.texts,
            voices: storyData.audio_mode === 'per_section' ? voiceUrls : {},
          })

        if (sectionError) throw sectionError
      }

      toast.success(`Story ${isEditing ? 'updated' : 'created'} successfully!`)
      navigate('/admin/stories')
    } catch (error: any) {
      console.error('Error saving story:', error)
      toast.error(
        `Failed to ${isEditing ? 'update' : 'create'} story: ${error.message}`,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/admin/stories')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">
            {isEditing ? 'Edit Story' : 'Create New Story'}
          </h1>
        </div>
      </header>

      {isEditing && isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-lg">Loading story details...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-8 grid gap-6">
            {/* Story Details Card */}
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
                console.log('Clearing image preview')
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
                onFreeChange={is_free =>
                  setStoryData({ ...storyData, is_free })
                }
                onPublishedChange={is_published =>
                  setStoryData({ ...storyData, is_published })
                }
              />
            </div>

            {/* Languages Card */}
            <StoryLanguageManager
              selectedLanguages={storyData.languages}
              availableLanguages={languages}
              languagesLoading={languagesLoading}
              onAddLanguage={handleAddLanguage}
              onRemoveLanguage={handleRemoveLanguage}
            />

            {/* Audio Settings Card */}
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

            {/* Story Sections Card */}
            <StorySectionsList
              sections={storySections}
              languages={storyData.languages}
              availableLanguages={languages}
              audioMode={storyData.audio_mode}
              onAddSection={addNewSection}
              onDeleteSection={deleteSection}
              onUpdateSectionText={updateSectionText}
              onSectionImageChange={handleSectionImageChange}
              onClearSectionImage={(sectionIndex: number) => {
                const updatedSections = [...storySections]
                updatedSections[sectionIndex].imageFile = null
                updatedSections[sectionIndex].imagePreview = null
                setStorySections(updatedSections)
              }}
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
            <Button
              type="submit"
              disabled={isSubmitting || !storyData.title.en}
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? 'Update Story' : 'Create Story'}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

export default StoryEditor
