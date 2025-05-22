
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface StoryFormData {
  title: string;
  description: string;
  category: string;
  duration: number;
  is_free: boolean;
  is_published: boolean;
  languages: string[];
  cover_image: string | null;
  scenes: Array<{
    id?: string;
    scene_order: number;
    image: string | null;
    translations: Record<string, { text: string; audio_url: string | null }>;
  }>;
}

export const useStoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== "new" && id !== undefined;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  // Story form data
  const [storyData, setStoryData] = useState<StoryFormData>({
    title: "",
    description: "",
    category: "bedtime",
    duration: 5,
    is_free: true,
    is_published: false,
    languages: ["en"],
    cover_image: null,
    scenes: []
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

  const handleCoverImageRemove = () => {
    setCoverImagePreview(null);
    setCoverImageFile(null);
    setStoryData({ ...storyData, cover_image: null });
  };

  // Handle story data changes
  const handleStoryDataChange = (data: Partial<StoryFormData>) => {
    setStoryData(prev => ({
      ...prev,
      ...data
    }));
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
        // Create new story
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
          
        if (storyError) {
          console.error("Error creating story:", storyError);
          throw storyError;
        }
        
        console.log("New story created:", newStory);
        storyId = newStory.id;
        
        // Insert all scenes for the new story
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
            
          if (sceneError) {
            console.error("Error creating scene:", sceneError);
            throw sceneError;
          }
          
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
            
          if (translationsError) {
            console.error("Error creating translations:", translationsError);
            throw translationsError;
          }
        }
      } else {
        // Update existing story
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
          
        if (storyError) {
          console.error("Error updating story:", storyError);
          throw storyError;
        }
        
        // For simplicity in this version, we'll handle scene updates in a future enhancement
        console.log("Story updated successfully");
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

  return {
    isEditing,
    isLoading,
    isSubmitting,
    storyData,
    coverImagePreview,
    categoryOptions,
    languageOptions,
    handleStoryDataChange,
    handleCoverImageChange,
    handleCoverImageRemove,
    handleAddLanguage,
    handleRemoveLanguage,
    handleAddScene,
    handleDeleteScene,
    handleUpdateSceneTranslation,
    handleSubmit,
  };
};
