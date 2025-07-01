
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Trash2, X, Image, Volume2, Play, Pause } from "lucide-react";
import { StoryData, StorySection, languageOptions } from "./types";

interface StorySectionsManagerProps {
  storyData: StoryData;
  storySections: StorySection[];
  setStorySections: (sections: StorySection[]) => void;
}

export const StorySectionsManager = ({ 
  storyData, 
  storySections, 
  setStorySections 
}: StorySectionsManagerProps) => {
  const [playingAudio, setPlayingAudio] = useState<{ sectionIndex: number; language: string } | null>(null);

  const addNewSection = () => {
    const newSection: StorySection = {
      section_order: storySections.length + 1,
      image: null,
      imagePreview: null,
      translations: storyData.languages.reduce((acc, lang) => {
        acc[lang] = { text: "", audio_url: null };
        return acc;
      }, {} as Record<string, { text: string; audio_url?: string | null }>)
    };
    
    setStorySections([...storySections, newSection]);
  };

  const deleteSection = (index: number) => {
    const updatedSections = storySections.filter((_, i) => i !== index);
    // Reorder sections
    const reorderedSections = updatedSections.map((section, idx) => ({
      ...section,
      section_order: idx + 1
    }));
    setStorySections(reorderedSections);
  };

  const updateSectionText = (sectionIndex: number, language: string, text: string) => {
    const updatedSections = [...storySections];
    updatedSections[sectionIndex].translations[language] = {
      ...updatedSections[sectionIndex].translations[language],
      text
    };
    setStorySections(updatedSections);
  };

  const updateSectionOrder = (sectionIndex: number, newOrder: number) => {
    if (newOrder < 1 || newOrder > storySections.length) return;
    
    const updatedSections = [...storySections];
    const section = updatedSections[sectionIndex];
    const oldOrder = section.section_order;
    
    // Update the target section's order
    section.section_order = newOrder;
    
    // Adjust other sections' orders
    updatedSections.forEach((s, idx) => {
      if (idx !== sectionIndex) {
        if (newOrder > oldOrder) {
          // Moving down - shift others up
          if (s.section_order > oldOrder && s.section_order <= newOrder) {
            s.section_order -= 1;
          }
        } else {
          // Moving up - shift others down
          if (s.section_order >= newOrder && s.section_order < oldOrder) {
            s.section_order += 1;
          }
        }
      }
    });
    
    // Sort by order
    updatedSections.sort((a, b) => a.section_order - b.section_order);
    setStorySections(updatedSections);
  };

  const handleSectionImageChange = (sectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedSections = [...storySections];
      updatedSections[sectionIndex].image = file;
      updatedSections[sectionIndex].imagePreview = URL.createObjectURL(file);
      setStorySections(updatedSections);
    }
  };

  const handleSectionAudioChange = (sectionIndex: number, language: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedSections = [...storySections];
      if (!updatedSections[sectionIndex].translations[language]) {
        updatedSections[sectionIndex].translations[language] = { text: "" };
      }
      updatedSections[sectionIndex].translations[language].audioFile = file;
      updatedSections[sectionIndex].translations[language].audioPreview = URL.createObjectURL(file);
      setStorySections(updatedSections);
    }
  };

  const playAudio = (sectionIndex: number, language: string) => {
    const translation = storySections[sectionIndex].translations[language];
    const audioUrl = translation?.audioPreview || translation?.audio_url;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      setPlayingAudio({ sectionIndex, language });
      audio.play();
      audio.onended = () => setPlayingAudio(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Sections</CardTitle>
        <CardDescription>
          Create and manage sections with text, audio, and images for each language
        </CardDescription>
        <Button 
          type="button" 
          onClick={addNewSection}
          className="mt-2"
        >
          <Plus className="h-4 w-4 mr-1" /> Add Section
        </Button>
      </CardHeader>
      <CardContent>
        {storySections.length === 0 ? (
          <div className="text-center py-8 border rounded-md">
            <p className="text-muted-foreground">
              No sections added yet. Click "Add Section" to get started.
            </p>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-4">
            {storySections.map((section, sectionIndex) => (
              <AccordionItem key={sectionIndex} value={`section-${sectionIndex}`}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full mr-4">
                    <span className="font-medium">Section {section.section_order}</span>
                    <div className="flex items-center gap-2">
                      <Select
                        value={section.section_order.toString()}
                        onValueChange={(value) => updateSectionOrder(sectionIndex, parseInt(value))}
                      >
                        <SelectTrigger className="w-20 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: storySections.length }, (_, i) => i + 1).map(num => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSection(sectionIndex);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4">
                  <div className="space-y-6">
                    {/* Section Image */}
                    <div className="space-y-2">
                      <Label>Section Image</Label>
                      <div className="flex items-center gap-4">
                        {section.imagePreview ? (
                          <div className="relative w-32 h-32 rounded-md overflow-hidden border">
                            <img 
                              src={section.imagePreview} 
                              alt="Section preview" 
                              className="w-full h-full object-cover"
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6"
                              onClick={() => {
                                const updatedSections = [...storySections];
                                updatedSections[sectionIndex].image = null;
                                updatedSections[sectionIndex].imagePreview = null;
                                setStorySections(updatedSections);
                              }}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-32 h-32 rounded-md bg-muted border border-dashed border-muted-foreground/50">
                            <Image className="h-6 w-6 text-muted-foreground mb-1" />
                            <p className="text-xs text-muted-foreground text-center">Upload Image</p>
                          </div>
                        )}
                        <Input 
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleSectionImageChange(sectionIndex, e)}
                          className="flex-1"
                        />
                      </div>
                    </div>

                    {/* Language-specific content */}
                    <Tabs defaultValue={storyData.languages[0]} className="w-full">
                      <TabsList>
                        {storyData.languages.map(lang => {
                          const langOption = languageOptions.find(opt => opt.value === lang);
                          return (
                            <TabsTrigger key={lang} value={lang}>
                              {langOption?.label || lang}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                      {storyData.languages.map(lang => (
                        <TabsContent key={lang} value={lang} className="space-y-4">
                          {/* Text content */}
                          <div className="space-y-2">
                            <Label>Text Content ({languageOptions.find(opt => opt.value === lang)?.label})</Label>
                            <Textarea
                              placeholder={`Enter section text in ${lang}`}
                              value={section.translations[lang]?.text || ""}
                              onChange={(e) => updateSectionText(sectionIndex, lang, e.target.value)}
                              className="min-h-[120px]"
                            />
                          </div>

                          {/* Audio upload */}
                          <div className="space-y-2">
                            <Label>Voice Audio ({languageOptions.find(opt => opt.value === lang)?.label})</Label>
                            <div className="flex items-center gap-2">
                              <Input 
                                type="file"
                                accept="audio/*"
                                onChange={(e) => handleSectionAudioChange(sectionIndex, lang, e)}
                                className="flex-1"
                              />
                              {(section.translations[lang]?.audioPreview || section.translations[lang]?.audio_url) && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => playAudio(sectionIndex, lang)}
                                  disabled={playingAudio?.sectionIndex === sectionIndex && playingAudio?.language === lang}
                                >
                                  {playingAudio?.sectionIndex === sectionIndex && playingAudio?.language === lang ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                  <Volume2 className="h-4 w-4 ml-1" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
};
