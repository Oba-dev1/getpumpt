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

export const assignMembershipSchema = z.object({
  planId: z.string().min(1, 'Plan is required'),
  startDate: z.string().min(1, 'Start date is required'),
  autoRenew: z.boolean(),
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

// ==================== MEMBER PORTAL SCHEMAS ====================

export const notificationPreferenceSchema = z.object({
  bookingConfirmation: z.boolean().default(true),
  bookingReminder: z.boolean().default(true),
  membershipExpiry: z.boolean().default(true),
  paymentReceipts: z.boolean().default(true),
  promotions: z.boolean().default(false),
  announcements: z.boolean().default(true),
});

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().optional(),
});

export const membershipRenewalSchema = z.object({
  planId: z.string().min(1, 'Plan ID is required'),
  autoRenew: z.boolean().optional(),
});

export const toggleAutoRenewSchema = z.object({
  autoRenew: z.boolean(),
});

export const cancelMembershipSchema = z.object({
  reason: z.string().min(10, 'Please provide a reason (minimum 10 characters)'),
});

export const updateEmailSchema = z.object({
  newEmail: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required for email change'),
});

export const avatarUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 2 * 1024 * 1024,
    'File size must be less than 2MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type),
    'Only JPG, JPEG, and PNG formats are supported'
  ),
});

export const membershipPaymentSchema = z.object({
  membershipId: z.string().min(1, 'Membership ID is required'),
});

export const planSubscriptionSchema = z.object({
  planId: z.string().min(1, 'Plan selection is required'),
});

export const notificationIdSchema = z.object({
  notificationId: z.string().min(1, 'Notification ID is required'),
});

// ==================== STAFF SCHEMAS ====================

export const createStaffSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['STAFF', 'ADMIN'], {
    message: 'Role must be either Staff or Admin',
  }),
});

export const updateStaffRoleSchema = z.object({
  role: z.enum(['STAFF', 'ADMIN'], {
    message: 'Role must be either Staff or Admin',
  }),
});

// ==================== MEMBER ADMIN SCHEMAS ====================

export const createMemberSchema = z.object({
  gymId: z.string().min(1, 'Gym ID is required'),
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  planId: z.string().optional(),
  startDate: z.date().optional(),
});

export const updateMemberSchema = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  phone: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
});

// ==================== PLAN ADMIN SCHEMAS ====================

export const createPlanSchema = z.object({
  gymId: z.string().min(1, 'Gym ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().default('NGN'),
  billingCycle: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'YEARLY']),
  durationValue: z.number().int().positive('Duration must be a positive integer'),
  durationType: z.enum(['DAYS', 'MONTHS', 'YEARS']),
  classCredits: z.number().int().nonnegative().optional(),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const updatePlanSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  currency: z.string().optional(),
  billingCycle: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY', 'BIANNUAL', 'YEARLY']).optional(),
  durationValue: z.number().int().positive().optional(),
  durationType: z.enum(['DAYS', 'MONTHS', 'YEARS']).optional(),
  classCredits: z.number().int().nonnegative().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

// ==================== TRAINER ADMIN SCHEMAS ====================

export const createTrainerSchema = trainerSchema.omit({ sortOrder: true }).extend({
  gymId: z.string().min(1, 'Gym ID is required'),
  sortOrder: z.number().int().default(0),
});

export const updateTrainerSchema = trainerSchema.partial();

// ==================== CLASS ADMIN SCHEMAS ====================

export const createGymClassSchema = gymClassSchema.extend({
  gymId: z.string().min(1, 'Gym ID is required'),
});

export const updateGymClassSchema = gymClassSchema.partial();

// ==================== SCHEDULE ADMIN SCHEMAS ====================

export const createClassScheduleSchema = classScheduleSchema.extend({
  gymId: z.string().min(1, 'Gym ID is required'),
});

export const updateClassScheduleSchema = classScheduleSchema.partial();

// ==================== BOOKING ADMIN SCHEMAS ====================

export const createBookingSchema = z.object({
  gymId: z.string().min(1, 'Gym ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  scheduleId: z.string().min(1, 'Schedule ID is required'),
  date: z.date(),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']).default('CONFIRMED'),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['CANCELLED', 'COMPLETED', 'NO_SHOW']),
});

// ==================== MEMBERSHIP ADMIN SCHEMAS ====================

export const adminCancelMembershipSchema = z.object({
  reason: z.string().optional(),
});

export const renewMembershipSchema = z.object({
  autoRenew: z.boolean().optional(),
});

export const updateAutoRenewSchema = z.object({
  autoRenew: z.boolean(),
});

// ==================== PAYMENT ADMIN SCHEMAS ====================

export const refundPaymentSchema = z.object({
  amount: z.number().positive('Refund amount must be positive').optional(),
  reason: z.string().optional(),
});

export const initializePaymentSchema = z.object({
  gymId: z.string().min(1, 'Gym ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  membershipId: z.string().min(1, 'Membership ID is required'),
  callbackUrl: z.string().url('Callback URL must be a valid URL'),
});

export const verifyPaymentSchema = z.object({
  reference: z.string().min(1, 'Payment reference is required'),
});

// ==================== TYPE EXPORTS ====================

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type MembershipPlanInput = z.infer<typeof membershipPlanSchema>;
export type AssignMembershipInput = z.infer<typeof assignMembershipSchema>;
export type GymClassInput = z.infer<typeof gymClassSchema>;
export type ClassScheduleInput = z.infer<typeof classScheduleSchema>;
export type ClassBookingInput = z.infer<typeof classBookingSchema>;
export type TrainerInput = z.infer<typeof trainerSchema>;
export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
export type GymSettingsInput = z.infer<typeof gymSettingsSchema>;
export type GymBrandingInput = z.infer<typeof gymBrandingSchema>;
export type GymSocialInput = z.infer<typeof gymSocialSchema>;
export type NotificationPreferenceInput = z.infer<typeof notificationPreferenceSchema>;
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>;
export type MembershipRenewalInput = z.infer<typeof membershipRenewalSchema>;
export type ToggleAutoRenewInput = z.infer<typeof toggleAutoRenewSchema>;
export type CancelMembershipInput = z.infer<typeof cancelMembershipSchema>;
export type UpdateEmailInput = z.infer<typeof updateEmailSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type MembershipPaymentInput = z.infer<typeof membershipPaymentSchema>;
export type PlanSubscriptionInput = z.infer<typeof planSubscriptionSchema>;
export type NotificationIdInput = z.infer<typeof notificationIdSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
export type UpdateStaffRoleInput = z.infer<typeof updateStaffRoleSchema>;

// ==================== CHECK-IN SCHEMAS ====================

export const checkInSchema = z.object({
  userId: z.string().min(1, 'Member ID is required'),
  notes: z.string().optional(),
});

export type CheckInInput = z.infer<typeof checkInSchema>;

// Activity log filters
export const activityLogFilterSchema = z.object({
  gymId: z.string().min(1),
  search: z.string().optional(),
  resourceType: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
})

export type ActivityLogFilterInput = z.infer<typeof activityLogFilterSchema>;

// Admin action types
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type CreatePlanInput = z.input<typeof createPlanSchema>;
export type UpdatePlanInput = z.input<typeof updatePlanSchema>;
export type CreateTrainerInput = z.input<typeof createTrainerSchema>;
export type UpdateTrainerInput = z.input<typeof updateTrainerSchema>;
export type CreateGymClassInput = z.input<typeof createGymClassSchema>;
export type UpdateGymClassInput = z.input<typeof updateGymClassSchema>;
export type CreateClassScheduleInput = z.input<typeof createClassScheduleSchema>;
export type UpdateClassScheduleInput = z.input<typeof updateClassScheduleSchema>;
export type CreateBookingInput = z.input<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type AdminCancelMembershipInput = z.infer<typeof adminCancelMembershipSchema>;
export type RenewMembershipInput = z.infer<typeof renewMembershipSchema>;
export type UpdateAutoRenewInput = z.infer<typeof updateAutoRenewSchema>;
export type RefundPaymentInput = z.infer<typeof refundPaymentSchema>;
export type InitializePaymentInput = z.infer<typeof initializePaymentSchema>;
export type VerifyPaymentInput = z.infer<typeof verifyPaymentSchema>;

// ==================== BULK IMPORT SCHEMAS ====================

export const bulkMemberRowSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').max(50),
  lastName: z.string().min(2, 'Last name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
})

export const bulkMemberImportSchema = z.object({
  gymId: z.string().min(1, 'Gym ID is required'),
  members: z
    .array(bulkMemberRowSchema)
    .min(1, 'At least one member is required')
    .max(500, 'Maximum 500 members per import'),
  duplicateStrategy: z.enum(['skip', 'update']),
  sendWelcomeEmail: z.boolean().default(true),
})

export type BulkMemberRow = z.infer<typeof bulkMemberRowSchema>
export type BulkMemberImportInput = z.infer<typeof bulkMemberImportSchema>

// ==================== NOTIFICATION SEND SCHEMAS ====================

export const sendNotificationSchema = z.object({
  title: z.string().min(2, 'Title is required').max(100, 'Title must be 100 characters or fewer'),
  message: z.string().min(5, 'Message is required').max(500, 'Message must be 500 characters or fewer'),
  type: z.enum(['MEMBERSHIP', 'BOOKING', 'PAYMENT', 'GENERAL', 'PROMO']),
  audience: z.enum(['ALL', 'SPECIFIC', 'MEMBERSHIP_STATUS']),
  userId: z.string().optional(),
  membershipStatus: z.enum(['PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED', 'PAUSED']).optional(),
  link: z.string().optional(),
})

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>
