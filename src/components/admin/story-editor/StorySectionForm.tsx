import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Trash2, X, Image } from 'lucide-react'
import { VoiceFileUpload } from '@/components/admin/VoiceFileUpload'
import { Language } from '@/types/language'

interface StorySectionFormProps {
  section: {
    id?: string
    order: number
    texts: Record<string, string>
    voices?: Record<string, string>
    image?: string
    imageFile?: File | null
    imagePreview?: string | null
    voiceFiles?: Record<string, File>
    voicePreviews?: Record<string, string>
  }
  sectionIndex: number
  languages: string[]
  availableLanguages: Language[] | undefined
  audioMode: 'per_section' | 'single_story'
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
  onSectionVoiceChange: (
    sectionIndex: number,
    language: string,
    file: File,
  ) => void
  onRemoveSectionVoice: (sectionIndex: number, language: string) => void
}

export const StorySectionForm = ({
  section,
  sectionIndex,
  languages,
  availableLanguages,
  audioMode,
  onDeleteSection,
  onUpdateSectionText,
  onSectionImageChange,
  onClearSectionImage,
  onSectionVoiceChange,
  onRemoveSectionVoice,
}: StorySectionFormProps) => {
  return (
    <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
      <AccordionTrigger className="hover:no-underline">
        <div className="mr-4 flex w-full items-center justify-between">
          <span className="font-medium">Section {section.order}</span>
          <span
            role="button"
            className="rounded-xl border bg-red-500 p-2"
            onClick={e => {
              e.stopPropagation()
              onDeleteSection(sectionIndex)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </span>
        </div>
      </AccordionTrigger>
      <AccordionContent className="pt-4">
        <div className="space-y-6">
          {/* Section Image */}
          <div className="space-y-2">
            <Label>Section Image</Label>
            <div className="flex items-center gap-4">
              {section.imagePreview ? (
                <div className="relative h-32 w-32 overflow-hidden rounded-md border">
                  <img
                    src={section.imagePreview}
                    alt="Section preview"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="absolute right-1 top-1 h-6 w-6"
                    onClick={() => onClearSectionImage(sectionIndex)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-md border border-dashed border-muted-foreground/50 bg-muted">
                  <Image className="mb-1 h-6 w-6 text-muted-foreground" />
                  <p className="text-center text-xs text-muted-foreground">
                    Upload Image
                  </p>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={e => onSectionImageChange(sectionIndex, e)}
                className="flex-1"
              />
            </div>
          </div>

          {/* Language-specific content */}
          <Tabs defaultValue={languages[0]} className="w-full">
            <TabsList>
              {languages.map(lang => {
                const langOption = availableLanguages?.find(
                  opt => opt.code === lang,
                )
                return (
                  <TabsTrigger key={lang} value={lang}>
                    {langOption?.name || lang}
                  </TabsTrigger>
                )
              })}
            </TabsList>
            {languages.map(lang => {
              const langOption = availableLanguages?.find(
                opt => opt.code === lang,
              )
              return (
                <TabsContent
                  key={lang}
                  value={lang}
                  className="space-y-4"
                >
                  {/* Text content */}
                  <div className="space-y-2">
                    <Label>
                      Text Content ({langOption?.name || lang})
                    </Label>
                    <Textarea
                      placeholder={`Enter section text in ${lang}`}
                      value={section.texts[lang] || ''}
                      onChange={e =>
                        onUpdateSectionText(
                          sectionIndex,
                          lang,
                          e.target.value,
                        )
                      }
                      className="min-h-[120px]"
                    />
                  </div>

                  {/* Voice upload - only show if in per_section mode, now using new component */}
                  {audioMode === 'per_section' && (
                    <VoiceFileUpload
                      language={lang}
                      languageName={langOption?.name || lang}
                      sectionIndex={sectionIndex}
                      voiceFiles={section.voiceFiles}
                      voicePreviews={section.voicePreviews}
                      existingVoiceUrls={section.voices}
                      onVoiceFileChange={onSectionVoiceChange}
                      onRemoveVoiceFile={onRemoveSectionVoice}
                    />
                  )}
                </TabsContent>
              )
            })}
          </Tabs>
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}