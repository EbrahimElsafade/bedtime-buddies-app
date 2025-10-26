import { UserRole } from './auth';
import { CourseVideo } from './course';

export type UserWithRole = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in?: string;
  roles: Array<{ role: UserRole }>;
};

export interface CourseLessonForm {
  id?: string;
  title_en: string;
  title_ar?: string;
  title_fr?: string;
  description_en: string;
  description_ar?: string;
  description_fr?: string;
  videoPath?: string;
  video_url?: string;
  thumbnailPath?: string;
  duration: number;
  isFree: boolean;
  order: number;
  thumbnailPreview?: string | null;
  videoFiles?: File[];
  uploadMethod: 'url' | 'upload';
}