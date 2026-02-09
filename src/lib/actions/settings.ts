'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const operationalSettingsSchema = z.object({
  membershipGracePeriod: z.number().int().min(0).max(60),
  autoRenewDefault: z.boolean(),
  cancellationPolicyHours: z.number().int().min(0).max(168),
  maxAdvanceBookingDays: z.number().int().min(1).max(365),
  waitlistEnabled: z.boolean(),
  paymentReminderDays: z.number().int().min(0).max(30),
})

const gymSettingsSchema = z.object({
  name: z.string().min(2),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  heroContent: z.object({
    title: z.string().optional(),
    subtitle: z.string().optional(),
    ctaLabel: z.string().optional(),
  }).optional(),
  aboutContent: z.object({
    headline: z.string().optional(),
    body: z.string().optional(),
  }).optional(),
  features: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  emailTemplates: z.object({
    welcome: z.string().optional(),
    renewalReminder: z.string().optional(),
    paymentReceipt: z.string().optional(),
    cancellation: z.string().optional(),
  }).optional(),
  settings: operationalSettingsSchema,
})

export async function getGymSettings(gymId: string) {
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: {
      name: true,
      logo: true,
      favicon: true,
      primaryColor: true,
      secondaryColor: true,
      address: true,
      city: true,
      state: true,
      country: true,
      phone: true,
      email: true,
      website: true,
      heroContent: true,
      aboutContent: true,
      features: true,
      metaTitle: true,
      metaDescription: true,
      settings: true,
    },
  })

  if (!gym) {
    throw new Error('Gym not found')
  }

  const defaults = {
    membershipGracePeriod: 7,
    autoRenewDefault: true,
    cancellationPolicyHours: 12,
    maxAdvanceBookingDays: 14,
    waitlistEnabled: true,
    paymentReminderDays: 3,
  }

  return {
    name: gym.name,
    logo: gym.logo ?? '',
    favicon: gym.favicon ?? '',
    primaryColor: gym.primaryColor ?? '#6366F1',
    secondaryColor: gym.secondaryColor ?? '#818CF8',
    address: gym.address ?? '',
    city: gym.city ?? '',
    state: gym.state ?? '',
    country: gym.country ?? 'Nigeria',
    phone: gym.phone ?? '',
    email: gym.email ?? '',
    website: gym.website ?? '',
    heroContent: (typeof gym.heroContent === 'object' && gym.heroContent ? gym.heroContent : {}),
    aboutContent: (typeof gym.aboutContent === 'object' && gym.aboutContent ? gym.aboutContent : {}),
    features: Array.isArray(gym.features) ? gym.features : [],
    metaTitle: gym.metaTitle ?? '',
    metaDescription: gym.metaDescription ?? '',
    emailTemplates: (typeof gym.settings === 'object' && gym.settings && (gym.settings as any).emailTemplates)
      ? (gym.settings as any).emailTemplates
      : {},
    settings: {
      ...defaults,
      ...(typeof gym.settings === 'object' && gym.settings ? gym.settings : {}),
    },
  }
}

export async function updateGymSettings(
  gymId: string,
  input: z.infer<typeof gymSettingsSchema>
) {
  const data = gymSettingsSchema.parse(input)

  const gym = await prisma.gym.update({
    where: { id: gymId },
    data: {
      name: data.name,
      logo: data.logo || undefined,
      favicon: data.favicon || undefined,
      primaryColor: data.primaryColor || undefined,
      secondaryColor: data.secondaryColor || undefined,
      address: data.address || undefined,
      city: data.city || undefined,
      state: data.state || undefined,
      country: data.country || undefined,
      phone: data.phone || undefined,
      email: data.email || undefined,
      website: data.website || undefined,
      heroContent: data.heroContent ?? {},
      aboutContent: data.aboutContent ?? {},
      features: data.features ?? [],
      metaTitle: data.metaTitle || undefined,
      metaDescription: data.metaDescription || undefined,
      settings: {
        ...data.settings,
        emailTemplates: data.emailTemplates ?? {},
      },
    },
    select: { slug: true },
  })

  revalidatePath('/admin/settings')
  revalidatePath(`/gym/${gym.slug}`)
  revalidatePath('/member')
}
