
export interface Story {
  id: string;
  title: Record<string, string>; // Changed from string to Record<string, string>
  description: Record<string, string>; // Changed from string to Record<string, string>
  category: string;
  cover_image: string;
  duration: number;
  is_free: boolean;
  is_published: boolean;
  languages: string[]; // e.g., ["en", "ar-eg"]
  created_at: string;
  updated_at: string;
  audio_mode: "per_section" | "single_story";
  story_audio: Record<string, string> | null; // Changed to support multilingual audio
  sections: StorySection[];
}

export interface StorySection {
  id: string;
  order: number;
  texts: Record<string, string>; // { "en": "Once upon a time...", "ar-eg": "في يوم من الأيام..." }
  voices?: Record<string, string>; // { "en": "url.mp3", "ar-eg": "url.mp3" }
  image?: string; // section image URL
}
