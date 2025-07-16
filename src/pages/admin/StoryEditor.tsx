import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslation } from "react-i18next";

interface StoryFormData {
  title: Record<string, string>;
  description: Record<string, string>;
  category: string;
  duration: number;
  is_free: boolean;
  is_published: boolean;
  languages: string[];
  audio_mode: "per_section" | "single_story";
  cover_image?: string;
  story_audio?: Record<string, string>;
}

interface StorySection {
  id?: string;
  order: number;
  texts: Record<string, string>;
  voices?: Record<string, string>;
  image?: string;
}

const StoryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { language } = useLanguage();
  const { t } = useTranslation(['admin']);
  const isEditing = !!id;

  const [formData, setFormData] = useState<StoryFormData>({
    title: { en: "", ar: "", fr: "" },
    description: { en: "", ar: "", fr: "" },
    category: "",
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ["en"],
    audio_mode: "per_section"
  });

  const [sections, setSections] = useState<StorySection[]>([]);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [storyAudioFiles, setStoryAudioFiles] = useState<Record<string, File>>({});
  const [sectionImageFiles, setSectionImageFiles] = useState<Record<string, File>>({});
  const [sectionVoiceFiles, setSectionVoiceFiles] = useState<Record<string, Record<string, File>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch story details if editing
  const { data: storyDetails, isLoading } = useQuery({
    queryKey: ["story-details", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data: story, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", id)
        .single();
      
      if (storyError) throw storyError;

      const { data: storySections, error: sectionsError } = await supabase
        .from("story_sections")
        .select("*")
        .eq("story_id", id)
        .order("order", { ascending: true });
      
      if (sectionsError) throw sectionsError;

      return {
        ...story,
        sections: storySections || []
      };
    },
    enabled: isEditing
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["story-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("story_categories")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data || [];
    }
  });

  useEffect(() => {
    if (storyDetails && isEditing) {
      console.log('StoryEditor - isEditing:', isEditing, 'id:', id, 'storyDetails:', storyDetails);
      
      // Parse title and description properly
      const parseMultilingualField = (field: any): Record<string, string> => {
        if (typeof field === 'string') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(field);
            if (typeof parsed === 'object' && parsed !== null) {
              return parsed;
            }
            // If it's just a string, assume it's English
            return { en: field, ar: "", fr: "" };
          } catch {
            // If parsing fails, treat as English text
            return { en: field, ar: "", fr: "" };
          }
        } else if (typeof field === 'object' && field !== null) {
          // Already an object, ensure it has the required keys
          return {
            en: field.en || "",
            ar: field.ar || "",
            fr: field.fr || ""
          };
        }
        // Default fallback
        return { en: "", ar: "", fr: "" };
      };

      const parsedTitle = parseMultilingualField(storyDetails.title);
      const parsedDescription = parseMultilingualField(storyDetails.description);

      // Parse story audio
      const parseStoryAudio = (audio: any): Record<string, string> | undefined => {
        if (typeof audio === 'string') {
          try {
            return JSON.parse(audio);
          } catch {
            return { en: audio };
          }
        } else if (typeof audio === 'object' && audio !== null) {
          return audio;
        }
        return undefined;
      };

      setFormData({
        title: parsedTitle,
        description: parsedDescription,
        category: storyDetails.category,
        duration: storyDetails.duration,
        is_free: storyDetails.is_free,
        is_published: storyDetails.is_published,
        languages: storyDetails.languages || ["en"],
        audio_mode: (storyDetails.audio_mode as "per_section" | "single_story") || "per_section",
        cover_image: storyDetails.cover_image,
        story_audio: parseStoryAudio(storyDetails.story_audio)
      });

      // Set sections
      if (storyDetails.sections) {
        setSections(storyDetails.sections.map((section: any) => ({
          id: section.id,
          order: section.order,
          texts: section.texts || {},
          voices: section.voices || {},
          image: section.image
        })));
      }
    }
  }, [storyDetails, isEditing, id]);

  const uploadFile = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      let coverImagePath = formData.cover_image;
      let storyAudioPaths = formData.story_audio || {};

      // Upload cover image if new file selected
      if (coverImageFile) {
        const timestamp = Date.now();
        const fileName = `cover-${timestamp}-${coverImageFile.name}`;
        coverImagePath = await uploadFile(coverImageFile, "admin-content", `story-covers/${fileName}`);
      }

      // Upload story audio files if in single_story mode
      if (formData.audio_mode === "single_story") {
        for (const [lang, file] of Object.entries(storyAudioFiles)) {
          if (file) {
            const timestamp = Date.now();
            const fileName = `story-audio-${timestamp}-${lang}-${file.name}`;
            const path = await uploadFile(file, "admin-content", `story-audio/${fileName}`);
            storyAudioPaths[lang] = path;
          }
        }
      }

      // Prepare story data - store as proper JSON objects
      const storyData = {
        title: formData.title, // Direct object, not stringified
        description: formData.description, // Direct object, not stringified
        category: formData.category,
        duration: formData.duration,
        is_free: formData.is_free,
        is_published: formData.is_published,
        languages: formData.languages,
        audio_mode: formData.audio_mode,
        cover_image: coverImagePath,
        story_audio: Object.keys(storyAudioPaths).length > 0 ? storyAudioPaths : null
      };

      let storyId = id;

      if (isEditing) {
        // Update existing story
        const { error: updateError } = await supabase
          .from("stories")
          .update(storyData)
          .eq("id", id);
        
        if (updateError) throw updateError;
      } else {
        // Create new story
        const { data: newStory, error: insertError } = await supabase
          .from("stories")
          .insert(storyData)
          .select()
          .single();
        
        if (insertError) throw insertError;
        storyId = newStory.id;
      }

      // Handle sections
      if (sections.length > 0) {
        // Delete existing sections if editing
        if (isEditing) {
          const { error: deleteError } = await supabase
            .from("story_sections")
            .delete()
            .eq("story_id", storyId);
          
          if (deleteError) throw deleteError;
        }

        // Upload section images and voices
        const sectionsToInsert = [];
        
        for (const section of sections) {
          let sectionImagePath = section.image;
          const sectionVoicePaths = { ...section.voices } || {};

          // Upload section image if new file
          const sectionKey = section.id || `new-${section.order}`;
          if (sectionImageFiles[sectionKey]) {
            const timestamp = Date.now();
            const fileName = `section-${storyId}-${section.order}-${timestamp}-${sectionImageFiles[sectionKey].name}`;
            sectionImagePath = await uploadFile(sectionImageFiles[sectionKey], "admin-content", `story-sections/${fileName}`);
          }

          // Upload section voices if per_section mode
          if (formData.audio_mode === "per_section" && sectionVoiceFiles[sectionKey]) {
            for (const [lang, file] of Object.entries(sectionVoiceFiles[sectionKey] || {})) {
              if (file) {
                const timestamp = Date.now();
                const fileName = `section-voice-${storyId}-${section.order}-${lang}-${timestamp}-${file.name}`;
                const path = await uploadFile(file, "admin-content", `story-voices/${fileName}`);
                sectionVoicePaths[lang] = path;
              }
            }
          }

          sectionsToInsert.push({
            story_id: storyId,
            order: section.order,
            texts: section.texts,
            voices: sectionVoicePaths,
            image: sectionImagePath
          });
        }

        // Insert sections
        const { error: sectionsError } = await supabase
          .from("story_sections")
          .insert(sectionsToInsert);
        
        if (sectionsError) throw sectionsError;
      }

      toast.success(isEditing ? "Story updated successfully!" : "Story created successfully!");
      navigate("/admin/stories");
    } catch (error) {
      console.error("Error saving story:", error);
      toast.error("Failed to save story. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addSection = () => {
    const newSection: StorySection = {
      order: sections.length + 1,
      texts: formData.languages.reduce((acc, lang) => {
        acc[lang] = "";
        return acc;
      }, {} as Record<string, string>),
      voices: {}
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof StorySection, value: any) => {
    const updatedSections = [...sections];
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setSections(updatedSections);
  };

  const updateSectionText = (index: number, language: string, text: string) => {
    const updatedSections = [...sections];
    updatedSections[index].texts[language] = text;
    setSections(updatedSections);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dream-DEFAULT mx-auto mb-4"></div>
          <p>Loading story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/stories")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Stories
        </Button>
        <h1 className="text-2xl font-bold">
          {isEditing ? "Edit Story" : "Create New Story"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Multilingual Title */}
            <div className="space-y-2">
              <Label>Story Title</Label>
              <Tabs defaultValue="en" className="w-full">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                  <TabsTrigger value="fr">French</TabsTrigger>
                </TabsList>
                <TabsContent value="en">
                  <Input
                    value={formData.title.en}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, en: e.target.value }
                    })}
                    placeholder="Enter English title"
                    required
                  />
                </TabsContent>
                <TabsContent value="ar">
                  <Input
                    value={formData.title.ar}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, ar: e.target.value }
                    })}
                    placeholder="أدخل العنوان بالعربية"
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr">
                  <Input
                    value={formData.title.fr}
                    onChange={(e) => setFormData({
                      ...formData,
                      title: { ...formData.title, fr: e.target.value }
                    })}
                    placeholder="Entrez le titre en français"
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Multilingual Description */}
            <div className="space-y-2">
              <Label>Story Description</Label>
              <Tabs defaultValue="en" className="w-full">
                <TabsList>
                  <TabsTrigger value="en">English</TabsTrigger>
                  <TabsTrigger value="ar">Arabic</TabsTrigger>
                  <TabsTrigger value="fr">French</TabsTrigger>
                </TabsList>
                <TabsContent value="en">
                  <Textarea
                    value={formData.description.en}
                    onChange={(e) => setFormData({
                      ...formData,
                      description: { ...formData.description, en: e.target.value }
                    })}
                    placeholder="Enter English description"
                    rows={3}
                    required
                  />
                </TabsContent>
                <TabsContent value="ar">
                  <Textarea
                    value={formData.description.ar}
                    onChange={(e) => setFormData({
                      ...formData,
                      description: { ...formData.description, ar: e.target.value }
                    })}
                    placeholder="أدخل الوصف بالعربية"
                    rows={3}
                    dir="rtl"
                  />
                </TabsContent>
                <TabsContent value="fr">
                  <Textarea
                    value={formData.description.fr}
                    onChange={(e) => setFormData({
                      ...formData,
                      description: { ...formData.description, fr: e.target.value }
                    })}
                    placeholder="Entrez la description en français"
                    rows={3}
                  />
                </TabsContent>
              </Tabs>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name.charAt(0).toUpperCase() + category.name.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_free"
                  checked={formData.is_free}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_free: checked })}
                />
                <Label htmlFor="is_free">Free Story</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                />
                <Label htmlFor="is_published">Published</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Cover Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {formData.cover_image && !coverImageFile && (
                <div className="relative w-32 h-20 rounded overflow-hidden border border-muted-foreground">
                  <img src={supabase.storage.from("admin-content").getPublicUrl(formData.cover_image).publicUrl} alt="Cover" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                    onClick={() => setFormData({ ...formData, cover_image: undefined })}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {coverImageFile && (
                <div className="relative w-32 h-20 rounded overflow-hidden border border-muted-foreground">
                  <img src={URL.createObjectURL(coverImageFile)} alt="Cover Preview" className="object-cover w-full h-full" />
                  <button
                    type="button"
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                    onClick={() => setCoverImageFile(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = "image/*";
                  input.onchange = (e: any) => {
                    if (e.target.files && e.target.files[0]) {
                      setCoverImageFile(e.target.files[0]);
                    }
                  };
                  input.click();
                }}
                leftIcon={<Upload />}
              >
                Upload Cover Image
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audio Mode */}
        <Card>
          <CardHeader>
            <CardTitle>Audio Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={formData.audio_mode} onValueChange={(value) => setFormData({ ...formData, audio_mode: value as "per_section" | "single_story" })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="per_section">Per Section Audio</SelectItem>
                <SelectItem value="single_story">Single Story Audio</SelectItem>
              </SelectContent>
            </Select>

            {formData.audio_mode === "single_story" && (
              <div className="mt-4 space-y-4">
                <Label>Upload Story Audio Files</Label>
                {formData.languages.map((lang) => (
                  <div key={lang} className="flex items-center gap-4">
                    <span className="w-16">{lang.toUpperCase()}</span>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setStoryAudioFiles({ ...storyAudioFiles, [lang]: e.target.files[0] });
                        }
                      }}
                    />
                    {formData.story_audio && formData.story_audio[lang] && !storyAudioFiles[lang] && (
                      <audio controls src={supabase.storage.from("admin-content").getPublicUrl(formData.story_audio[lang]).publicUrl} />
                    )}
                    {storyAudioFiles[lang] && (
                      <span>{storyAudioFiles[lang].name}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Story Sections</CardTitle>
            <Button variant="outline" size="sm" onClick={addSection} leftIcon={<Plus />}>
              Add Section
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.map((section, index) => (
              <Card key={section.id || index} className="border border-muted-foreground p-4 rounded">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">Section {section.order}</h3>
                  <Button variant="destructive" size="icon" onClick={() => removeSection(index)} aria-label="Remove section">
                    <Trash2 size={16} />
                  </Button>
                </div>

                <Tabs defaultValue={formData.languages[0]} className="w-full">
                  <TabsList>
                    {formData.languages.map((lang) => (
                      <TabsTrigger key={lang} value={lang}>
                        {lang.toUpperCase()}
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {formData.languages.map((lang) => (
                    <TabsContent key={lang} value={lang}>
                      <Label>Text ({lang.toUpperCase()})</Label>
                      <Textarea
                        value={section.texts[lang] || ""}
                        onChange={(e) => updateSectionText(index, lang, e.target.value)}
                        rows={3}
                        className={lang === "ar" ? "dir-rtl" : ""}
                      />
                    </TabsContent>
                  ))}
                </Tabs>

                {/* Section Image Upload */}
                <div className="mt-4">
                  <Label>Section Image</Label>
                  <div className="flex items-center gap-4">
                    {section.image && !sectionImageFiles[section.id || `new-${section.order}`] && (
                      <div className="relative w-32 h-20 rounded overflow-hidden border border-muted-foreground">
                        <img src={supabase.storage.from("admin-content").getPublicUrl(section.image).publicUrl} alt="Section" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          onClick={() => updateSection(index, "image", undefined)}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    {sectionImageFiles[section.id || `new-${section.order}`] && (
                      <div className="relative w-32 h-20 rounded overflow-hidden border border-muted-foreground">
                        <img src={URL.createObjectURL(sectionImageFiles[section.id || `new-${section.order}`])} alt="Section Preview" className="object-cover w-full h-full" />
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
                          onClick={() => {
                            const newFiles = { ...sectionImageFiles };
                            delete newFiles[section.id || `new-${section.order}`];
                            setSectionImageFiles(newFiles);
                          }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        const input = document.createElement("input");
                        input.type = "file";
                        input.accept = "image/*";
                        input.onchange = (e: any) => {
                          if (e.target.files && e.target.files[0]) {
                            setSectionImageFiles({
                              ...sectionImageFiles,
                              [section.id || `new-${section.order}`]: e.target.files[0]
                            });
                          }
                        };
                        input.click();
                      }}
                      leftIcon={<Upload />}
                    >
                      Upload Image
                    </Button>
                  </div>
                </div>

                {/* Section Voices Upload (only if per_section mode) */}
                {formData.audio_mode === "per_section" && (
                  <div className="mt-4">
                    <Label>Section Voices</Label>
                    {formData.languages.map((lang) => (
                      <div key={lang} className="flex items-center gap-4 mb-2">
                        <span className="w-16">{lang.toUpperCase()}</span>
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setSectionVoiceFiles({
                                ...sectionVoiceFiles,
                                [section.id || `new-${section.order}`]: {
                                  ...(sectionVoiceFiles[section.id || `new-${section.order}`] || {}),
                                  [lang]: e.target.files[0]
                                }
                              });
                            }
                          }}
                        />
                        {section.voices && section.voices[lang] && !(sectionVoiceFiles[section.id || `new-${section.order}`]?.[lang]) && (
                          <audio controls src={supabase.storage.from("admin-content").getPublicUrl(section.voices[lang]).publicUrl} />
                        )}
                        {sectionVoiceFiles[section.id || `new-${section.order}`]?.[lang] && (
                          <span>{sectionVoiceFiles[section.id || `new-${section.order}`][lang].name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/stories")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (isEditing ? "Update Story" : "Create Story")}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StoryEditor;
