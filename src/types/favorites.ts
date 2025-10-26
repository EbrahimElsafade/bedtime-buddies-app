export interface FavoriteStory {
  id: string
  title: Record<string, string>
  description: Record<string, string>
  cover_image: string
  is_free: boolean
  duration: number
  category: string
}

export interface FavoriteCourse {
  id: string
  title: string
  title_en?: string
  title_ar?: string
  title_fr?: string
  description: string
  description_en?: string
  description_ar?: string
  description_fr?: string
  cover_image: string
  is_free: boolean
  duration: number
}

export type FavoriteItem = FavoriteStory | FavoriteCourse
