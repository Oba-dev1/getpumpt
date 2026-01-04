import { z } from 'zod';

// ==================== AUTH SCHEMAS ====================

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  gymId: z.string().optional(),
});

export const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  phone: z.string().optional(),
  gymId: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ==================== USER SCHEMAS ====================

export const updateProfileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// ==================== MEMBERSHIP SCHEMAS ====================

export const membershipPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('NGN'),
  duration: z.number().int().positive('Duration must be a positive integer'),
  features: z.array(z.string()),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

// ==================== CLASS SCHEMAS ====================

export const gymClassSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  duration: z.number().int().positive('Duration must be positive'),
  capacity: z.number().int().positive('Capacity must be positive'),
  category: z.enum([
    'HIIT',
    'YOGA',
    'STRENGTH',
    'CARDIO',
    'SPIN',
    'CROSSFIT',
    'PILATES',
    'BOXING',
    'DANCE',
    'OTHER',
  ]),
  imageUrl: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

export const classScheduleSchema = z.object({
  classId: z.string(),
  trainerId: z.string(),
  dayOfWeek: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format'),
  maxCapacity: z.number().int().positive('Capacity must be positive'),
  location: z.string().optional(),
  isActive: z.boolean().default(true),
});

export const classBookingSchema = z.object({
  scheduleId: z.string(),
  date: z.string().or(z.date()),
});

// ==================== TRAINER SCHEMAS ====================

export const trainerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.array(z.string()),
  imageUrl: z.string().url().optional().or(z.literal('')),
  certifications: z.array(z.string()),
  yearsExperience: z.number().int().nonnegative().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

// ==================== CONTACT SCHEMAS ====================

export const contactInquirySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  interest: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

// ==================== GYM SETTINGS SCHEMAS ====================

export const gymSettingsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().optional(),
  tagline: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('Nigeria'),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

export const gymBrandingSchema = z.object({
  logo: z.string().url().optional().or(z.literal('')),
  favicon: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid color format'),
});

export const gymSocialSchema = z.object({
  facebook: z.string().url().optional().or(z.literal('')),
  instagram: z.string().url().optional().or(z.literal('')),
  twitter: z.string().url().optional().or(z.literal('')),
  youtube: z.string().url().optional().or(z.literal('')),
  tiktok: z.string().url().optional().or(z.literal('')),
});

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MembershipPlanInput = z.infer<typeof membershipPlanSchema>;
export type GymClassInput = z.infer<typeof gymClassSchema>;
export type ClassScheduleInput = z.infer<typeof classScheduleSchema>;
export type ClassBookingInput = z.infer<typeof classBookingSchema>;
export type TrainerInput = z.infer<typeof trainerSchema>;
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type GymSettingsInput = z.infer<typeof gymSettingsSchema>;
export type GymBrandingInput = z.infer<typeof gymBrandingSchema>;
export type GymSocialInput = z.infer<typeof gymSocialSchema>;
