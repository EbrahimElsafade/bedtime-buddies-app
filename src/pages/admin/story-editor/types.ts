
export interface StorySection {
  id?: string;
  section_order: number;
  image?: File | string | null;
  imagePreview?: string | null;
  translations: Record<string, { text: string; audio_url?: string | null; audioFile?: File | null; audioPreview?: string | null }>;
}

export interface StoryData {
  title: string;
  description: string;
  category: string;
  duration: number;
  is_free: boolean;
  is_published: boolean;
  languages: string[];
  cover_image: string | null;
  scenes: Array<{
    id?: string;
    scene_order: number;
    image: string | null;
    translations: Record<string, { text: string; audio_url: string | null }>;
  }>;
}

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "ar-eg", label: "Arabic (Egyptian)" },
  { value: "ar-fos7a", label: "Arabic (Fos7a)" }
];

export const categoryOptions = [
  { value: "bedtime", label: "Bedtime" },
  { value: "adventure", label: "Adventure" },
  { value: "educational", label: "Educational" },
  { value: "animals", label: "Animals" },
  { value: "fantasy", label: "Fantasy" }
];
