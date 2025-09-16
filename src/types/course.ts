export type Category = {
  id: string;
  name: string; // Keep for backwards compatibility
  name_en: string;
  name_ar: string;
  name_fr: string;
  description_en?: string;
  description_ar?: string;
  description_fr?: string;
  created_at: string;
  updated_at: string;
};

export type CourseVideo = {
  id: string;
  title_en: string;
  title_ar: string;
  title_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  videoPath: string; // Supabase storage path
  thumbnailPath: string; // Supabase storage path
  duration: number; // in seconds
  isFree: boolean;
  order: number; // lesson order inside the course
  createdAt: string;
};

export type Course = {
  id: string;
  title: string; // Keep for backwards compatibility
  title_en: string;
  title_ar: string;
  title_fr: string;
  description: string; // Keep for backwards compatibility
  description_en: string;
  description_ar: string;
  description_fr: string;
  category: string; 
  minAge: number;
  maxAge: number;
  duration: number; // total in seconds
  lessons: number; // number of lessons
  cover_image: string; // Keep for backwards compatibility
  coverImagePath: string;
  is_free: boolean; // Keep for backwards compatibility
  isFeatured: boolean;
  isFree: boolean;
  is_published: boolean; // Keep for backwards compatibility
  languages: string[]; // Keep for backwards compatibility
  videos?: CourseVideo[];
  createdAt: string;
  learningObjectives?: string[];
  instructor?: {
    name_en: string;
    name_ar: string;
    name_fr: string;
    bio_en: string;
    bio_ar: string;
    bio_fr: string;
    avatar?: string;
    expertise?: string[];
  };
};