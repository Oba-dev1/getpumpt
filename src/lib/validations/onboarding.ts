import { z } from 'zod'

export const onboardingPlanSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  price: z.number().min(0, 'Price must be a positive number'),
  durationValue: z.number().int().min(1, 'Duration must be at least 1'),
  durationType: z.enum(['DAYS', 'MONTHS', 'YEARS'], {
    message: 'Duration type is required',
  }),
})

export type OnboardingPlanInput = z.infer<typeof onboardingPlanSchema>

export const onboardingBrandingSchema = z.object({
  logo: z.string().url('Logo must be a valid URL').optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color (e.g., #6366F1)'),
})

export type OnboardingBrandingInput = z.infer<typeof onboardingBrandingSchema>

export const onboardingClassSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must not exceed 100 characters'),
  category: z.enum(['HIIT', 'YOGA', 'STRENGTH', 'CARDIO', 'SPIN', 'CROSSFIT', 'PILATES', 'BOXING', 'DANCE', 'OTHER'], {
    message: 'Category is required',
  }),
  duration: z.number().int().min(15, 'Duration must be at least 15 minutes').max(300, 'Duration must not exceed 300 minutes'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
})

export type OnboardingClassInput = z.infer<typeof onboardingClassSchema>

export const onboardingInviteSchema = z.object({
  emails: z
    .array(z.string().email('Invalid email address'))
    .min(1, 'At least one email is required')
    .max(10, 'Maximum 10 invites allowed at once'),
})

export type OnboardingInviteInput = z.infer<typeof onboardingInviteSchema>
