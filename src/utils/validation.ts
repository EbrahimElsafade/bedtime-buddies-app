import { z } from 'zod';
import type { TFunction } from 'i18next';

// Translated schema builders
export const buildLoginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .trim()
      .min(1, { message: t('auth:validation.emailRequired') })
      .email({ message: t('auth:validation.emailInvalid') })
      .max(255, { message: t('auth:validation.emailMax') }),
    password: z
      .string()
      .min(8, { message: t('auth:validation.passwordMin') })
      .max(128, { message: t('auth:validation.passwordMax') }),
  });

export const buildRegisterSchema = (t: TFunction) =>
  z.object({
    parentName: z
      .string()
      .trim()
      .min(1, { message: t('auth:validation.nameRequired') })
      .max(100, { message: t('auth:validation.nameMax') }),
    email: z
      .string()
      .trim()
      .min(1, { message: t('auth:validation.emailRequired') })
      .email({ message: t('auth:validation.emailInvalid') })
      .max(255, { message: t('auth:validation.emailMax') }),
    password: z
      .string()
      .min(8, { message: t('auth:validation.passwordMin') })
      .max(128, { message: t('auth:validation.passwordMax') })
      .regex(/[A-Z]/, { message: t('auth:validation.passwordUppercase') })
      .regex(/[a-z]/, { message: t('auth:validation.passwordLowercase') })
      .regex(/[0-9]/, { message: t('auth:validation.passwordNumber') }),
    childName: z
      .string()
      .trim()
      .max(100, { message: t('auth:validation.childNameMax') })
      .optional(),
    preferredLanguage: z.enum(['en', 'ar-eg', 'ar-fos7a', 'fr'], {
      errorMap: () => ({ message: t('auth:validation.languageRequired') }),
    }),
  });

// Backwards-compatible non-translated schemas (used outside of components)
export const loginSchema = z.object({
  email: z.string().trim().min(1).email().max(255),
  password: z.string().min(8).max(128),
});

export const registerSchema = z.object({
  parentName: z.string().trim().min(1).max(100),
  email: z.string().trim().min(1).email().max(255),
  password: z
    .string()
    .min(8)
    .max(128)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
  childName: z.string().trim().max(100).optional(),
  preferredLanguage: z.enum(['en', 'ar-eg', 'ar-fos7a', 'fr']),
});

export const profileUpdateSchema = z.object({
  parentName: z.string().trim().min(1, { message: 'Name is required' }).max(100),
  childName: z.string().trim().max(100).optional().or(z.literal('')),
  preferredLanguage: z.enum(['en', 'ar-eg', 'ar-fos7a', 'fr']),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
