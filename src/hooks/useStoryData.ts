
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
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
        logger.error("Error fetching story:", storyError);
        throw storyError;
      }

      // Fetch story sections
      const { data: sectionsData, error: sectionsError } = await supabase
        .from("story_sections")
        .select("*")
        .eq("story_id", storyId)
        .order("order", { ascending: true });
      
      if (sectionsError) {
        logger.error("Error fetching sections:", sectionsError);
        throw sectionsError;
      }

      // Transform sections to match our interface
      const sections: StorySection[] = sectionsData?.map(section => ({
        id: section.id,
        order: section.order,
        texts: section.texts as Record<string, string>,
        voices: section.voices as Record<string, string> | undefined,
        image: section.image || undefined,
        video: section.video || undefined
      })) || [];

      // Transform multilingual title and description to Record<string, string>
      const title = (() => {
        if (typeof storyData.title === 'string') {
          try {
            return JSON.parse(storyData.title) as Record<string, string>;
          } catch {
            return { en: storyData.title };
          }
        } else if (storyData.title && typeof storyData.title === 'object') {
          return storyData.title as Record<string, string>;
        }
        return {} as Record<string, string>;
      })();

      const description = (() => {
        if (typeof storyData.description === 'string') {
          try {
            return JSON.parse(storyData.description) as Record<string, string>;
          } catch {
            return { en: storyData.description };
          }
        } else if (storyData.description && typeof storyData.description === 'object') {
          return storyData.description as Record<string, string>;
        }
        return {} as Record<string, string>;
      })();

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
