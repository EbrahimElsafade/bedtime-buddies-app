
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useFavorites = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user's favorites
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("user_favorites")
        .select(`
          id,
          story_id,
          created_at,
          stories (
            id,
            title,
            description,
            cover_image,
            duration,
            is_free,
            category
          )
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching favorites:", error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  // Add to favorites
  const addToFavoritesMutation = useMutation({
    mutationFn: async (storyId: string) => {
      if (!user) throw new Error("User not authenticated");
      
      const { data, error } = await supabase
        .from("user_favorites")
        .insert({
          user_id: user.id,
          story_id: storyId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success("Added to favorites");
    },
    onError: (error: any) => {
      if (error.code === "23505") {
        toast.error("Story is already in your favorites");
      } else {
        toast.error("Failed to add to favorites");
      }
    },
  });

  // Remove from favorites
  const removeFromFavoritesMutation = useMutation({
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
      queryClient.invalidateQueries({ queryKey: ["favorites", user?.id] });
      toast.success("Removed from favorites");
    },
    onError: () => {
      toast.error("Failed to remove from favorites");
    },
  });

  // Check if story is favorite
  const isFavorite = (storyId: string) => {
    return favorites.some(fav => fav.story_id === storyId);
  };

  const toggleFavorite = (storyId: string) => {
    if (isFavorite(storyId)) {
      removeFromFavoritesMutation.mutate(storyId);
    } else {
      addToFavoritesMutation.mutate(storyId);
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    toggleFavorite,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
  };
};
