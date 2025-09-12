export type Category = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CourseVideo = {
  id: string;
  title: string;
  description: string;
  videoPath: string; // Supabase storage path
  thumbnailPath: string; // Supabase storage path
  duration: number; // in seconds
  isFree: boolean;
  order: number; // lesson order inside the course
  createdAt: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  categoryId: string; // foreign key to Category.id
  minAge: number;
  maxAge: number;
  duration: number; // total in seconds
  lessons: number; // number of lessons
  coverImagePath: string;
  isFeatured: boolean;
  isFree: boolean;
  videos?: CourseVideo[];
  createdAt: string;
};