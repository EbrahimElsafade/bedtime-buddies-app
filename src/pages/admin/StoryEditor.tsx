import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Loader2,
  X,
  Image,
  Volume2,
  Play,
  Pause
} from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { Story, StorySection } from "@/types/story";

interface StorySectionForm extends Omit<StorySection, 'id'> {
  id?: string;
  imageFile?: File | null;
  imagePreview?: string | null;
  voiceFiles?: Record<string, File>;
  voicePreviews?: Record<string, string>;
}

const StoryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== "new" && !!id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<{ sectionIndex: number; language: string } | null>(null);
  const [storyAudioFiles, setStoryAudioFiles] = useState<Record<string, File>>({});
  const [storyAudioPreviews, setStoryAudioPreviews] = useState<Record<string, string>>({});
  
  // Story form data - Updated to handle multilingual titles and descriptions
  const [storyData, setStoryData] = useState({
    title: {} as Record<string, string>,
    description: {} as Record<string, string>,
    category: "",
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ["en"],
    cover_image: null as string | null,
    audio_mode: "per_section" as "per_section" | "single_story",
    story_audio: {} as Record<string, string>,
  });

  // Story sections
  const [storySections, setStorySections] = useState<StorySectionForm[]>([]);
  
  // Fetch categories from database
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["story-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch languages from database
  const { data: languages, isLoading: languagesLoading } = useQuery({
    queryKey: ["story-languages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_languages")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch story data if editing
  const fetchStory = async (): Promise<Story | null> => {
    if (!isEditing || !id) return null;
    
    console.log("Fetching story for ID:", id);
    
    // Fetch story details
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .single();
      
    if (storyError) {
      console.error("Story fetch error:", storyError);
      toast.error("Failed to fetch story details");
      throw storyError;
    }
    
    // Fetch story sections
    const { data: sections, error: sectionsError } = await supabase
      .from("story_sections")
      .select("*")
      .eq("story_id", id)
      .order("order", { ascending: true });
      
    if (sectionsError) {
      console.error("Sections fetch error:", sectionsError);
      toast.error("Failed to fetch story sections");
      throw sectionsError;
    }
    
    console.log('Story cover_image from DB:', story.cover_image);
    if (story.cover_image) {
      const imageUrl = getImageUrl(story.cover_image);
      console.log('Setting preview image URL:', imageUrl);
      setCoverImagePreview(imageUrl);
    }

    // Set story audio previews if exists
    if (story.story_audio && typeof story.story_audio === 'object') {
      const audioUrls: Record<string, string> = {};
      Object.entries(story.story_audio as Record<string, string>).forEach(([lang, audioFile]) => {
        if (audioFile) {
          audioUrls[lang] = getImageUrl(audioFile);
        }
      });
      setStoryAudioPreviews(audioUrls);
    }
    
    // Format sections for the UI - ensure all sections have proper structure
    const formattedSections: StorySection[] = sections.map(section => ({
      id: section.id,
      order: section.order,
      texts: section.texts as Record<string, string>,
      voices: section.voices as Record<string, string> | undefined,
      image: section.image || undefined,
    }));
    
    // Transform multilingual title and description to Record<string, string>
    const title = (() => {
      if (typeof story.title === 'string') {
        return { en: story.title };
      } else if (story.title && typeof story.title === 'object') {
        return story.title as Record<string, string>;
      }
      return {} as Record<string, string>;
    })();

    const description = (() => {
      if (typeof story.description === 'string') {
        return { en: story.description };
      } else if (story.description && typeof story.description === 'object') {
        return story.description as Record<string, string>;
      }
      return {} as Record<string, string>;
    })();

    // Handle multilingual story audio
    const storyAudio = (() => {
      if (typeof story.story_audio === 'string') {
        return { en: story.story_audio };
      } else if (story.story_audio && typeof story.story_audio === 'object') {
        return story.story_audio as Record<string, string>;
      }
      return {} as Record<string, string>;
    })();
    
    return {
      ...story,
      title,
      description,
      story_audio: storyAudio,
      audio_mode: (story.audio_mode || "per_section") as "per_section" | "single_story",
      sections: formattedSections
    };
  };
  
  const { data: storyDetails, isLoading } = useQuery({
    queryKey: ["admin-story", id],
    queryFn: fetchStory,
    enabled: isEditing && !!id && id !== "new",
    staleTime: Infinity
  });
  
  useEffect(() => {
    console.log("StoryEditor - isEditing:", isEditing, "id:", id, "storyDetails:", storyDetails);
    
    if (storyDetails) {
      // Handle multilingual title and description
      let titleObj = {};
      let descriptionObj = {};
      let storyAudioObj = {};
      
      if (typeof storyDetails.title === 'string') {
        titleObj = { en: storyDetails.title };
      } else if (storyDetails.title && typeof storyDetails.title === 'object') {
        titleObj = storyDetails.title as Record<string, string>;
      }
      
      if (typeof storyDetails.description === 'string') {
        descriptionObj = { en: storyDetails.description };
      } else if (storyDetails.description && typeof storyDetails.description === 'object') {
        descriptionObj = storyDetails.description as Record<string, string>;
      }

      if (typeof storyDetails.story_audio === 'string') {
        storyAudioObj = { en: storyDetails.story_audio };
      } else if (storyDetails.story_audio && typeof storyDetails.story_audio === 'object') {
        storyAudioObj = storyDetails.story_audio as Record<string, string>;
      }
      
      setStoryData({
        title: titleObj,
        description: descriptionObj,
        category: storyDetails.category || "",
        duration: storyDetails.duration || 5,
        is_free: storyDetails.is_free,
        is_published: storyDetails.is_published,
        languages: storyDetails.languages || ["en"],
        cover_image: storyDetails.cover_image,
        audio_mode: (storyDetails.audio_mode || "per_section") as "per_section" | "single_story",
        story_audio: storyAudioObj,
      });
      
      if (storyDetails.sections) {
        // Convert StorySection[] to StorySectionForm[] for editing
        const sectionsForForm: StorySectionForm[] = storyDetails.sections.map(section => ({
          ...section,
          imagePreview: section.image ? getImageUrl(section.image) : null
        }));
        setStorySections(sectionsForForm);
      }
    }
  }, [storyDetails, isEditing, id]);

  // Initialize sections when languages change
  useEffect(() => {
    if (storySections.length === 0 && storyData.languages.length > 0 && !isEditing) {
      addNewSection();
    }
  }, [storyData.languages, isEditing]);

  // Set default category when categories are loaded and no category is set
  useEffect(() => {
    if (categories && categories.length > 0 && !storyData.category && !isEditing) {
      setStoryData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, storyData.category, isEditing]);
  
  // Initialize title and description for new languages
  useEffect(() => {
    const updatedTitle = { ...storyData.title };
    const updatedDescription = { ...storyData.description };
    const updatedStoryAudio = { ...storyData.story_audio };
    
    storyData.languages.forEach(lang => {
      if (!updatedTitle[lang]) {
        updatedTitle[lang] = "";
      }
      if (!updatedDescription[lang]) {
        updatedDescription[lang] = "";
      }
      if (!updatedStoryAudio[lang]) {
        updatedStoryAudio[lang] = "";
      }
    });
    
    if (JSON.stringify(updatedTitle) !== JSON.stringify(storyData.title) || 
        JSON.stringify(updatedDescription) !== JSON.stringify(storyData.description) ||
        JSON.stringify(updatedStoryAudio) !== JSON.stringify(storyData.story_audio)) {
      setStoryData(prev => ({
        ...prev,
        title: updatedTitle,
        description: updatedDescription,
        story_audio: updatedStoryAudio
      }));
    }
  }, [storyData.languages]);
  
  // Handle file input change for cover image
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log('New image file selected:', file.name, file.size);
      setCoverImageFile(file);
      
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      console.log('Created preview URL:', objectUrl);
      setCoverImagePreview(objectUrl);
    }
  };

  // Handle story audio file change
  const handleStoryAudioChange = (language: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setStoryAudioFiles(prev => ({ ...prev, [language]: file }));
      setStoryAudioPreviews(prev => ({ ...prev, [language]: URL.createObjectURL(file) }));
    }
  };
  
  // Handle adding a new language
  const handleAddLanguage = (language: string) => {
    if (!storyData.languages.includes(language)) {
      const updatedLanguages = [...storyData.languages, language];
      const updatedTitle = { ...storyData.title, [language]: "" };
      const updatedDescription = { ...storyData.description, [language]: "" };
      const updatedStoryAudio = { ...storyData.story_audio, [language]: "" };
      
      setStoryData({
        ...storyData, 
        languages: updatedLanguages,
        title: updatedTitle,
        description: updatedDescription,
        story_audio: updatedStoryAudio
      });
      
      // Add language fields to all sections
      const updatedSections = storySections.map(section => ({
        ...section,
        texts: {
          ...section.texts,
          [language]: ""
        },
        voices: {
          ...section.voices,
          [language]: ""
        }
      }));
      setStorySections(updatedSections);
    }
  };
  
  // Handle removing a language
  const handleRemoveLanguage = (language: string) => {
    const updatedLanguages = storyData.languages.filter(lang => lang !== language);
    const updatedTitle = { ...storyData.title };
    const updatedDescription = { ...storyData.description };
    const updatedStoryAudio = { ...storyData.story_audio };
    delete updatedTitle[language];
    delete updatedDescription[language];
    delete updatedStoryAudio[language];
    
    setStoryData({
      ...storyData,
      languages: updatedLanguages,
      title: updatedTitle,
      description: updatedDescription,
      story_audio: updatedStoryAudio
    });
    
    // Remove language fields from all sections
    const updatedSections = storySections.map(section => {
      const newTexts = { ...section.texts };
      const newVoices = { ...section.voices };
      delete newTexts[language];
      delete newVoices[language];
      
      return {
        ...section,
        texts: newTexts,
        voices: newVoices
      };
    });
    setStorySections(updatedSections);

    // Remove audio files for this language
    const newStoryAudioFiles = { ...storyAudioFiles };
    const newStoryAudioPreviews = { ...storyAudioPreviews };
    delete newStoryAudioFiles[language];
    delete newStoryAudioPreviews[language];
    setStoryAudioFiles(newStoryAudioFiles);
    setStoryAudioPreviews(newStoryAudioPreviews);
  };

  // Functions to update multilingual titles and descriptions
  const updateStoryTitle = (language: string, value: string) => {
    setStoryData(prev => ({
      ...prev,
      title: {
        ...prev.title,
        [language]: value
      }
    }));
  };

  const updateStoryDescription = (language: string, value: string) => {
    setStoryData(prev => ({
      ...prev,
      description: {
        ...prev.description,
        [language]: value
      }
    }));
  };

  // Section management functions
  const addNewSection = () => {
    const newSection: StorySectionForm = {
      order: storySections.length + 1,
      texts: storyData.languages.reduce((acc, lang) => {
        acc[lang] = "";
        return acc;
      }, {} as Record<string, string>),
      voices: storyData.languages.reduce((acc, lang) => {
        acc[lang] = "";
        return acc;
      }, {} as Record<string, string>),
      imagePreview: null
    };
    
    setStorySections([...storySections, newSection]);
  };

  const deleteSection = (index: number) => {
    const updatedSections = storySections.filter((_, i) => i !== index);
    // Reorder sections
    const reorderedSections = updatedSections.map((section, idx) => ({
      ...section,
      order: idx + 1
    }));
    setStorySections(reorderedSections);
  };

  const updateSectionText = (sectionIndex: number, language: string, text: string) => {
    const updatedSections = [...storySections];
    updatedSections[sectionIndex].texts[language] = text;
    setStorySections(updatedSections);
  };

  const handleSectionImageChange = (sectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedSections = [...storySections];
      updatedSections[sectionIndex].imageFile = file;
      updatedSections[sectionIndex].imagePreview = URL.createObjectURL(file);
      setStorySections(updatedSections);
    }
  };

  const handleSectionVoiceChange = (sectionIndex: number, language: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const updatedSections = [...storySections];
      if (!updatedSections[sectionIndex].voiceFiles) {
        updatedSections[sectionIndex].voiceFiles = {};
      }
      if (!updatedSections[sectionIndex].voicePreviews) {
        updatedSections[sectionIndex].voicePreviews = {};
      }
      updatedSections[sectionIndex].voiceFiles![language] = file;
      updatedSections[sectionIndex].voicePreviews![language] = URL.createObjectURL(file);
      setStorySections(updatedSections);
    }
  };

  // Handle save/submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let coverImageUrl = storyData.cover_image;
      let storyAudioUrls = storyData.story_audio;
      
      // Upload cover image if changed
      if (coverImageFile) {
        console.log('Uploading image file:', coverImageFile.name, 'Size:', coverImageFile.size);
        const filename = `cover-${Date.now()}-${coverImageFile.name}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("admin-content")
          .upload(`story-covers/${filename}`, coverImageFile, {
            cacheControl: '3600',
            upsert: false
          });
          
        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw uploadError;
        }
        
        console.log('Upload successful:', uploadData);
        coverImageUrl = filename;
        console.log('Storing filename in DB:', coverImageUrl);
      }

      // Upload story audio files if changed and in single story mode
      if (storyData.audio_mode === 'single_story' && Object.keys(storyAudioFiles).length > 0) {
        const newStoryAudioUrls = { ...storyAudioUrls };
        
        for (const [language, audioFile] of Object.entries(storyAudioFiles)) {
          const filename = `story-audio-${Date.now()}-${language}-${audioFile.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("admin-content")
            .upload(`story-audio/${filename}`, audioFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) {
            throw uploadError;
          }
          
          newStoryAudioUrls[language] = filename;
        }
        
        storyAudioUrls = newStoryAudioUrls;
      }
      
      // Create or update the story with multilingual data
      let storyId = id;
      if (!isEditing) {
        const { data: newStory, error: storyError } = await supabase
          .from("stories")
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
            story_audio: storyAudioUrls
          })
          .select('id')
          .single();
          
        if (storyError) throw storyError;
        storyId = newStory.id;
      } else {
        const { error: storyError } = await supabase
          .from("stories")
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
            story_audio: storyAudioUrls
          })
          .eq("id", storyId);
          
        if (storyError) throw storyError;
      }
      
      // Handle story sections
      if (isEditing) {
        // Delete existing sections for this story
        const { error: deleteSectionsError } = await supabase
          .from("story_sections")
          .delete()
          .eq("story_id", storyId);
          
        if (deleteSectionsError) throw deleteSectionsError;
      }
      
      // Insert all sections
      for (const section of storySections) {
        // Upload section image if it's a file
        let sectionImageUrl = null;
        if (section.imageFile) {
          const filename = `section-${storyId}-${section.order}-${Date.now()}-${section.imageFile.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("admin-content")
            .upload(`story-sections/${filename}`, section.imageFile, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) throw uploadError;
          sectionImageUrl = filename;
        } else if (typeof section.image === "string") {
          sectionImageUrl = section.image;
        }
        
        // Upload voice files only if in per_section mode
        const voiceUrls: Record<string, string> = { ...section.voices };
        if (storyData.audio_mode === 'per_section' && section.voiceFiles) {
          for (const [language, voiceFile] of Object.entries(section.voiceFiles)) {
            const filename = `voice-${storyId}-${section.order}-${language}-${Date.now()}-${voiceFile.name}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("admin-content")
              .upload(`story-voices/${filename}`, voiceFile, {
                cacheControl: '3600',
                upsert: false
              });
              
            if (uploadError) throw uploadError;
            voiceUrls[language] = filename;
          }
        }
        
        // Insert section
        const { error: sectionError } = await supabase
          .from("story_sections")
          .insert({
            story_id: storyId,
            order: section.order,
            image: sectionImageUrl,
            texts: section.texts,
            voices: storyData.audio_mode === 'per_section' ? voiceUrls : {}
          });
          
        if (sectionError) throw sectionError;
      }
      
      toast.success(`Story ${isEditing ? "updated" : "created"} successfully!`);
      navigate("/admin/stories");
    } catch (error: any) {
      console.error("Error saving story:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} story: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/stories")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">{isEditing ? "Edit Story" : "Create New Story"}</h1>
        </div>
      </header>
      
      {isEditing && isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-lg">Loading story details...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-8">
            {/* Languages Card - Moved to top */}
            <Card>
              <CardHeader>
                <CardTitle>Languages</CardTitle>
                <CardDescription>Manage available languages for this story</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {storyData.languages.map(language => {
                    const langOption = languages?.find(opt => opt.code === language);
                    return (
                      <Badge key={language} variant="outline" className="py-2 text-sm">
                        {langOption?.name || language}
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
                        {languagesLoading ? (
                          <div className="px-2 py-1 text-sm text-muted-foreground">Loading languages...</div>
                        ) : languages && languages.length > 0 ? (
                          languages.map(language => (
                            <SelectItem
                              key={language.id}
                              value={language.code}
                              disabled={storyData.languages.includes(language.code)}
                            >
                              {language.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-2 py-1 text-sm text-muted-foreground">No languages available</div>
                        )}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Add Language
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Story Details Card - Updated for multilingual support */}
            <Card>
              <CardHeader>
                <CardTitle>Story Details</CardTitle>
                <CardDescription>Basic information about the story in multiple languages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Multilingual Title and Description */}
                <Tabs defaultValue={storyData.languages[0]} className="w-full">
                  <TabsList>
                    {storyData.languages.map(lang => {
                      const langOption = languages?.find(opt => opt.code === lang);
                      return (
                        <TabsTrigger key={lang} value={lang}>
                          {langOption?.name || lang}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                  {storyData.languages.map(lang => (
                    <TabsContent key={lang} value={lang} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`title-${lang}`}>Title ({languages?.find(opt => opt.code === lang)?.name})</Label>
                        <Input
                          id={`title-${lang}`}
                          placeholder={`Enter story title in ${lang}`}
                          value={storyData.title[lang] || ""}
                          onChange={(e) => updateStoryTitle(lang, e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`description-${lang}`}>Description ({languages?.find(opt => opt.code === lang)?.name})</Label>
                        <Textarea
                          id={`description-${lang}`}
                          placeholder={`Enter story description in ${lang}`}
                          value={storyData.description[lang] || ""}
                          onChange={(e) => updateStoryDescription(lang, e.target.value)}
                          className="min-h-[100px]"
                          required
                        />
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={storyData.category}
                      onValueChange={(value) => setStoryData({ ...storyData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categoriesLoading ? (
                            <div className="px-2 py-1 text-sm text-muted-foreground">Loading categories...</div>
                          ) : categories && categories.length > 0 ? (
                            categories.map(category => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-sm text-muted-foreground">No categories available</div>
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="cover-image">Cover Image</Label>
                    <div className="flex flex-col items-center gap-4">
                      {coverImagePreview ? (
                        <div className="relative w-full max-w-[200px] aspect-square rounded-md overflow-hidden border">
                          <img 
                            src={coverImagePreview} 
                            alt="Cover preview" 
                            className="w-full h-full object-cover"
                            onLoad={() => console.log('Preview image loaded successfully')}
                            onError={(e) => {
                              console.log('Preview image failed to load:', coverImagePreview);
                            }}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              console.log('Clearing image preview');
                              setCoverImagePreview(null);
                              setCoverImageFile(null);
                              setStoryData({ ...storyData, cover_image: null });
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full max-w-[200px] aspect-square rounded-md bg-muted border border-dashed border-muted-foreground/50">
                          <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground text-center">
                            Click to upload or<br />drag and drop
                          </p>
                        </div>
                      )}
                      <Input 
                        id="cover-image"
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageChange}
                        className={coverImagePreview ? "hidden" : ""}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        min="1"
                        value={storyData.duration}
                        onChange={(e) => setStoryData({ ...storyData, duration: parseInt(e.target.value) || 5 })}
                        required
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-free">Free Story</Label>
                      <Switch
                        id="is-free"
                        checked={storyData.is_free}
                        onCheckedChange={(checked) => setStoryData({ ...storyData, is_free: checked })}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-published">Published</Label>
                      <Switch
                        id="is-published"
                        checked={storyData.is_published}
                        onCheckedChange={(checked) => setStoryData({ ...storyData, is_published: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>Configure how audio is handled for this story</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audio-mode" className="text-base font-medium">Audio Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose between single audio for the whole story or separate audio for each section
                    </p>
                  </div>
                  <Switch
                    id="audio-mode"
                    checked={storyData.audio_mode === 'single_story'}
                    onCheckedChange={(checked) => 
                      setStoryData({ ...storyData, audio_mode: checked ? 'single_story' : 'per_section' })
                    }
                  />
                </div>
                
                <div className="text-sm text-muted-foreground">
                  Mode: <span className="font-medium">
                    {storyData.audio_mode === 'single_story' ? 'Single audio for whole story' : 'Audio per section'}
                  </span>
                </div>

                {/* Single Story Audio Upload - Now per language */}
                {storyData.audio_mode === 'single_story' && (
                  <div className="space-y-4">
                    <Label>Story Audio (Per Language)</Label>
                    <Tabs defaultValue={storyData.languages[0]} className="w-full">
                      <TabsList>
                        {storyData.languages.map(lang => {
                          const langOption = languages?.find(opt => opt.code === lang);
                          return (
                            <TabsTrigger key={lang} value={lang}>
                              {langOption?.name || lang}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                      {storyData.languages.map(lang => (
                        <TabsContent key={lang} value={lang} className="space-y-2">
                          <div className="flex items-center gap-4">
                            {storyAudioPreviews[lang] ? (
                              <div className="flex items-center gap-2 p-2 border rounded">
                                <Volume2 className="h-4 w-4" />
                                <span className="text-sm">Audio uploaded ({languages?.find(opt => opt.code === lang)?.name})</span>
                                <Button
                                  type="button"
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => {
                                    const newPreviews = { ...storyAudioPreviews };
                                    const newFiles = { ...storyAudioFiles };
                                    delete newPreviews[lang];
                                    delete newFiles[lang];
                                    setStoryAudioPreviews(newPreviews);
                                    setStoryAudioFiles(newFiles);
                                    setStoryData(prev => ({
                                      ...prev,
                                      story_audio: { ...prev.story_audio, [lang]: "" }
                                    }));
                                  }}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-sm text-muted-foreground">No audio uploaded for {languages?.find(opt => opt.code === lang)?.name}</div>
                            )}
                            <Input 
                              type="file"
                              accept="audio/*"
                              onChange={(e) => handleStoryAudioChange(lang, e)}
                              className="flex-1"
                            />
                          </div>
                        </TabsContent>
                      ))}
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Story Sections Card */}
            <Card>
              <CardHeader>
                <CardTitle>Story Sections</CardTitle>
                <CardDescription>Create sections with text, audio, and images for each language</CardDescription>
                <Button type="button" onClick={addNewSection} className="mt-2">
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
                            <span className="font-medium">Section {section.order}</span>
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
                                        updatedSections[sectionIndex].imageFile = null;
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
                                  const langOption = languages?.find(opt => opt.code === lang);
                                  return (
                                    <TabsTrigger key={lang} value={lang}>
                                      {langOption?.name || lang}
                                    </TabsTrigger>
                                  );
                                })}
                              </TabsList>
                              {storyData.languages.map(lang => (
                                <TabsContent key={lang} value={lang} className="space-y-4">
                                  {/* Text content */}
                                  <div className="space-y-2">
                                    <Label>Text Content ({languages?.find(opt => opt.code === lang)?.name})</Label>
                                    <Textarea
                                      placeholder={`Enter section text in ${lang}`}
                                      value={section.texts[lang] || ""}
                                      onChange={(e) => updateSectionText(sectionIndex, lang, e.target.value)}
                                      className="min-h-[120px]"
                                    />
                                  </div>

                                  {/* Voice upload - only show if in per_section mode */}
                                  {storyData.audio_mode === 'per_section' && (
                                    <div className="space-y-2">
                                      <Label>Voice Audio ({languages?.find(opt => opt.code === lang)?.name})</Label>
                                      <Input 
                                        type="file"
                                        accept="audio/*"
                                        onChange={(e) => handleSectionVoiceChange(sectionIndex, lang, e)}
                                      />
                                    </div>
                                  )}
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
          </div>
          
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/stories")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || Object.values(storyData.title).some(t => !t) || Object.values(storyData.description).some(d => !d)}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default StoryEditor;
