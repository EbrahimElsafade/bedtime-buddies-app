
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getImageUrl } from "@/utils/imageUtils";
import { Story as StoryType, StorySection } from "@/types/story";
import { Json } from "@/integrations/supabase/types";

export const useStoryData = (storyId: string | undefined) => {
  return useQuery({
    queryKey: ["story", storyId],
    queryFn: async (): Promise<StoryType> => {
      if (!storyId) throw new Error("Story ID is required");
      
      // Fetch story details
      const { data: storyData, error: storyError } = await supabase
        .from("stories")
        .select("*")
        .eq("id", storyId)
        .eq("is_published", true)
        .single();
      
      if (storyError) {
        console.error("Error fetching story:", storyError);
        throw storyError;
      }

      // Fetch story sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("story_sections")
        .select("*")
        .eq("story_id", storyId)
        .order("order", { ascending: true });
      
      if (sectionsError) {
        console.error("Error fetching sections:", sectionsError);
        throw sectionsError;
      }

      // Transform sections to match our interface
      const sections: StorySection[] = sectionsData?.map(section => ({
        id: section.id,
        order: section.order,
        texts: section.texts as Record<string, string>,
        voices: section.voices as Record<string, string> | undefined,
        image: section.image || undefined
      })) || [];

      // Transform multilingual title and description to Record<string, string>
      const parseMultilingualField = (field: any): Record<string, string> => {
        // If it's already an object (proper JSON), return it
        if (typeof field === 'object' && field !== null && !Array.isArray(field)) {
          return field as Record<string, string>;
        }
        
        // If it's a string, try to parse it
        if (typeof field === 'string') {
          try {
            const parsed = JSON.parse(field);
            if (typeof parsed === 'object' && parsed !== null) {
              return parsed as Record<string, string>;
            }
            // If parsing results in a non-object, treat as English
            return { en: field };
          } catch {
            // If parsing fails, treat as English text
            return { en: field };
          }
        }
        
        // Default fallback
        return {} as Record<string, string>;
      };

      const title = parseMultilingualField(storyData.title);
      const description = parseMultilingualField(storyData.description);

      // Transform multilingual story audio - parse JSON if it's a string
      const storyAudio = (() => {
        if (typeof storyData.story_audio === 'string') {
          try {
            return JSON.parse(storyData.story_audio) as Record<string, string>;
          } catch {
            // If parsing fails, treat as single language audio
            return { en: storyData.story_audio };
          }
        } else if (storyData.story_audio && typeof storyData.story_audio === 'object') {
          return storyData.story_audio as Record<string, string>;
        }
        return null;
      })();

      return {
        ...storyData,
        title,
        description,
        story_audio: storyAudio,
        audio_mode: (storyData.audio_mode || "per_section") as "per_section" | "single_story",
        sections
      };
    },
    enabled: !!storyId
  });
};
