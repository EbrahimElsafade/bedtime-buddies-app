
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  ArrowLeft,
  Plus,
  Trash2,
  Upload,
  Loader2,
  X
} from "lucide-react";

const StoryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== "new";
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  // Story form data
  const [storyData, setStoryData] = useState({
    title: "",
    description: "",
    category: "bedtime",
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ["en"],
    cover_image: null as string | null,
    scenes: [] as Array<{
      id?: string;
      scene_order: number;
      image: string | null;
      translations: Record<string, { text: string; audio_url: string | null }>;
    }>
  });
  
  // Available language options
  const languageOptions = [
    { value: "en", label: "English" },
    { value: "ar-eg", label: "Arabic (Egyptian)" },
    { value: "ar-fos7a", label: "Arabic (Fos7a)" }
  ];
  
  // Category options
  const categoryOptions = [
    { value: "bedtime", label: "Bedtime" },
    { value: "adventure", label: "Adventure" },
    { value: "educational", label: "Educational" },
    { value: "animals", label: "Animals" },
    { value: "fantasy", label: "Fantasy" }
  ];

  // Fetch story data if editing
  const fetchStory = async () => {
    if (!isEditing) return null;
    
    // Fetch story details
    const { data: story, error: storyError } = await supabase
      .from("stories")
      .select("*")
      .eq("id", id)
      .single();
      
    if (storyError) {
      toast.error("Failed to fetch story details");
      throw storyError;
    }
    
    // Fetch scenes
    const { data: scenes, error: scenesError } = await supabase
      .from("story_scenes")
      .select("*")
      .eq("story_id", id)
      .order("scene_order", { ascending: true });
      
    if (scenesError) {
      toast.error("Failed to fetch story scenes");
      throw scenesError;
    }
    
    // Fetch translations for each scene
    const scenesWithTranslations = await Promise.all(
      scenes.map(async (scene) => {
        const { data: translations, error: translationsError } = await supabase
          .from("scene_translations")
          .select("*")
          .eq("scene_id", scene.id);
          
        if (translationsError) {
          toast.error(`Failed to fetch translations for scene ${scene.scene_order}`);
          throw translationsError;
        }
        
        const formattedTranslations = translations.reduce((acc, trans) => {
          acc[trans.language] = {
            text: trans.text,
            audio_url: trans.audio_url
          };
          return acc;
        }, {} as Record<string, { text: string; audio_url: string | null }>);
        
        return {
          ...scene,
          translations: formattedTranslations
        };
      })
    );
    
    if (story.cover_image) {
      setCoverImagePreview(story.cover_image);
    }
    
    return {
      ...story,
      scenes: scenesWithTranslations
    };
  };
  
  const { data: storyDetails, isLoading } = useQuery({
    queryKey: ["admin-story", id],
    queryFn: fetchStory,
    enabled: isEditing,
    staleTime: Infinity
  });
  
  useEffect(() => {
    if (storyDetails) {
      setStoryData({
        title: storyDetails.title || "",
        description: storyDetails.description || "",
        category: storyDetails.category || "bedtime",
        duration: storyDetails.duration || 5,
        is_free: storyDetails.is_free,
        is_published: storyDetails.is_published,
        languages: storyDetails.languages || ["en"],
        cover_image: storyDetails.cover_image,
        scenes: storyDetails.scenes || []
      });
    }
  }, [storyDetails]);
  
  // Handle file input change for cover image
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      
      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      setCoverImagePreview(objectUrl);
    }
  };
  
  // Handle adding a new language
  const handleAddLanguage = (language: string) => {
    if (!storyData.languages.includes(language)) {
      setStoryData({
        ...storyData, 
        languages: [...storyData.languages, language]
      });
      
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
  
  // Handle removing a language
  const handleRemoveLanguage = (language: string) => {
    setStoryData({
      ...storyData,
      languages: storyData.languages.filter(lang => lang !== language)
    });
    
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

  // Handle adding a new scene
  const handleAddScene = () => {
    const newScene = {
      scene_order: storyData.scenes.length + 1,
      image: null,
      translations: storyData.languages.reduce((acc, lang) => {
        acc[lang] = { text: "", audio_url: null };
        return acc;
      }, {} as Record<string, { text: string; audio_url: string | null }>)
    };
    
    setStoryData({
      ...storyData,
      scenes: [...storyData.scenes, newScene]
    });
  };
  
  // Handle deleting a scene
  const handleDeleteScene = (index: number) => {
    const updatedScenes = [...storyData.scenes];
    updatedScenes.splice(index, 1);
    
    // Reorder scenes
    const reorderedScenes = updatedScenes.map((scene, idx) => ({
      ...scene,
      scene_order: idx + 1
    }));
    
    setStoryData({
      ...storyData,
      scenes: reorderedScenes
    });
  };
  
  // Handle updating a scene translation
  const handleUpdateSceneTranslation = (
    sceneIndex: number,
    language: string,
    text: string
  ) => {
    const updatedScenes = [...storyData.scenes];
    updatedScenes[sceneIndex].translations[language].text = text;
    
    setStoryData({
      ...storyData,
      scenes: updatedScenes
    });
  };
  
  // Handle save/submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let coverImageUrl = storyData.cover_image;
      
      // Upload cover image if changed
      if (coverImageFile) {
        const filename = `cover-${Date.now()}-${coverImageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("admin-content")
          .upload(`story-covers/${filename}`, coverImageFile);
          
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: urlData } = supabase.storage
          .from("admin-content")
          .getPublicUrl(`story-covers/${filename}`);
          
        coverImageUrl = urlData.publicUrl;
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
      
      // Handle scenes (for this simplified version we'll just add new scenes)
      // A more complete implementation would handle updating existing scenes
      if (!isEditing) {
        // Insert all scenes for a new story
        for (const scene of storyData.scenes) {
          const { data: newScene, error: sceneError } = await supabase
            .from("story_scenes")
            .insert({
              story_id: storyId,
              scene_order: scene.scene_order,
              image: scene.image
            })
            .select('id')
            .single();
            
          if (sceneError) throw sceneError;
          
          // Insert translations for this scene
          const translations = Object.entries(scene.translations).map(
            ([language, content]) => ({
              scene_id: newScene.id,
              language,
              text: content.text,
              audio_url: content.audio_url
            })
          );
          
          const { error: translationsError } = await supabase
            .from("scene_translations")
            .insert(translations);
            
          if (translationsError) throw translationsError;
        }
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
            <Card>
              <CardHeader>
                <CardTitle>Story Details</CardTitle>
                <CardDescription>
                  Basic information about the story
                </CardDescription>
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
                          {categoryOptions.map(category => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
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
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
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
            
            <Card>
              <CardHeader>
                <CardTitle>Story Scenes</CardTitle>
                <CardDescription>
                  Add and manage story scenes with text and images
                </CardDescription>
                <Button 
                  type="button" 
                  onClick={handleAddScene}
                  className="mt-2"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Scene
                </Button>
              </CardHeader>
              <CardContent>
                {storyData.scenes.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <p className="text-muted-foreground">
                      No scenes added yet. Click "Add Scene" to get started.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {storyData.scenes.map((scene, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-lg">Scene {scene.scene_order}</CardTitle>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteScene(index)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="mb-4">
                            <Label>Scene Image (coming soon)</Label>
                            <div className="flex items-center justify-center h-32 bg-muted rounded-md">
                              <Upload className="h-8 w-8 text-muted-foreground" />
                            </div>
                          </div>
                          
                          <Tabs defaultValue={storyData.languages[0]}>
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
                              <TabsContent key={lang} value={lang}>
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Text Content</Label>
                                    <Textarea
                                      placeholder={`Enter scene text in ${lang}`}
                                      value={scene.translations[lang]?.text || ""}
                                      onChange={(e) => handleUpdateSceneTranslation(
                                        index, 
                                        lang, 
                                        e.target.value
                                      )}
                                      className="min-h-[120px]"
                                    />
                                  </div>
                                </div>
                              </TabsContent>
                            ))}
                          </Tabs>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
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
