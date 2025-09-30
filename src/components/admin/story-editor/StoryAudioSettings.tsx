import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StoryAudioUpload } from '@/components/admin/StoryAudioUpload'

interface StoryAudioSettingsProps {
  audioMode: 'per_section' | 'single_story'
  languages: string[]
  availableLanguages: any[] | undefined
  storyAudioFiles: Record<string, File>
  storyAudioPreviews: Record<string, string>
  existingStoryAudio: Record<string, string>
  onAudioModeChange: (mode: 'per_section' | 'single_story') => void
  onStoryAudioChange: (language: string, file: File) => void
  onRemoveStoryAudio: (language: string) => void
}

export const StoryAudioSettings = ({
  audioMode,
  languages,
  availableLanguages,
  storyAudioFiles,
  storyAudioPreviews,
  existingStoryAudio,
  onAudioModeChange,
  onStoryAudioChange,
  onRemoveStoryAudio,
}: StoryAudioSettingsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audio Settings</CardTitle>
        <CardDescription>
          Configure how audio is handled for this story
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="audio-mode" className="text-base font-medium">
              Audio Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Choose between single audio for the whole story or separate audio
              for each section
            </p>
          </div>
          <Switch
            id="audio-mode"
            checked={audioMode === 'single_story'}
            onCheckedChange={checked =>
              onAudioModeChange(checked ? 'single_story' : 'per_section')
            }
          />
        </div>

        <div className="text-sm text-muted-foreground">
          Mode:{' '}
          <span className="font-medium">
            {audioMode === 'single_story'
              ? 'Single audio for whole story'
              : 'Audio per section'}
          </span>
        </div>

        {/* Single Story Audio Upload - Now per language using new component */}
        {audioMode === 'single_story' && (
          <div className="space-y-4">
            <Label>Story Audio (Per Language)</Label>
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
                  <TabsContent key={lang} value={lang}>
                    <StoryAudioUpload
                      language={lang}
                      languageName={langOption?.name || lang}
                      storyAudioFiles={storyAudioFiles}
                      storyAudioPreviews={storyAudioPreviews}
                      existingStoryAudio={existingStoryAudio}
                      onStoryAudioChange={onStoryAudioChange}
                      onRemoveStoryAudio={onRemoveStoryAudio}
                    />
                  </TabsContent>
                )
              })}
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  )
}