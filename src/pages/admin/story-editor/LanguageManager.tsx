
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { StoryData, StorySection, languageOptions } from "./types";

interface LanguageManagerProps {
  storyData: StoryData;
  setStoryData: (data: StoryData) => void;
  storySections: StorySection[];
  setStorySections: (sections: StorySection[]) => void;
}

export const LanguageManager = ({ 
  storyData, 
  setStoryData, 
  storySections, 
  setStorySections 
}: LanguageManagerProps) => {
  const handleAddLanguage = (language: string) => {
    if (!storyData.languages.includes(language)) {
      const updatedLanguages = [...storyData.languages, language];
      setStoryData({
        ...storyData, 
        languages: updatedLanguages
      });
      
      // Add language fields to all sections
      const updatedSections = storySections.map(section => ({
        ...section,
        translations: {
          ...section.translations,
          [language]: { text: "", audio_url: null }
        }
      }));
      setStorySections(updatedSections);
      
      // Add empty translations for all scenes for the new language
      const updatedScenes = storyData.scenes.map(scene => ({
        ...scene,
        translations: {
          ...scene.translations,
          [language]: { text: "", audio_url: null }
        }
      }));
      
      setStoryData(prev => ({
        ...prev,
        scenes: updatedScenes
      }));
    }
  };

  const handleRemoveLanguage = (language: string) => {
    const updatedLanguages = storyData.languages.filter(lang => lang !== language);
    setStoryData({
      ...storyData,
      languages: updatedLanguages
    });
    
    // Remove language fields from all sections
    const updatedSections = storySections.map(section => {
      const newTranslations = { ...section.translations };
      delete newTranslations[language];
      
      return {
        ...section,
        translations: newTranslations
      };
    });
    setStorySections(updatedSections);
    
    // Remove translations for this language from all scenes
    const updatedScenes = storyData.scenes.map(scene => {
      const newTranslations = { ...scene.translations };
      delete newTranslations[language];
      
      return {
        ...scene,
        translations: newTranslations
      };
    });
    
    setStoryData(prev => ({
      ...prev,
      scenes: updatedScenes
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>
          Manage available languages for this story
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {storyData.languages.map(language => {
            const langOption = languageOptions.find(opt => opt.value === language);
            return (
              <Badge key={language} variant="outline" className="py-2 text-sm">
                {langOption?.label || language}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => handleRemoveLanguage(language)}
                  disabled={storyData.languages.length === 1}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <Select onValueChange={handleAddLanguage}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Add language" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Languages</SelectLabel>
                {languageOptions.map(language => (
                  <SelectItem
                    key={language.value}
                    value={language.value}
                    disabled={storyData.languages.includes(language.value)}
                  >
                    {language.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add Language
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
