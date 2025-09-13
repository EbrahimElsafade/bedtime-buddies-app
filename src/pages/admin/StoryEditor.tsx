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
} from "lucide-react";
import { getImageUrl } from "@/utils/imageUtils";
import { Story, StorySection } from "@/types/story";
import { VoiceFileUpload } from "@/components/admin/VoiceFileUpload";
import { StoryAudioUpload } from "@/components/admin/StoryAudioUpload";

interface StorySectionForm extends Omit<StorySection, "id"> {
  id?: string;
  imageFile?: File | null;
  imagePreview?: string | null;
  voiceFiles?: Record<string, File>;
  voicePreviews?: Record<string, string>;
}

// Fixed app languages
const APP_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "ar", name: "Arabic" },
  { code: "fr", name: "French" },
];

const StoryEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== "new" && !!id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [storyAudioFiles, setStoryAudioFiles] = useState<Record<string, File>>({});
  const [storyAudioPreviews, setStoryAudioPreviews] = useState<Record<string, string>>({});

  // Story form data - Updated to handle multilingual titles and descriptions with fixed languages
  const [storyData, setStoryData] = useState({
    title: { en: "", ar: "", fr: "" } as Record<string, string>,
    description: { en: "", ar: "", fr: "" } as Record<string, string>,
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
    },
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
    },
  });

  // Fetch story data if editing
  const { data: storyDetails, isLoading } = useQuery({
    queryKey: ["admin-story", id],
    queryFn: async () => {
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

      console.log("Fetched story sections:", sections);

      return {
        story,
        sections: sections || []
      };
    },
    enabled: isEditing && !!id && id !== "new",
    staleTime: Infinity,
  });

  useEffect(() => {
    console.log("StoryEditor - isEditing:", isEditing, "id:", id, "storyDetails:", storyDetails);

    if (storyDetails) {
      const { story, sections } = storyDetails;

      // Handle cover image preview
      if (story.cover_image) {
        const imageUrl = getImageUrl(story.cover_image);
        console.log("Setting preview image URL:", imageUrl);
        setCoverImagePreview(imageUrl);
      }

      // Handle multilingual title and description with fixed languages
      let titleObj = { en: "", ar: "", fr: "" };
      let descriptionObj = { en: "", ar: "", fr: "" };
      let storyAudioObj = {};

      // Parse title
      if (typeof story.title === 'string') {
        try {
          const parsed = JSON.parse(story.title);
          titleObj = { en: parsed.en || "", ar: parsed.ar || "", fr: parsed.fr || "" };
        } catch {
          titleObj = { en: story.title, ar: "", fr: "" };
        }
      } else if (story.title && typeof story.title === 'object') {
        const existingTitle = story.title as Record<string, string>;
        titleObj = {
          en: existingTitle.en || "",
          ar: existingTitle.ar || "",
          fr: existingTitle.fr || "",
        };
      }

      // Parse description
      if (typeof story.description === 'string') {
        try {
          const parsed = JSON.parse(story.description);
          descriptionObj = { en: parsed.en || "", ar: parsed.ar || "", fr: parsed.fr || "" };
        } catch {
          descriptionObj = { en: story.description, ar: "", fr: "" };
        }
      } else if (story.description && typeof story.description === 'object') {
        const existingDescription = story.description as Record<string, string>;
        descriptionObj = {
          en: existingDescription.en || "",
          ar: existingDescription.ar || "",
          fr: existingDescription.fr || "",
        };
      }

      // Parse story audio
      if (typeof story.story_audio === 'string') {
        try {
          storyAudioObj = JSON.parse(story.story_audio);
        } catch {
          storyAudioObj = { en: story.story_audio };
        }
      } else if (story.story_audio && typeof story.story_audio === 'object') {
        storyAudioObj = story.story_audio as Record<string, string>;
      }

      // Set story audio previews
      if (storyAudioObj && Object.keys(storyAudioObj).length > 0) {
        const audioUrls: Record<string, string> = {};
        Object.entries(storyAudioObj as Record<string, string>).forEach(
          ([lang, audioFile]) => {
            if (audioFile) {
              audioUrls[lang] = getImageUrl(audioFile);
            }
          }
        );
        setStoryAudioPreviews(audioUrls);
      }

      setStoryData({
        title: titleObj,
        description: descriptionObj,
        category: story.category || "",
        duration: story.duration || 5,
        is_free: story.is_free,
        is_published: story.is_published,
        languages: story.languages || ["en"],
        cover_image: story.cover_image,
        audio_mode: (story.audio_mode || "per_section") as "per_section" | "single_story",
        story_audio: storyAudioObj,
      });

      // Process sections for the form
      if (sections && sections.length > 0) {
        console.log("Processing sections:", sections);
        const sectionsForForm: StorySectionForm[] = sections.map((section) => {
          console.log("Processing section:", section);
          
          // Parse texts
          let texts = {};
          if (typeof section.texts === 'string') {
            try {
              texts = JSON.parse(section.texts);
            } catch {
              texts = { en: section.texts };
            }
          } else if (section.texts && typeof section.texts === 'object') {
            texts = section.texts;
          }

          // Parse voices
          let voices = {};
          if (typeof section.voices === 'string') {
            try {
              voices = JSON.parse(section.voices);
            } catch {
              voices = { en: section.voices };
            }
          } else if (section.voices && typeof section.voices === 'object') {
            voices = section.voices;
          }

          // Set up voice previews
          const voicePreviews: Record<string, string> = {};
          if (voices && typeof voices === 'object') {
            Object.entries(voices as Record<string, string>).forEach(([lang, voiceFile]) => {
              if (voiceFile) {
                voicePreviews[lang] = getImageUrl(voiceFile);
              }
            });
          }

          return {
            id: section.id,
            order: section.order,
            texts: texts as Record<string, string>,
            voices: voices as Record<string, string>,
            image: section.image || undefined,
            imagePreview: section.image ? getImageUrl(section.image) : null,
            voicePreviews,
          };
        });
        
        console.log("Setting sections for form:", sectionsForForm);
        setStorySections(sectionsForForm);
      } else {
        console.log("No sections found, initializing empty sections");
        setStorySections([]);
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
      setStoryData((prev) => ({ ...prev, category: categories[0].name }));
    }
  }, [categories, storyData.category, isEditing]);

  // Initialize story audio for new languages
  useEffect(() => {
    const updatedStoryAudio = { ...storyData.story_audio };

    storyData.languages.forEach((lang) => {
      if (!updatedStoryAudio[lang]) {
        updatedStoryAudio[lang] = "";
      }
    });

    if (JSON.stringify(updatedStoryAudio) !== JSON.stringify(storyData.story_audio)) {
      setStoryData((prev) => ({
        ...prev,
        story_audio: updatedStoryAudio,
      }));
    }
  }, [storyData.languages]);

  // Handle file input change for cover image
  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("New image file selected:", file.name, file.size);
      setCoverImageFile(file);

      // Create a preview
      const objectUrl = URL.createObjectURL(file);
      console.log("Created preview URL:", objectUrl);
      setCoverImagePreview(objectUrl);
    }
  };

  // Improved story audio file handling
  const handleStoryAudioChange = (language: string, file: File) => {
    setStoryAudioFiles((prev) => ({ ...prev, [language]: file }));
    setStoryAudioPreviews((prev) => ({
      ...prev,
      [language]: URL.createObjectURL(file),
    }));
  };

  const handleRemoveStoryAudio = (language: string) => {
    const newStoryAudioFiles = { ...storyAudioFiles };
    const newStoryAudioPreviews = { ...storyAudioPreviews };
    delete newStoryAudioFiles[language];
    delete newStoryAudioPreviews[language];
    setStoryAudioFiles(newStoryAudioFiles);
    setStoryAudioPreviews(newStoryAudioPreviews);
    setStoryData((prev) => ({
      ...prev,
      story_audio: {
        ...prev.story_audio,
        [language]: "",
      },
    }));
  };

  // Handle adding a new language
  const handleAddLanguage = (language: string) => {
    if (!storyData.languages.includes(language)) {
      const updatedLanguages = [...storyData.languages, language];
      const updatedStoryAudio = { ...storyData.story_audio, [language]: "" };

      setStoryData({
        ...storyData,
        languages: updatedLanguages,
        story_audio: updatedStoryAudio,
      });

      // Add language fields to all sections
      const updatedSections = storySections.map((section) => ({
        ...section,
        texts: {
          ...section.texts,
          [language]: "",
        },
        voices: {
          ...section.voices,
          [language]: "",
        },
      }));
      setStorySections(updatedSections);
    }
  };

  // Handle removing a language
  const handleRemoveLanguage = (language: string) => {
    const updatedLanguages = storyData.languages.filter((lang) => lang !== language);
    const updatedStoryAudio = { ...storyData.story_audio };
    delete updatedStoryAudio[language];

    setStoryData({
      ...storyData,
      languages: updatedLanguages,
      story_audio: updatedStoryAudio,
    });

    // Remove language fields from all sections
    const updatedSections = storySections.map((section) => {
      const newTexts = { ...section.texts };
      const newVoices = { ...section.voices };
      delete newTexts[language];
      delete newVoices[language];

      return {
        ...section,
        texts: newTexts,
        voices: newVoices,
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
    setStoryData((prev) => ({
      ...prev,
      title: {
        ...prev.title,
        [language]: value,
      },
    }));
  };

  const updateStoryDescription = (language: string, value: string) => {
    setStoryData((prev) => ({
      ...prev,
      description: {
        ...prev.description,
        [language]: value,
      },
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
      imagePreview: null,
    };

    setStorySections([...storySections, newSection]);
  };

  const deleteSection = (index: number) => {
    const updatedSections = storySections.filter((_, i) => i !== index);
    // Reorder sections
    const reorderedSections = updatedSections.map((section, idx) => ({
      ...section,
      order: idx + 1,
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

  // Improved section voice file handling
  const handleSectionVoiceChange = (sectionIndex: number, language: string, file: File) => {
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
  };

  const handleRemoveSectionVoice = (sectionIndex: number, language: string) => {
    const updatedSections = [...storySections];
    if (updatedSections[sectionIndex].voiceFiles) {
      delete updatedSections[sectionIndex].voiceFiles![language];
    }
    if (updatedSections[sectionIndex].voicePreviews) {
      delete updatedSections[sectionIndex].voicePreviews![language];
    }
    // Clear the voices field for this language
    updatedSections[sectionIndex].voices = {
      ...updatedSections[sectionIndex].voices,
      [language]: "",
    };
    setStorySections(updatedSections);
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
        console.log("Uploading image file:", coverImageFile.name, "Size:", coverImageFile.size);
        const filename = `cover-${Date.now()}-${coverImageFile.name}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("admin-content")
          .upload(`story-covers/${filename}`, coverImageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Upload error:", uploadError);
          throw uploadError;
        }

        console.log("Upload successful:", uploadData);
        coverImageUrl = filename;
        console.log("Storing filename in DB:", coverImageUrl);
      }

      // Upload story audio files if changed and in single story mode
      if (storyData.audio_mode === "single_story" && Object.keys(storyAudioFiles).length > 0) {
        const newStoryAudioUrls = { ...storyAudioUrls };

        for (const [language, audioFile] of Object.entries(storyAudioFiles)) {
          const filename = `story-audio-${Date.now()}-${language}-${audioFile.name}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("admin-content")
            .upload(`story-audio/${filename}`, audioFile, {
              cacheControl: "3600",
              upsert: false,
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
            story_audio: JSON.stringify(storyAudioUrls),
          })
          .select("id")
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
            story_audio: JSON.stringify(storyAudioUrls),
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
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) throw uploadError;
          sectionImageUrl = filename;
        } else if (typeof section.image === "string") {
          sectionImageUrl = section.image;
        }

        // Upload voice files only if in per_section mode
        const voiceUrls: Record<string, string> = { ...section.voices };
        if (storyData.audio_mode === "per_section" && section.voiceFiles) {
          for (const [language, voiceFile] of Object.entries(section.voiceFiles)) {
            const filename = `voice-${storyId}-${section.order}-${language}-${Date.now()}-${voiceFile.name}`;

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from("admin-content")
              .upload(`story-voices/${filename}`, voiceFile, {
                cacheControl: "3600",
                upsert: false,
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
            voices: storyData.audio_mode === "per_section" ? voiceUrls : {},
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
          <h1 className="text-3xl font-bold">
            {isEditing ? "Edit Story" : "Create New Story"}
          </h1>
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
            {/* Story Details Card - Updated for multilingual support with fixed tabs */}
            <Card>
              <CardHeader>
                <CardTitle>Story Details</CardTitle>
                <CardDescription>
                  Basic information about the story in multiple languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Multilingual Title and Description with Fixed Tabs */}
                <Tabs defaultValue="en" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="en">English</TabsTrigger>
                    <TabsTrigger value="ar">Arabic</TabsTrigger>
                    <TabsTrigger value="fr">French</TabsTrigger>
                  </TabsList>

                  <TabsContent value="en" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-en">Title (English)</Label>
                      <Input
                        id="title-en"
                        placeholder="Enter story title in English"
                        value={storyData.title.en || ""}
                        onChange={(e) => updateStoryTitle("en", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description-en">Description (English)</Label>
                      <Textarea
                        id="description-en"
                        placeholder="Enter story description in English"
                        value={storyData.description.en || ""}
                        onChange={(e) => updateStoryDescription("en", e.target.value)}
                        className="min-h-[100px]"
                        required
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="ar" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-ar">Title (Arabic)</Label>
                      <Input
                        id="title-ar"
                        placeholder="Enter story title in Arabic"
                        value={storyData.title.ar || ""}
                        onChange={(e) => updateStoryTitle("ar", e.target.value)}
                        dir="rtl"
                        className="text-right"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description-ar">Description (Arabic)</Label>
                      <Textarea
                        id="description-ar"
                        placeholder="Enter story description in Arabic"
                        value={storyData.description.ar || ""}
                        onChange={(e) => updateStoryDescription("ar", e.target.value)}
                        className="min-h-[100px] text-right"
                        dir="rtl"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="fr" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title-fr">Title (French)</Label>
                      <Input
                        id="title-fr"
                        placeholder="Enter story title in French"
                        value={storyData.title.fr || ""}
                        onChange={(e) => updateStoryTitle("fr", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description-fr">Description (French)</Label>
                      <Textarea
                        id="description-fr"
                        placeholder="Enter story description in French"
                        value={storyData.description.fr || ""}
                        onChange={(e) => updateStoryDescription("fr", e.target.value)}
                        className="min-h-[100px]"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={storyData.category}
                      onValueChange={(value) =>
                        setStoryData({ ...storyData, category: value })
                      }
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Categories</SelectLabel>
                          {categoriesLoading ? (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              Loading categories...
                            </div>
                          ) : categories && categories.length > 0 ? (
                            categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-2 py-1 text-sm text-muted-foreground">
                              No categories available
                            </div>
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
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="absolute top-2 right-2 h-6 w-6"
                            onClick={() => {
                              console.log("Clearing image preview");
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
                            Click to upload or
                            <br />
                            drag and drop
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
                        onChange={(e) =>
                          setStoryData({
                            ...storyData,
                            duration: parseInt(e.target.value) || 5,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-free">Free Story</Label>
                      <Switch
                        id="is-free"
                        checked={storyData.is_free}
                        onCheckedChange={(checked) =>
                          setStoryData({ ...storyData, is_free: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="is-published">Published</Label>
                      <Switch
                        id="is-published"
                        checked={storyData.is_published}
                        onCheckedChange={(checked) =>
                          setStoryData({ ...storyData, is_published: checked })
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Languages Card */}
            <Card>
              <CardHeader>
                <CardTitle>Section Languages</CardTitle>
                <CardDescription>
                  Manage available languages for story sections
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {storyData.languages.map((language) => {
                    const langOption = languages?.find((opt) => opt.code === language);
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
                          <div className="px-2 py-1 text-sm text-muted-foreground">
                            Loading languages...
                          </div>
                        ) : languages && languages.length > 0 ? (
                          languages.map((language) => (
                            <SelectItem
                              key={language.id}
                              value={language.code}
                              disabled={storyData.languages.includes(language.code)}
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
                    <Plus className="h-4 w-4 mr-1" /> Add Language
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Audio Settings Card */}
            <Card>
              <CardHeader>
                <CardTitle>Audio Settings</CardTitle>
                <CardDescription>
                  Configure how audio is handled for this story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="audio-mode" className="text-base font-medium">
                      Audio Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Choose between single audio for the whole story or separate audio for each section
                    </p>
                  </div>
                  <Switch
                    id="audio-mode"
                    checked={storyData.audio_mode === "single_story"}
                    onCheckedChange={(checked) =>
                      setStoryData({
                        ...storyData,
                        audio_mode: checked ? "single_story" : "per_section",
                      })
                    }
                  />
                </div>

                <div className="text-sm text-muted-foreground">
                  Mode:{" "}
                  <span className="font-medium">
                    {storyData.audio_mode === "single_story"
                      ? "Single audio for whole story"
                      : "Audio per section"}
                  </span>
                </div>

                {/* Single Story Audio Upload - Now per language using new component */}
                {storyData.audio_mode === "single_story" && (
                  <div className="space-y-4">
                    <Label>Story Audio (Per Language)</Label>
                    <Tabs defaultValue={storyData.languages[0]} className="w-full">
                      <TabsList>
                        {storyData.languages.map((lang) => {
                          const langOption = languages?.find((opt) => opt.code === lang);
                          return (
                            <TabsTrigger key={lang} value={lang}>
                              {langOption?.name || lang}
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>
                      {storyData.languages.map((lang) => {
                        const langOption = languages?.find((opt) => opt.code === lang);
                        return (
                          <TabsContent key={lang} value={lang}>
                            <StoryAudioUpload
                              language={lang}
                              languageName={langOption?.name || lang}
                              storyAudioFiles={storyAudioFiles}
                              storyAudioPreviews={storyAudioPreviews}
                              existingStoryAudio={storyData.story_audio}
                              onStoryAudioChange={handleStoryAudioChange}
                              onRemoveStoryAudio={handleRemoveStoryAudio}
                            />
                          </TabsContent>
                        );
                      })}
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Story Sections Card */}
            <Card>
              <CardHeader>
                <CardTitle>Story Sections</CardTitle>
                <CardDescription>
                  Create sections with text, audio, and images for each language
                </CardDescription>
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
                            <span
                              role="button"
                              className="rounded-xl border bg-red-500 p-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSection(sectionIndex);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </span>
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
                                    <p className="text-xs text-muted-foreground text-center">
                                      Upload Image
                                    </p>
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
                                {storyData.languages.map((lang) => {
                                  const langOption = languages?.find((opt) => opt.code === lang);
                                  return (
                                    <TabsTrigger key={lang} value={lang}>
                                      {langOption?.name || lang}
                                    </TabsTrigger>
                                  );
                                })}
                              </TabsList>
                              {storyData.languages.map((lang) => {
                                const langOption = languages?.find((opt) => opt.code === lang);
                                return (
                                  <TabsContent key={lang} value={lang} className="space-y-4">
                                    {/* Text content */}
                                    <div className="space-y-2">
                                      <Label>Text Content ({langOption?.name || lang})</Label>
                                      <Textarea
                                        placeholder={`Enter section text in ${lang}`}
                                        value={section.texts[lang] || ""}
                                        onChange={(e) =>
                                          updateSectionText(sectionIndex, lang, e.target.value)
                                        }
                                        className="min-h-[120px]"
                                      />
                                    </div>

                                    {/* Voice upload - only show if in per_section mode, now using new component */}
                                    {storyData.audio_mode === "per_section" && (
                                      <VoiceFileUpload
                                        language={lang}
                                        languageName={langOption?.name || lang}
                                        sectionIndex={sectionIndex}
                                        voiceFiles={section.voiceFiles}
                                        voicePreviews={section.voicePreviews}
                                        existingVoiceUrls={section.voices}
                                        onVoiceFileChange={handleSectionVoiceChange}
                                        onRemoveVoiceFile={handleRemoveSectionVoice}
                                      />
                                    )}
                                  </TabsContent>
                                );
                              })}
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
            <Button type="submit" disabled={isSubmitting || !storyData.title.en}>
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
