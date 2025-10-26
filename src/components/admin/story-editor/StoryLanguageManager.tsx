import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Language } from '@/types/language'

interface StoryLanguageManagerProps {
  selectedLanguages: string[]
  availableLanguages: Language[] | undefined
  languagesLoading: boolean
  onAddLanguage: (language: string) => void
  onRemoveLanguage: (language: string) => void
}

export const StoryLanguageManager = ({
  selectedLanguages,
  availableLanguages,
  languagesLoading,
  onAddLanguage,
  onRemoveLanguage,
}: StoryLanguageManagerProps) => {
  const { toast } = useToast()

  const handleRemoveLanguage = (language: string) => {
    if (selectedLanguages.length === 1) {
      toast({
        title: 'Cannot remove language',
        description: 'At least one language must be maintained for the story section.',
        variant: 'destructive'
      })
      return
    }
    
    onRemoveLanguage(language)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>Section Languages</CardTitle>
        <CardDescription>
          Manage available languages for story sections
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {selectedLanguages.map(language => {
            const langOption = availableLanguages?.find(
              opt => opt.code === language,
            )
            return (
              <Badge
                key={language}
                variant="secondary"
                className="flex gap-6 rounded-md px-4 py-3 text-sm"
              >
                {langOption?.name || language}
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="size-6"
                  onClick={() => handleRemoveLanguage(language)}
                  disabled={selectedLanguages.length === 1}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )
          })}
        </div>

        <div className="flex items-center gap-2">
          <Select onValueChange={onAddLanguage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {languagesLoading ? (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    Loading languages...
                  </div>
                ) : availableLanguages && availableLanguages.length > 0 ? (
                  availableLanguages.map(language => (
                    <SelectItem
                      key={language.id}
                      value={language.code}
                      disabled={selectedLanguages.includes(language.code)}
                    >
                      {language.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1 text-sm text-muted-foreground">
                    No languages available
                  </div>
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm">
            <Plus className="mr-1 h-4 w-4" /> Add Language
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}