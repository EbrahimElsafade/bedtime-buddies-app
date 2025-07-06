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
  
  // Story form data
  const [storyData, setStoryData] = useState({
    title: "",
    description: "",
    category: "",
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ["en"],
    cover_image: null as string | null,
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
    
    // Format sections for the UI - ensure all sections have proper structure
    const formattedSections: StorySection[] = sections.map(section => ({
      id: section.id,
      order: section.order,
      texts: section.texts as Record<string, string>,
      voices: section.voices as Record<string, string> | undefined,
      image: section.image || undefined,
    }));
    
    return {
      ...story,
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
      setStoryData({
        title: storyDetails.title || "",
        description: storyDetails.description || "",
        category: storyDetails.category || "",
        duration: storyDetails.duration || 5,
        is_free: storyDetails.is_free,
        is_published: storyDetails.is_published,
        languages: storyDetails.languages || ["en"],
        cover_image: storyDetails.cover_image,
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
  
  // Handle adding a new language
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
    setStoryData({
      ...storyData,
      languages: updatedLanguages
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
      
      // Create or update the story
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
            languages: storyData.languages
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
            languages: storyData.languages
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
        
        // Upload voice files
        const voiceUrls: Record<string, string> = { ...section.voices };
        if (section.voiceFiles) {
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
            voices: voiceUrls
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
            {/* Story Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Story Details</CardTitle>
                <CardDescription>Basic information about the story</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter story title"
                      value={storyData.title}
                      onChange={(e) => setStoryData({ ...storyData, title: e.target.value })}
                      required
                    />
                  </div>
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
                            <SelectItem value="" disabled>Loading categories...</SelectItem>
                          ) : categories?.map(category => (
                            <SelectItem key={category.id} value={category.name}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter story description"
                    value={storyData.description}
                    onChange={(e) => setStoryData({ ...storyData, description: e.target.value })}
                    className="min-h-[100px]"
                    required
                  />
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
            
            {/* Languages Card */}
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
                          <SelectItem value="" disabled>Loading languages...</SelectItem>
                        ) : languages?.map(language => (
                          <SelectItem
                            key={language.id}
                            value={language.code}
                            disabled={storyData.languages.includes(language.code)}
                          >
                            {language.name}
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

                                  {/* Voice upload */}
                                  <div className="space-y-2">
                                    <Label>Voice Audio ({languages?.find(opt => opt.code === lang)?.name})</Label>
                                    <Input 
                                      type="file"
                                      accept="audio/*"
                                      onChange={(e) => handleSectionVoiceChange(sectionIndex, lang, e)}
                                    />
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
              disabled={isSubmitting || storyData.title === "" || storyData.description === ""}
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
