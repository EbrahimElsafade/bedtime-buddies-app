
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { StoryDetailsForm } from "./story-editor/StoryDetailsForm";
import { LanguageManager } from "./story-editor/LanguageManager";
import { StorySectionsManager } from "./story-editor/StorySectionsManager";
import { LegacyScenesManager } from "./story-editor/LegacyScenesManager";
import { StoryData, StorySection } from "./story-editor/types";

const StoryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== "new" && !!id;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  // Story form data
  const [storyData, setStoryData] = useState<StoryData>({
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

  // Story sections
  const [storySections, setStorySections] = useState<StorySection[]>([]);

  // Fetch story data if editing
  const fetchStory = async () => {
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
      .select(`
        *,
        story_section_translations (*)
      `)
      .eq("story_id", id)
      .order("section_order", { ascending: true });
      
    if (sectionsError) {
      console.error("Sections fetch error:", sectionsError);
      toast.error("Failed to fetch story sections");
      throw sectionsError;
    }
    
    // Fetch scenes (legacy)
    const { data: scenes, error: scenesError } = await supabase
      .from("story_scenes")
      .select("*")
      .eq("story_id", id)
      .order("scene_order", { ascending: true });
      
    if (scenesError) {
      console.error("Scenes fetch error:", scenesError);
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
          console.error("Translations fetch error:", translationsError);
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
    
    console.log('Story cover_image from DB:', story.cover_image);
    if (story.cover_image) {
      const imageUrl = getImageUrl(story.cover_image);
      console.log('Setting preview image URL:', imageUrl);
      setCoverImagePreview(imageUrl);
    }
    
    // Format sections for the UI
    const formattedSections: StorySection[] = sections.map(section => {
      const translations = section.story_section_translations.reduce((acc, trans) => {
        acc[trans.language] = {
          text: trans.text,
          audio_url: trans.audio_url
        };
        return acc;
      }, {} as Record<string, { text: string; audio_url?: string | null }>);
      
      const imagePreview = section.image ? getImageUrl(section.image) : null;
      
      return {
        id: section.id,
        section_order: section.section_order,
        image: section.image,
        imagePreview,
        translations
      };
    });
    
    return {
      ...story,
      scenes: scenesWithTranslations,
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
        category: storyDetails.category || "bedtime",
        duration: storyDetails.duration || 5,
        is_free: storyDetails.is_free,
        is_published: storyDetails.is_published,
        languages: storyDetails.languages || ["en"],
        cover_image: storyDetails.cover_image,
        scenes: storyDetails.scenes || []
      });
      
      if (storyDetails.sections) {
        setStorySections(storyDetails.sections);
      }
    }
  }, [storyDetails, isEditing, id]);

  // Initialize sections when languages change
  useEffect(() => {
    if (storySections.length === 0 && storyData.languages.length > 0 && !isEditing) {
      const newSection: StorySection = {
        section_order: 1,
        image: null,
        imagePreview: null,
        translations: storyData.languages.reduce((acc, lang) => {
          acc[lang] = { text: "", audio_url: null };
          return acc;
        }, {} as Record<string, { text: string; audio_url?: string | null }>)
      };
      setStorySections([newSection]);
    }
  }, [storyData.languages, isEditing]);
  
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
        
        // Store just the filename, not the full URL
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
        if (section.image && typeof section.image !== "string") {
          const filename = `section-${storyId}-${section.section_order}-${Date.now()}-${section.image.name}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("admin-content")
            .upload(`story-sections/${filename}`, section.image, {
              cacheControl: '3600',
              upsert: false
            });
            
          if (uploadError) throw uploadError;
          sectionImageUrl = filename;
        } else if (typeof section.image === "string") {
          sectionImageUrl = section.image;
        }
        
        // Insert section
        const { data: newSection, error: sectionError } = await supabase
          .from("story_sections")
          .insert({
            story_id: storyId,
            section_order: section.section_order,
            image: sectionImageUrl
          })
          .select('id')
          .single();
          
        if (sectionError) throw sectionError;
        
        // Insert translations for this section
        for (const [language, translation] of Object.entries(section.translations)) {
          if (translation.text) {
            // Upload audio if it's a file
            let audioUrl = translation.audio_url;
            if (translation.audioFile) {
              const filename = `audio-${storyId}-${section.section_order}-${language}-${Date.now()}-${translation.audioFile.name}`;
              
              const { data: uploadData, error: uploadError } = await supabase.storage
                .from("admin-content")
                .upload(`story-audio/${filename}`, translation.audioFile, {
                  cacheControl: '3600',
                  upsert: false
                });
                
              if (uploadError) throw uploadError;
              audioUrl = filename;
            }
            
            const { error: translationError } = await supabase
              .from("story_section_translations")
              .insert({
                section_id: newSection.id,
                language,
                text: translation.text,
                audio_url: audioUrl
              });
              
            if (translationError) throw translationError;
          }
        }
      }
      
      // Handle legacy scenes (for existing stories)
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
            <StoryDetailsForm
              storyData={storyData}
              setStoryData={setStoryData}
              coverImagePreview={coverImagePreview}
              setCoverImagePreview={setCoverImagePreview}
              setCoverImageFile={setCoverImageFile}
            />
            
            <LanguageManager
              storyData={storyData}
              setStoryData={setStoryData}
              storySections={storySections}
              setStorySections={setStorySections}
            />

            <StorySectionsManager
              storyData={storyData}
              storySections={storySections}
              setStorySections={setStorySections}
            />
            
            <LegacyScenesManager
              storyData={storyData}
              setStoryData={setStoryData}
            />
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
