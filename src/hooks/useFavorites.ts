import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Story } from "@/types/story";
import { Course } from "@/types/course";
import { useToast } from "@/hooks/use-toast";

export const useStoryFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["story-favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: favoritesData, error: favError } = await supabase
        .from("user_favorites")
        .select("story_id, created_at")
        .eq("user_id", user.id);

      if (favError) throw favError;
      if (!favoritesData || favoritesData.length === 0) return [];

      const storyIds = favoritesData.map((f) => f.story_id);
      const { data: storiesData, error: storiesError } = await supabase
        .from("stories")
        .select("*")
        .in("id", storyIds)
        .eq("is_published", true);

      if (storiesError) throw storiesError;
      
      return (storiesData || []).map(story => {
        return {
          ...story,
          title: typeof story.title === 'string' ? JSON.parse(story.title) : story.title,
          description: typeof story.description === 'string' ? JSON.parse(story.description) : story.description,
          story_audio: story.story_audio ? (typeof story.story_audio === 'string' ? JSON.parse(story.story_audio) : story.story_audio) : null,
          audio_mode: (story.audio_mode || "per_section") as "per_section" | "single_story",
          sections: []
        };
      }) as Story[];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("user_favorites")
        .insert({ user_id: user.id, story_id: storyId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-favorites", user?.id] });
      toast({ description: "Added to favorites" });
    },
    onError: () => {
      toast({ description: "Failed to add favorite", variant: "destructive" });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("user_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("story_id", storyId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["story-favorites", user?.id] });
      toast({ description: "Removed from favorites" });
    },
    onError: () => {
      toast({ description: "Failed to remove favorite", variant: "destructive" });
    },
  });

  const isFavorite = (storyId: string) => {
    return favorites.some((story) => story.id === storyId);
  };

  return {
    favorites,
    isLoading,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    isFavorite,
  };
};

export const useCourseFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["course-favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: favoritesData, error: favError } = await supabase
        .from("course_favorites")
        .select("course_id, created_at")
        .eq("user_id", user.id);

      if (favError) throw favError;
      if (!favoritesData || favoritesData.length === 0) return [];

      const courseIds = favoritesData.map((f) => f.course_id);
      const { data: coursesData, error: coursesError } = await supabase
        .from("courses")
        .select("*")
        .in("id", courseIds)
        .eq("is_published", true);

      if (coursesError) throw coursesError;
      
      return (coursesData || []).map(course => {
        return {
          id: course.id,
          title: course.title_en || '',
          title_en: course.title_en || '',
          title_ar: course.title_ar || '',
          title_fr: course.title_fr || '',
          description: course.description_en || '',
          description_en: course.description_en || '',
          description_ar: course.description_ar || '',
          description_fr: course.description_fr || '',
          category: course.category,
          cover_image: course.cover_image,
          coverImagePath: course.cover_image,
          languages: course.languages || [],
          minAge: course.min_age || 0,
          maxAge: course.max_age || 0,
          duration: 0,
          lessons: course.lessons || 0,
          learningObjectives: course.learning_objectives_en || [],
          is_free: course.is_free,
          isFree: course.is_free,
          isFeatured: false,
          is_published: course.is_published,
          createdAt: course.created_at || '',
          instructor: course.instructor_name_en ? {
            name_en: course.instructor_name_en || '',
            name_ar: course.instructor_name_ar || '',
            name_fr: course.instructor_name_fr || '',
            bio_en: course.instructor_bio_en || '',
            bio_ar: course.instructor_bio_ar || '',
            bio_fr: course.instructor_bio_fr || '',
            avatar: course.instructor_avatar,
            expertise: course.instructor_expertise || [],
          } : undefined,
        };
      }) as Course[];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("course_favorites")
        .insert({ user_id: user.id, course_id: courseId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-favorites", user?.id] });
      toast({ description: "Added to favorites" });
    },
    onError: () => {
      toast({ description: "Failed to add favorite", variant: "destructive" });
    },
  });

  const removeFavorite = useMutation({
    mutationFn: async (courseId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { error } = await supabase
        .from("course_favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("course_id", courseId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-favorites", user?.id] });
      toast({ description: "Removed from favorites" });
    },
    onError: () => {
      toast({ description: "Failed to remove favorite", variant: "destructive" });
    },
  });

  const isFavorite = (courseId: string) => {
    return favorites.some((course) => course.id === courseId);
  };

  return {
    favorites,
    isLoading,
    addFavorite: addFavorite.mutate,
    removeFavorite: removeFavorite.mutate,
    isFavorite,
  };
};
