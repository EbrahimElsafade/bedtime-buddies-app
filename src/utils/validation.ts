import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
});

// Registration validation schema
export const registerSchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" })
    .max(255, { message: "Email must be less than 255 characters" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password must be less than 128 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  childName: z
    .string()
    .trim()
    .max(100, { message: "Child's name must be less than 100 characters" })
    .optional(),
  preferredLanguage: z.enum(['en', 'ar-eg', 'ar-fos7a', 'fr'], {
    errorMap: () => ({ message: "Please select a valid language" })
  })
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  parentName: z
    .string()
    .trim()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be less than 100 characters" }),
  childName: z
    .string()
    .trim()
    .max(100, { message: "Child's name must be less than 100 characters" })
    .optional()
    .or(z.literal('')),
  preferredLanguage: z.enum(['en', 'ar-eg', 'ar-fos7a', 'fr'], {
    errorMap: () => ({ message: "Please select a valid language" })
  })
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
