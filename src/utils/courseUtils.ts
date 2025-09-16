import { Course, Category, CourseVideo } from '@/types/course';

export const getCourseText = (
  course: Course | any,
  field: 'title' | 'description',
  language: string = 'en'
): string => {
  if (!course) return '';
  
  const langKey = `${field}_${language}`;
  return course[langKey] || course[field] || '';
};

export const getCategoryText = (
  category: Category | any,
  field: 'name' | 'description',
  language: string = 'en'
): string => {
  if (!category) return '';
  
  const langKey = `${field}_${language}`;
  return category[langKey] || category[field] || category.name || '';
};

export const getInstructorText = (
  instructor: Course['instructor'] | any,
  field: 'name' | 'bio',
  language: string = 'en'
): string => {
  if (!instructor) return '';
  
  const langKey = `${field}_${language}`;
  return instructor[langKey] || instructor[field] || '';
};

export const getLessonText = (
  lesson: CourseVideo | any,
  field: 'title' | 'description',
  language: string = 'en'
): string => {
  if (!lesson) return '';
  
  const langKey = `${field}_${language}`;
  return lesson[langKey] || lesson[field] || '';
};