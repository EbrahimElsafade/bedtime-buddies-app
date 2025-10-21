import { z } from 'zod';

/**
 * Content validation schemas for admin editors
 * Prevents injection attacks and data corruption
 */

// Story validation schemas
export const storyTitleSchema = z.object({
  en: z.string().min(1, 'English title is required').max(200, 'Title too long'),
  ar: z.string().max(200, 'Title too long').optional(),
  fr: z.string().max(200, 'Title too long').optional(),
});

export const storyDescriptionSchema = z.object({
  en: z.string().max(2000, 'Description too long').optional(),
  ar: z.string().max(2000, 'Description too long').optional(),
  fr: z.string().max(2000, 'Description too long').optional(),
});

export const storySectionTextSchema = z.record(
  z.string().max(5000, 'Section text too long')
);

export const storySectionSchema = z.object({
  texts: storySectionTextSchema,
  order: z.number().int().min(0).max(100, 'Section order out of range'),
  image: z.string().optional(),
  voices: z.record(z.string()).optional(),
});

// Course validation schemas
export const courseTitleSchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(200, 'Title too long'),
  title_ar: z.string().max(200, 'Title too long').optional(),
  title_fr: z.string().max(200, 'Title too long').optional(),
});

export const courseDescriptionSchema = z.object({
  description_en: z.string().min(1, 'English description is required').max(2000, 'Description too long'),
  description_ar: z.string().max(2000, 'Description too long').optional(),
  description_fr: z.string().max(2000, 'Description too long').optional(),
});

export const learningObjectivesSchema = z.array(
  z.string().max(500, 'Learning objective too long')
).max(20, 'Too many learning objectives');

export const courseAgeSchema = z.object({
  minAge: z.number().int().min(0, 'Age must be positive').max(18, 'Age too high').optional(),
  maxAge: z.number().int().min(0, 'Age must be positive').max(18, 'Age too high').optional(),
});

export const instructorNameSchema = z.object({
  instructor_name_en: z.string().max(100, 'Name too long').optional(),
  instructor_name_ar: z.string().max(100, 'Name too long').optional(),
  instructor_name_fr: z.string().max(100, 'Name too long').optional(),
});

export const instructorBioSchema = z.object({
  instructor_bio_en: z.string().max(1000, 'Bio too long').optional(),
  instructor_bio_ar: z.string().max(1000, 'Bio too long').optional(),
  instructor_bio_fr: z.string().max(1000, 'Bio too long').optional(),
});

export const lessonTitleSchema = z.object({
  title_en: z.string().min(1, 'English title is required').max(200, 'Title too long'),
  title_ar: z.string().max(200, 'Title too long').optional(),
  title_fr: z.string().max(200, 'Title too long').optional(),
});

export const lessonDescriptionSchema = z.object({
  description_en: z.string().max(1000, 'Description too long').optional(),
  description_ar: z.string().max(1000, 'Description too long').optional(),
  description_fr: z.string().max(1000, 'Description too long').optional(),
});

/**
 * Validates story data before submission
 */
export const validateStoryData = (data: {
  title: Record<string, string>;
  description: Record<string, string>;
}) => {
  try {
    storyTitleSchema.parse(data.title);
    storyDescriptionSchema.parse(data.description);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
};

/**
 * Validates course data before submission
 */
export const validateCourseData = (data: {
  title_en: string;
  description_en: string;
  min_age?: number;
  max_age?: number;
}) => {
  try {
    courseTitleSchema.parse({ title_en: data.title_en });
    courseDescriptionSchema.parse({ description_en: data.description_en });
    
    if (data.min_age !== undefined || data.max_age !== undefined) {
      courseAgeSchema.parse({ minAge: data.min_age, maxAge: data.max_age });
    }
    
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        error: error.errors[0]?.message || 'Validation failed',
      };
    }
    return { valid: false, error: 'Unknown validation error' };
  }
};
