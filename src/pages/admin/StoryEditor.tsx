import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Trash2, Play } from "lucide-react";

interface StoryFormData {
  title: { en: string; ar: string; fr: string };
  description: { en: string; ar: string; fr: string };
  category: string;
  duration: number;
  is_free: boolean;
  is_published: boolean;
  languages: string[];
  audio_mode: "per_section" | "single_story";
  cover_image: string;
  story_audio: { en: string; ar: string; fr: string } | null;
}

interface StorySection {
  id: string;
  order: number;
  texts: { en: string; ar: string; fr: string };
  voices?: { en: string; ar: string; fr: string };
  image?: string;
}

export default function StoryEditor() {
  const navigate = useNavigate();
  const { id: storyId } = useParams();
  const isEditing = !!storyId;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<StoryFormData>({
    title: { en: "", ar: "", fr: "" },
    description: { en: "", ar: "", fr: "" },
    category: "adventure",
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ["en"],
    audio_mode: "per_section",
    cover_image: "",
    story_audio: null,
  });
  
  const [sections, setSections] = useState<StorySection[]>([]);
  const [sectionImages, setSectionImages] = useState<Record<string, string>>({});

  const { data: existingStory, isLoading } = useQuery({
    queryKey: ["story-edit", storyId],
    queryFn: async () => {
      if (!storyId) return null;
      
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .single();
      
      if (storyError) throw storyError;
      
      const { data: storySections, error: sectionsError } = await supabase
        .from("story_sections")
        .select("*")
        .eq("story_id", storyId)
        .order("order");
      
      if (sectionsError) throw sectionsError;
      
      return { story, sections: storySections || [] };
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingStory) {
      const { story, sections: storySections } = existingStory;
      
      // Parse multilingual fields
      const parseMultilingualField = (field: any) => {
        if (typeof field === 'string') {
          try {
            return JSON.parse(field);
          } catch {
            return { en: field, ar: "", fr: "" };
          }
        }
        return field || { en: "", ar: "", fr: "" };
      };

      setFormData({
        title: parseMultilingualField(story.title),
        description: parseMultilingualField(story.description),
        category: story.category,
        duration: story.duration,
        is_free: story.is_free,
        is_published: story.is_published,
        languages: story.languages || ["en"],
        audio_mode: (story.audio_mode === "single_story" ? "single_story" : "per_section") as "per_section" | "single_story",
        cover_image: story.cover_image || "",
        story_audio: story.story_audio ? parseMultilingualField(story.story_audio) : null,
      });

      const transformedSections = storySections.map((section: any) => ({
        id: section.id,
        order: section.order,
        texts: parseMultilingualField(section.texts),
        voices: section.voices ? parseMultilingualField(section.voices) : undefined,
        image: section.image || "",
      }));

      setSections(transformedSections);
      
      // Set section images
      const imageMap: Record<string, string> = {};
      transformedSections.forEach((section: StorySection) => {
        if (section.image) {
          imageMap[section.id] = section.image;
        }
      });
      setSectionImages(imageMap);
    }
  }, [existingStory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.en.trim() || !formData.description.en.trim()) {
      toast.error("Title and description are required");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const storyData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        duration: formData.duration,
        is_free: formData.is_free,
        is_published: formData.is_published,
        languages: formData.languages,
        audio_mode: formData.audio_mode,
        cover_image: formData.cover_image,
        story_audio: formData.story_audio ? JSON.stringify(formData.story_audio) : null,
      };

      if (isEditing && storyId) {
        const { error } = await supabase
          .from("stories")
          .update(storyData)
          .eq("id", storyId);
        
        if (error) throw error;
        toast.success("Story updated successfully!");
      } else {
        const { error } = await supabase
          .from("stories")
          .insert([storyData]);
        
        if (error) throw error;
        toast.success("Story created successfully!");
        navigate("/admin/stories");
      }
    } catch (error) {
      console.error("Error saving story:", error);
      toast.error("Failed to save story");
    } finally {
      setIsSubmitting(false);
    }
  };

  const uploadImage = async (file: File, type: 'cover' | 'section', sectionId?: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = type === 'cover' 
        ? `covers/${fileName}` 
        : `sections/${fileName}`;

      const { data, error } = await supabase.storage
        .from('story-images')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('story-images')
        .getPublicUrl(filePath);

      if (type === 'cover') {
        setFormData(prev => ({ ...prev, cover_image: urlData.publicUrl }));
      } else if (sectionId) {
        setSectionImages(prev => ({ ...prev, [sectionId]: urlData.publicUrl }));
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const uploadAudio = async (file: File, type: 'story' | 'section', language: string, sectionId?: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = type === 'story' 
        ? `story-audio/${fileName}` 
        : `section-audio/${fileName}`;

      const { data, error } = await supabase.storage
        .from('story-audio')
        .upload(filePath, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('story-audio')
        .getPublicUrl(filePath);

      if (type === 'story') {
        setFormData(prev => ({
          ...prev,
          story_audio: {
            ...prev.story_audio,
            [language]: urlData.publicUrl
          } as { en: string; ar: string; fr: string }
        }));
      } else if (sectionId) {
        setSections(prev => prev.map(section => 
          section.id === sectionId 
            ? {
                ...section,
                voices: {
                  ...section.voices,
                  [language]: urlData.publicUrl
                } as { en: string; ar: string; fr: string }
              }
            : section
        ));
      }

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Failed to upload audio');
      return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading story editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/admin/stories")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Stories
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Story" : "Create New Story"}</CardTitle>
          <CardDescription>
            {isEditing ? "Update the story details below" : "Fill in the details to create a new story"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title Section with Tabs */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Title (Required)
              </Label>
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="mt-4">
                  <Input
                    type="text"
                    value={formData.title.en}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, en: e.target.value }
                    }))}
                    placeholder="Enter English title"
                    required
                  />
                </TabsContent>
                <TabsContent value="ar" className="mt-4">
                  <Input
                    type="text"
                    value={formData.title.ar}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, ar: e.target.value }
                    }))}
                    placeholder="أدخل العنوان بالعربية"
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr" className="mt-4">
                  <Input
                    type="text"
                    value={formData.title.fr}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: { ...prev.title, fr: e.target.value }
                    }))}
                    placeholder="Entrez le titre en français"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Description Section with Tabs */}
            <div>
              <Label className="text-base font-medium mb-3 block">
                Description (Required)
              </Label>
              <Tabs defaultValue="en" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">العربية</TabsTrigger>
                  <TabsTrigger value="fr">Français</TabsTrigger>
                </TabsList>
                <TabsContent value="en" className="mt-4">
                  <Textarea
                    value={formData.description.en}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, en: e.target.value }
                    }))}
                    placeholder="Enter English description"
                    required
                  />
                </TabsContent>
                <TabsContent value="ar" className="mt-4">
                  <Textarea
                    value={formData.description.ar}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, ar: e.target.value }
                    }))}
                    placeholder="أدخل الوصف بالعربية"
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr" className="mt-4">
                  <Textarea
                    value={formData.description.fr}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      description: { ...prev.description, fr: e.target.value }
                    }))}
                    placeholder="Entrez la description en français"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Rest of the form fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adventure">Adventure</SelectItem>
                    <SelectItem value="fantasy">Fantasy</SelectItem>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="animals">Animals</SelectItem>
                    <SelectItem value="friendship">Friendship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 0 }))}
                  placeholder="5"
                />
              </div>
            </div>

            {/* Cover Image Upload */}
            <div>
              <Label>Cover Image</Label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadImage(file, 'cover');
                    }
                  }}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                {formData.cover_image && (
                  <div className="mt-4">
                    <img 
                      src={formData.cover_image} 
                      alt="Cover preview" 
                      className="max-w-xs h-auto rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Audio Mode Selection */}
            <div>
              <Label className="text-base font-medium">Audio Mode</Label>
              <div className="mt-2 space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="per_section"
                    name="audio_mode"
                    value="per_section"
                    checked={formData.audio_mode === "per_section"}
                    onChange={(e) => setFormData(prev => ({ ...prev, audio_mode: e.target.value as "per_section" | "single_story" }))}
                  />
                  <Label htmlFor="per_section">Per Section Audio</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="single_story"
                    name="audio_mode"
                    value="single_story"
                    checked={formData.audio_mode === "single_story"}
                    onChange={(e) => setFormData(prev => ({ ...prev, audio_mode: e.target.value as "per_section" | "single_story" }))}
                  />
                  <Label htmlFor="single_story">Single Story Audio</Label>
                </div>
              </div>
            </div>

            {/* Single Story Audio Upload */}
            {formData.audio_mode === "single_story" && (
              <div>
                <Label className="text-base font-medium">Story Audio Files</Label>
                <div className="space-y-4 mt-2">
                  {(['en', 'ar', 'fr'] as const).map((lang) => (
                    <div key={lang}>
                      <Label className="text-sm text-muted-foreground">
                        {lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : 'French'} Audio
                      </Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              uploadAudio(file, 'story', lang);
                            }
                          }}
                          className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                        />
                        {formData.story_audio?.[lang] && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const audio = new Audio(formData.story_audio![lang]);
                              audio.play();
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Play
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Story Sections */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-base font-medium">Story Sections</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const newSectionId = `section-${Date.now()}`;
                    setSections(prev => [...prev, {
                      id: newSectionId,
                      order: prev.length + 1,
                      texts: { en: '', ar: '', fr: '' },
                      voices: formData.audio_mode === "per_section" ? { en: '', ar: '', fr: '' } : undefined,
                      image: ''
                    }]);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
              </div>

              {sections.map((section, index) => (
                <Card key={section.id} className="mb-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Section {section.order}</CardTitle>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSections(prev => prev.filter(s => s.id !== section.id));
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Section Text with Tabs */}
                    <div>
                      <Label className="text-sm font-medium mb-3 block">Section Text</Label>
                      <Tabs defaultValue="en" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                          <TabsTrigger value="en">English</TabsTrigger>
                          <TabsTrigger value="ar">العربية</TabsTrigger>
                          <TabsTrigger value="fr">Français</TabsTrigger>
                        </TabsList>
                        <TabsContent value="en" className="mt-4">
                          <Textarea
                            value={section.texts.en}
                            onChange={(e) => {
                              setSections(prev => prev.map(s => 
                                s.id === section.id 
                                  ? { ...s, texts: { ...s.texts, en: e.target.value } }
                                  : s
                              ));
                            }}
                            placeholder="Enter English text"
                          />
                        </TabsContent>
                        <TabsContent value="ar" className="mt-4">
                          <Textarea
                            value={section.texts.ar}
                            onChange={(e) => {
                              setSections(prev => prev.map(s => 
                                s.id === section.id 
                                  ? { ...s, texts: { ...s.texts, ar: e.target.value } }
                                  : s
                              ));
                            }}
                            placeholder="أدخل النص بالعربية"
                            dir="rtl"
                          />
                        </TabsContent>
                        <TabsContent value="fr" className="mt-4">
                          <Textarea
                            value={section.texts.fr}
                            onChange={(e) => {
                              setSections(prev => prev.map(s => 
                                s.id === section.id 
                                  ? { ...s, texts: { ...s.texts, fr: e.target.value } }
                                  : s
                              ));
                            }}
                            placeholder="Entrez le texte en français"
                          />
                        </TabsContent>
                      </Tabs>
                    </div>

                    {/* Section Image */}
                    <div>
                      <Label className="text-sm font-medium">Section Image</Label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            uploadImage(file, 'section', section.id);
                          }
                        }}
                        className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 mt-1"
                      />
                      {sectionImages[section.id] && (
                        <div className="mt-2">
                          <img 
                            src={sectionImages[section.id]} 
                            alt={`Section ${section.order} preview`} 
                            className="max-w-xs h-auto rounded-lg border"
                          />
                        </div>
                      )}
                    </div>

                    {/* Section Audio (only if per_section mode) */}
                    {formData.audio_mode === "per_section" && section.voices && (
                      <div>
                        <Label className="text-sm font-medium">Section Audio</Label>
                        <div className="space-y-3 mt-2">
                          {(['en', 'ar', 'fr'] as const).map((lang) => (
                            <div key={lang}>
                              <Label className="text-xs text-muted-foreground">
                                {lang === 'en' ? 'English' : lang === 'ar' ? 'Arabic' : 'French'} Audio
                              </Label>
                              <div className="flex items-center space-x-2 mt-1">
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      uploadAudio(file, 'section', lang, section.id);
                                    }
                                  }}
                                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                                />
                                {section.voices[lang] && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const audio = new Audio(section.voices![lang]);
                                      audio.play();
                                    }}
                                  >
                                    <Play className="h-4 w-4 mr-1" />
                                    Play
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Story Options */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_free"
                  checked={formData.is_free}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_free: e.target.checked }))}
                />
                <Label htmlFor="is_free">Free Story</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_published: e.target.checked }))}
                />
                <Label htmlFor="is_published">Published</Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin/stories")}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : isEditing ? "Update Story" : "Create Story"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
