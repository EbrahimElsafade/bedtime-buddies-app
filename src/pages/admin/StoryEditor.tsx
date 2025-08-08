import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { v4 as uuidv4 } from 'uuid';

import { Story, StorySection } from '@/types/story';
import { languages } from '@/constants/languages';
import { getImageUrl, getAudioUrl } from '@/utils/imageUtils';
import { getMultilingualText } from '@/utils/multilingualUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Card, CardContent } from "@/components/ui/card"
import { Upload } from 'lucide-react';

import { StoryAudioUpload } from '@/components/admin/StoryAudioUpload';
import { VoiceFileUpload } from '@/components/admin/VoiceFileUpload';
import { sanitizeFilename, generateSafeFilename } from '@/utils/fileUtils';

const formSchema = z.object({
  title: z.record(z.string()).optional(),
  description: z.record(z.string()).optional(),
  category: z.string().min(2, {
    message: "Category must be at least 2 characters.",
  }),
  is_free: z.boolean().default(false),
  is_published: z.boolean().default(false),
  audio_mode: z.enum(["per_section", "single_story"]).default("per_section"),
});

const StoryEditor = () => {
  const [storyDetails, setStoryDetails] = useState<Story | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string>('');
	const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [sectionImages, setSectionImages] = useState<Record<string, string>>({}); // sectionId: imageURL
  const [sectionImageFiles, setSectionImageFiles] = useState<Record<string, File>>({}); // sectionId: imageFile
  const [voiceFiles, setVoiceFiles] = useState<Record<string, File> | undefined>({}); // sectionIndex: { language: File }
  const [voicePreviews, setVoicePreviews] = useState<Record<string, string> | undefined>({}); // sectionIndex: { language: URL }
  const [existingVoiceUrls, setExistingVoiceUrls] = useState<Record<string, string> | undefined>({}); // sectionIndex: { language: URL }
  const [storyAudioFiles, setStoryAudioFiles] = useState<Record<string, File>>({}); // language: File
  const [storyAudioPreviews, setStoryAudioPreviews] = useState<Record<string, string>>({}); // language: URL
  const [existingStoryAudio, setExistingStoryAudio] = useState<Record<string, string>>({}); // language: URL
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: {},
      description: {},
      category: "",
      is_free: false,
      is_published: false,
      audio_mode: "per_section",
    },
  });

  useEffect(() => {
    if (storyId) {
      fetchStoryDetails(storyId);
    }
  }, [storyId]);

  useEffect(() => {
    if (storyDetails?.cover_image) {
      setCoverImagePreview(getImageUrl(storyDetails.cover_image));
    }
  }, [storyDetails?.cover_image]);

  const fetchStoryDetails = async (storyId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('id', storyId)
        .single();

      if (error) {
        console.error('Error fetching story details:', error);
        toast({
          title: "Error",
          description: "Failed to load story details.",
          variant: "destructive",
        });
      }

      if (data) {
        setStoryDetails(data as Story);
        form.reset({
          title: data.title,
          description: data.description,
          category: data.category,
          is_free: data.is_free,
          is_published: data.is_published,
          audio_mode: data.audio_mode,
        });

        // Load existing section images
        const initialSectionImages: Record<string, string> = {};
        data.sections.forEach(section => {
          if (section.image) {
            initialSectionImages[section.id] = getImageUrl(section.image);
          }
        });
        setSectionImages(initialSectionImages);

        // Load existing voice URLs
        const initialVoiceUrls: Record<string, string> = {};
        data.sections.forEach((section, sectionIndex) => {
          if (section.voices) {
            Object.entries(section.voices).forEach(([language, voicePath]) => {
              if (!initialVoiceUrls[sectionIndex]) {
                initialVoiceUrls[sectionIndex] = {};
              }
              initialVoiceUrls[sectionIndex] = {
                ...initialVoiceUrls[sectionIndex],
                [language]: getAudioUrl(voicePath)
              };
            });
          }
        });
        setExistingVoiceUrls(initialVoiceUrls);

        // Load existing story audio URLs
        const initialStoryAudio: Record<string, string> = {};
        if (data.story_audio) {
          Object.entries(data.story_audio).forEach(([language, audioPath]) => {
            initialStoryAudio[language] = getAudioUrl(audioPath);
          });
        }
        setExistingStoryAudio(initialStoryAudio);
      }
    } catch (error) {
      console.error('Failed to fetch story details:', error);
      toast({
        title: "Error",
        description: "Failed to load story details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      if (!storyId && !coverImageFile) {
        toast({
          title: "Error",
          description: "Please upload a cover image for new stories.",
          variant: "destructive",
        });
        return;
      }

      // 1. Upload cover image if it's a new story or the image has changed
      let coverImagePath = storyDetails?.cover_image;
      if (coverImageFile) {
        coverImagePath = await uploadCoverImage(coverImageFile);
      }

      // 2. Create or update story details
      const storyData = {
        ...data,
        cover_image: coverImagePath,
        languages: Object.keys(data.title || {}), // Assuming title contains all languages
      };

      let storyResult;
      if (storyId) {
        const { data, error } = await supabase
          .from('stories')
          .update(storyData)
          .eq('id', storyId)
          .select()
          .single();

        if (error) {
          console.error('Failed to update story:', error);
          throw error;
        }
        storyResult = data;
      } else {
        const { data, error } = await supabase
          .from('stories')
          .insert(storyData)
          .select()
          .single();

        if (error) {
          console.error('Failed to create story:', error);
          throw error;
        }
        storyResult = data;
      }

      if (!storyResult) {
        throw new Error("Failed to create or update story.");
      }

      // 3. Handle story audio uploads
      const storyAudioPaths: Record<string, string> = {};
      for (const language in storyAudioFiles) {
        const file = storyAudioFiles[language];
        const audioPath = await uploadStoryAudio(file, language);
        storyAudioPaths[language] = audioPath;
      }

      // Update story with audio paths
      if (Object.keys(storyAudioPaths).length > 0) {
        const { error } = await supabase
          .from('stories')
          .update({ story_audio: storyAudioPaths })
          .eq('id', storyResult.id);

        if (error) {
          console.error('Failed to update story audio:', error);
          throw error;
        }
      }

      // 4. If it's a new story, update the story ID in the section images and voice files
      let updatedSectionImages = { ...sectionImages };
      let updatedVoiceFiles = { ...voiceFiles };
      if (!storyId) {
        // Update section images and voice files with the new story ID
        updatedSectionImages = Object.keys(sectionImages).reduce((acc: Record<string, string>, key) => {
          const newKey = uuidv4(); // Generate new UUIDs for new sections
          acc[newKey] = sectionImages[key];
          return acc;
        }, {});
        
        if (voiceFiles) {
          updatedVoiceFiles = Object.keys(voiceFiles).reduce((acc: Record<string, File>, key) => {
            const newKey = uuidv4(); // Generate new UUIDs for new sections
            acc[newKey] = voiceFiles[key];
            return acc;
          }, {});
        }
      }

      // 5. Handle sections (create, update, delete)
      if (storyResult.id) {
        // Fetch existing sections to compare and update/delete
        const { data: existingSections, error: fetchError } = await supabase
          .from('story_sections')
          .select('*')
          .eq('story_id', storyResult.id);

        if (fetchError) {
          console.error('Failed to fetch existing sections:', fetchError);
          throw fetchError;
        }

        // Prepare section data for update/insert
        const sectionUpdates = await Promise.all(
          Object.keys(updatedSectionImages).map(async (sectionId, sectionIndex) => {
            const sectionImage = updatedSectionImages[sectionId];
            const section = storyDetails?.sections?.find(s => s.id === sectionId) || {
              id: uuidv4(),
              order: sectionIndex + 1,
              texts: {},
              voices: {},
              image: '',
            };

            // Upload section image if it's a new file
            let sectionImagePath = section.image;
            if (sectionImageFiles[sectionId]) {
              sectionImagePath = await uploadSectionImage(sectionImageFiles[sectionId], sectionId);
            }

            // Upload voice files
            const sectionVoicePaths: Record<string, string> = {};
            if (voiceFiles && voiceFiles[sectionIndex]) {
              for (const language in voiceFiles[sectionIndex]) {
                const file = voiceFiles[sectionIndex][language];
                const voicePath = await uploadVoiceFile(file, language, sectionIndex);
                sectionVoicePaths[language] = voicePath;
              }
            }

            return {
              ...section,
              id: sectionId,
              story_id: storyResult.id,
              order: sectionIndex + 1,
              image: sectionImagePath,
              voices: sectionVoicePaths,
            };
          })
        );

        // Update or insert sections
        for (const sectionData of sectionUpdates) {
          const existingSection = existingSections?.find(s => s.id === sectionData.id);
          if (existingSection) {
            // Update existing section
            const { error: updateError } = await supabase
              .from('story_sections')
              .update(sectionData)
              .eq('id', sectionData.id);

            if (updateError) {
              console.error('Failed to update section:', updateError);
              throw updateError;
            }
          } else {
            // Insert new section
            const { error: insertError } = await supabase
              .from('story_sections')
              .insert(sectionData);

            if (insertError) {
              console.error('Failed to insert section:', insertError);
              throw insertError;
            }
          }
        }

        // Delete removed sections
        if (existingSections) {
          const updatedSectionIds = sectionUpdates.map(s => s.id);
          const sectionsToDelete = existingSections.filter(s => !updatedSectionIds.includes(s.id));

          for (const sectionToDelete of sectionsToDelete) {
            const { error: deleteError } = await supabase
              .from('story_sections')
              .delete()
              .eq('id', sectionToDelete.id);

            if (deleteError) {
              console.error('Failed to delete section:', deleteError);
              throw deleteError;
            }
          }
        }
      }

      toast({
        title: "Success",
        description: storyId ? "Story updated successfully!" : "Story created successfully!",
      });
      navigate('/admin/stories');
    } catch (error) {
      console.error('Failed to create story:', error);
      toast({
        title: "Error",
        description: "Failed to create story. Please check the form and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const uploadCoverImage = async (file: File): Promise<string> => {
    try {
      console.log('Uploading cover image:', file.name);
      const timestamp = Date.now();
      const safeFilename = generateSafeFilename(file.name, `cover-${storyDetails?.id || 'new'}-${timestamp}-`);
      console.log('Safe filename generated:', safeFilename);

      const { data, error } = await supabase.storage
        .from('admin-content')
        .upload(`story-covers/${safeFilename}`, file);

      if (error) {
        console.error('Cover image upload error:', error);
        throw error;
      }

      console.log('Cover image uploaded successfully:', data.path);
      return data.path;
    } catch (error) {
      console.error('Failed to upload cover image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload cover image. Please check the filename and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadSectionImage = async (file: File, sectionId: string): Promise<string> => {
    try {
      console.log('Uploading section image:', { file: file.name, sectionId });
      const timestamp = Date.now();
      const safeFilename = generateSafeFilename(file.name, `section-${storyDetails?.id || 'new'}-${sectionId}-${timestamp}-`);
      console.log('Safe filename generated:', safeFilename);

      const { data, error } = await supabase.storage
        .from('admin-content')
        .upload(`story-sections/${safeFilename}`, file);

      if (error) {
        console.error('Section image upload error:', error);
        throw error;
      }

      console.log('Section image uploaded successfully:', data.path);
      return data.path;
    } catch (error) {
      console.error('Failed to upload section image:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload section image. Please check the filename and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadVoiceFile = async (file: File, language: string, sectionIndex: number): Promise<string> => {
    try {
      console.log('Uploading voice file:', { file: file.name, language, sectionIndex });
      
      // Generate a safe filename
      const timestamp = Date.now();
      const safeFilename = generateSafeFilename(
        file.name,
        `voice-${storyDetails?.id || 'new'}-${sectionIndex}-${language}-${timestamp}-`
      );
      
      console.log('Safe filename generated:', safeFilename);
      
      const { data, error } = await supabase.storage
        .from('admin-content')
        .upload(`story-voices/${safeFilename}`, file);

      if (error) {
        console.error('Voice upload error:', error);
        throw error;
      }

      console.log('Voice file uploaded successfully:', data.path);
      return data.path;
    } catch (error) {
      console.error('Failed to upload voice file:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload voice file. Please check the filename and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadStoryAudio = async (file: File, language: string): Promise<string> => {
    try {
      console.log('Uploading story audio:', { file: file.name, language });
      
      // Generate a safe filename
      const timestamp = Date.now();
      const safeFilename = generateSafeFilename(
        file.name,
        `audio-${storyDetails?.id || 'new'}-${language}-${timestamp}-`
      );
      
      console.log('Safe story audio filename generated:', safeFilename);
      
      const { data, error } = await supabase.storage
        .from('admin-content')
        .upload(`story-audio/${safeFilename}`, file);

      if (error) {
        console.error('Story audio upload error:', error);
        throw error;
      }

      console.log('Story audio uploaded successfully:', data.path);
      return data.path;
    } catch (error) {
      console.error('Failed to upload story audio:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload story audio. Please check the filename and try again.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const handleCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
			setCoverImageFile(file);
      setCoverImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSectionImageChange = (sectionId: string, file: File) => {
    setSectionImageFiles(prev => ({ ...prev, [sectionId]: file }));
    setSectionImages(prev => ({ ...prev, [sectionId]: URL.createObjectURL(file) }));
  };

  const handleRemoveSectionImage = (sectionId: string) => {
    setSectionImageFiles(prev => {
      const { [sectionId]: removed, ...rest } = prev;
      return rest;
    });
    setSectionImages(prev => {
      const { [sectionId]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleVoiceFileChange = (sectionIndex: number, language: string, file: File) => {
    setVoiceFiles(prev => ({
      ...prev,
      [sectionIndex]: {
        ...prev?.[sectionIndex],
        [language]: file,
      },
    }));
    setVoicePreviews(prev => ({
      ...prev,
      [sectionIndex]: {
        ...prev?.[sectionIndex],
        [language]: URL.createObjectURL(file),
      },
    }));
  };

  const handleRemoveVoiceFile = (sectionIndex: number, language: string) => {
    setVoiceFiles(prev => {
      const updatedSection = { ...prev?.[sectionIndex] };
      delete updatedSection[language];
      
      const updatedVoiceFiles = { ...prev };
      if (Object.keys(updatedSection).length === 0) {
        delete updatedVoiceFiles[sectionIndex];
      } else {
        updatedVoiceFiles[sectionIndex] = updatedSection;
      }
      
      return updatedVoiceFiles;
    });
    setVoicePreviews(prev => {
      const updatedSection = { ...prev?.[sectionIndex] };
      delete updatedSection[language];
      
      const updatedVoicePreviews = { ...prev };
      if (Object.keys(updatedSection).length === 0) {
        delete updatedVoicePreviews[sectionIndex];
      } else {
        updatedVoicePreviews[sectionIndex] = updatedSection;
      }
      
      return updatedVoicePreviews;
    });
  };

  const handleStoryAudioChange = (language: string, file: File) => {
    setStoryAudioFiles(prev => ({ ...prev, [language]: file }));
    setStoryAudioPreviews(prev => ({ ...prev, [language]: URL.createObjectURL(file) }));
  };

  const handleRemoveStoryAudio = (language: string) => {
    setStoryAudioFiles(prev => {
      const { [language]: removed, ...rest } = prev;
      return rest;
    });
    setStoryAudioPreviews(prev => {
      const { [language]: removed, ...rest } = prev;
      return rest;
    });
  };

  const handleAddSection = () => {
    const newSectionId = uuidv4();
    setSectionImages(prev => ({ ...prev, [newSectionId]: '' }));
    setIsDrawerOpen(true);
    setSelectedSectionIndex(Object.keys(sectionImages).length);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedSectionIndex(null);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-semibold mb-5">{storyId ? 'Edit Story' : 'Create Story'}</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Cover Image */}
        <div>
          <Label>Cover Image</Label>
          <div className="flex items-center mt-2">
            {coverImagePreview && (
              <img
                src={coverImagePreview}
                alt="Cover Preview"
                className="w-32 h-32 object-cover rounded-md mr-4"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={handleCoverImageChange}
              className="text-sm"
            />
          </div>
        </div>

        {/* Title and Description */}
        {languages.map(lang => (
          <div key={lang.code} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`title-${lang.code}`}>Title ({lang.name})</Label>
              <Controller
                name={`title.${lang.code}`}
                control={form.control}
                defaultValue={storyDetails?.title?.[lang.code] || ""}
                render={({ field }) => (
                  <Input id={`title-${lang.code}`} {...field} />
                )}
              />
            </div>
            <div>
              <Label htmlFor={`description-${lang.code}`}>Description ({lang.name})</Label>
              <Controller
                name={`description.${lang.code}`}
                control={form.control}
                defaultValue={storyDetails?.description?.[lang.code] || ""}
                render={({ field }) => (
                  <Textarea id={`description-${lang.code}`} {...field} className="h-24" />
                )}
              />
            </div>
          </div>
        ))}

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Controller
            name="category"
            control={form.control}
            defaultValue={storyDetails?.category || ""}
            render={({ field }) => (
              <Input id="category" {...field} />
            )}
          />
        </div>

        {/* Is Free and Is Published */}
        <div className="flex items-center space-x-4">
          <div>
            <Label htmlFor="is_free">Is Free</Label>
            <Controller
              name="is_free"
              control={form.control}
              defaultValue={storyDetails?.is_free || false}
              render={({ field }) => (
                <Switch id="is_free" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
          <div>
            <Label htmlFor="is_published">Is Published</Label>
            <Controller
              name="is_published"
              control={form.control}
              defaultValue={storyDetails?.is_published || false}
              render={({ field }) => (
                <Switch id="is_published" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </div>

        {/* Audio Mode */}
        <div>
          <Label htmlFor="audio_mode">Audio Mode</Label>
          <Controller
            name="audio_mode"
            control={form.control}
            defaultValue={storyDetails?.audio_mode || "per_section"}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_section">Per Section</SelectItem>
                  <SelectItem value="single_story">Single Story</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Story Audio Upload */}
        {form.getValues("audio_mode") === "single_story" && (
          <div>
            <Separator className="my-4" />
            <h3 className="text-xl font-semibold mb-2">Story Audio</h3>
            {languages.map(lang => (
              <StoryAudioUpload
                key={lang.code}
                language={lang.code}
                languageName={lang.name}
                storyAudioFiles={storyAudioFiles}
                storyAudioPreviews={storyAudioPreviews}
                existingStoryAudio={existingStoryAudio}
                onStoryAudioChange={handleStoryAudioChange}
                onRemoveStoryAudio={handleRemoveStoryAudio}
              />
            ))}
          </div>
        )}

        {/* Story Sections */}
        <div>
          <Separator className="my-4" />
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-xl font-semibold">Story Sections</h3>
            <Button type="button" variant="outline" size="sm" onClick={handleAddSection}>
              Add Section
            </Button>
          </div>
          <Accordion type="multiple" collapsible>
            {storyDetails?.sections && Object.keys(sectionImages).map((sectionId, sectionIndex) => {
              const section = storyDetails.sections.find(s => s.id === sectionId) || {
                id: uuidv4(),
                order: sectionIndex + 1,
                texts: {},
                voices: {},
                image: '',
              };

              return (
                <AccordionItem value={`section-${sectionId}`} key={sectionId}>
                  <AccordionTrigger>
                    Section {sectionIndex + 1}
                  </AccordionTrigger>
                  <AccordionContent>
                    <Card>
                      <CardContent className="space-y-4">
                        {/* Section Image */}
                        <div>
                          <Label>Section Image</Label>
                          <div className="flex items-center mt-2">
                            {sectionImages[sectionId] ? (
                              <img
                                src={sectionImages[sectionId]}
                                alt={`Section ${sectionIndex + 1} Preview`}
                                className="w-32 h-32 object-cover rounded-md mr-4"
                              />
                            ) : null}
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                  handleSectionImageChange(sectionId, e.target.files[0]);
                                }
                              }}
                              className="text-sm"
                            />
                            {sectionImages[sectionId] && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveSectionImage(sectionId)}
                                className="ml-2"
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Section Text (Multilingual) */}
                        {languages.map(lang => (
                          <div key={lang.code}>
                            <Label htmlFor={`section-text-${lang.code}-${sectionId}`}>
                              Text ({lang.name})
                            </Label>
                            <Textarea
                              id={`section-text-${lang.code}-${sectionId}`}
                              defaultValue={section.texts[lang.code] || ""}
                              className="h-24"
                            />
                          </div>
                        ))}

                        {/* Voice Upload (Multilingual) */}
                        {form.getValues("audio_mode") === "per_section" && (
                          <div>
                            {languages.map(lang => (
                              <VoiceFileUpload
                                key={lang.code}
                                language={lang.code}
                                languageName={lang.name}
                                sectionIndex={sectionIndex}
                                voiceFiles={voiceFiles?.[sectionIndex]}
                                voicePreviews={voicePreviews?.[sectionIndex]}
                                existingVoiceUrls={existingVoiceUrls?.[sectionIndex]}
                                onVoiceFileChange={handleVoiceFileChange}
                                onRemoveVoiceFile={handleRemoveVoiceFile}
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <Button type="submit" size="lg" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

export default StoryEditor;
