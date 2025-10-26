import { z } from 'zod';
import { loginSchema, registerSchema, profileUpdateSchema } from '@/utils/validation';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type Lang = 'en' | 'ar' | 'fr';

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;