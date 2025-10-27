import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
} from '@/components/ui/accordion'
import { Plus } from 'lucide-react'
import { StorySectionForm } from './StorySectionForm'
import { Language } from '@/types/language'
import { StorySection } from '@/types/story-section'

interface StorySectionsListProps {
  sections: StorySection[]
  languages: string[]
  availableLanguages: Language[] | undefined
  audioMode: 'per_section' | 'single_story'
  onAddSection: () => void
  onDeleteSection: (index: number) => void
  onUpdateSectionText: (
    sectionIndex: number,
    language: string,
    text: string,
  ) => void
  onSectionImageChange: (
    sectionIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void
  onClearSectionImage: (sectionIndex: number) => void
  onSectionVideoChange: (
    sectionIndex: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void
  onClearSectionVideo: (sectionIndex: number) => void
  onSectionVoiceChange: (
    sectionIndex: number,
    language: string,
    file: File,
  ) => void
  onRemoveSectionVoice: (sectionIndex: number, language: string) => void
}

export const StorySectionsList = ({
  sections,
  languages,
  availableLanguages,
  audioMode,
  onAddSection,
  onDeleteSection,
  onUpdateSectionText,
  onSectionImageChange,
  onClearSectionImage,
  onSectionVideoChange,
  onClearSectionVideo,
  onSectionVoiceChange,
  onRemoveSectionVoice,
}: StorySectionsListProps) => {
  const handleClearSectionImage = (sectionIndex: number) => {
    onClearSectionImage(sectionIndex)
  }

  const handleClearSectionVideo = (sectionIndex: number) => {
    onClearSectionVideo(sectionIndex)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Sections</CardTitle>
        <CardDescription>
          Create sections with text, audio, and images for each language
        </CardDescription>
        <Button type="button" onClick={onAddSection} className="mt-2">
          <Plus className="mr-1 h-4 w-4" /> Add Section
        </Button>
      </CardHeader>
      <CardContent>
        {sections.length === 0 ? (
          <div className="rounded-md border py-8 text-center">
            <p className="text-muted-foreground">
              No sections added yet. Click "Add Section" to get started.
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {sections.map((section, sectionIndex) => (
              <StorySectionForm
                key={sectionIndex}
                section={section}
                sectionIndex={sectionIndex}
                languages={languages}
                availableLanguages={availableLanguages}
                audioMode={audioMode}
                onDeleteSection={onDeleteSection}
                onUpdateSectionText={onUpdateSectionText}
                onSectionImageChange={onSectionImageChange}
                onClearSectionImage={handleClearSectionImage}
                onSectionVideoChange={onSectionVideoChange}
                onClearSectionVideo={handleClearSectionVideo}
                onSectionVoiceChange={onSectionVoiceChange}
                onRemoveSectionVoice={onRemoveSectionVoice}
              />
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}