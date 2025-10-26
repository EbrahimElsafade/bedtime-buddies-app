import { Course, Category, CourseVideo } from '@/types/course';

export const getCourseText = (
  course: Partial<Course> | Record<string, unknown>,
  field: 'title' | 'description',
  language: string = 'en'
): string => {
  if (!course) return '';
  
  const langKey = `${field}_${language}`;
  return (course as Record<string, unknown>)[langKey] as string || (course as Record<string, unknown>)[field] as string || '';
};

export const getCategoryText = (
  category: Partial<Category> | Record<string, unknown>,
  field: 'name' | 'description',
  language: string = 'en'
): string => {
  if (!category) return '';
  
  const langKey = `${field}_${language}`;
  const cat = category as Record<string, unknown>;
  return cat[langKey] as string || cat[field] as string || cat.name as string || cat.name_en as string || '';
};

export const getLearningObjectives = (
  course: Partial<Course> | Record<string, unknown>,
  language: string = 'en'
): string[] => {
  if (!course) return [];
  
  const langKey = `learning_objectives_${language}`;
  const c = course as Record<string, unknown>;
  return c[langKey] as string[] || c.learning_objectives as string[] || [];
};

export const getInstructorText = (
  instructor: Course['instructor'] | Record<string, unknown>,
  field: 'name' | 'bio',
  language: string = 'en'
): string => {
  if (!instructor) return '';
  
  const langKey = `${field}_${language}`;
  const inst = instructor as Record<string, unknown>;
  return inst[langKey] as string || inst[field] as string || '';
};

export const getLessonText = (
  lesson: Partial<CourseVideo> | Record<string, unknown>,
  field: 'title' | 'description',
  language: string = 'en'
): string => {
  if (!lesson) return '';
  
  const langKey = `${field}_${language}`;
  const les = lesson as Record<string, unknown>;
  return les[langKey] as string || les[field] as string || '';
};