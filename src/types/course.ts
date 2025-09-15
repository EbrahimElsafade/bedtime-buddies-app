export type Category = {
  id: string;
  name_en: string;
  name_ar?: string;
  name_fr?: string;
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
  title_en: string;
  title_ar: string;
  title_fr: string;
  description_en: string;
  description_ar: string;
  description_fr: string;
  category: string; 
  minAge: number;
  maxAge: number;
  duration: number; // total in seconds
  lessons: number; // number of lessons
  coverImagePath: string;
  isFeatured: boolean;
  isFree: boolean;
  videos?: CourseVideo[];
  createdAt: string;
  learningObjectives?: string[];
  instructor?: {
    name_en: string;
    name_ar?: string;
    name_fr?: string;
    bio_en: string;
    bio_ar?: string;
    bio_fr?: string;
    avatar?: string;
    expertise_en?: string[];
    expertise_ar?: string[];
    expertise_fr?: string[];
  };
};