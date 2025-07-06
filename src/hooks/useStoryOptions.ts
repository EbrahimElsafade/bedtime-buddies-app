
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type StoryCategory = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type StoryLanguage = {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export const useStoryOptions = () => {
  const categoriesQuery = useQuery({
    queryKey: ['story-categories'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('story_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StoryCategory[];
    }
  });

  const languagesQuery = useQuery({
    queryKey: ['story-languages'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('story_languages')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as StoryLanguage[];
    }
  });

  return {
    categories: categoriesQuery.data || [],
    languages: languagesQuery.data || [],
    isLoadingCategories: categoriesQuery.isLoading,
    isLoadingLanguages: languagesQuery.isLoading,
    categoriesError: categoriesQuery.error,
    languagesError: languagesQuery.error,
  };
};
