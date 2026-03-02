import prisma from './prisma';
import { cache } from 'react';
import type { Gym } from '@/contexts/GymContext';

// Cache the gym lookup for the duration of a request
export const getGymBySlug = cache(async (slug: string): Promise<Gym | null> => {
  try {
    const gym = await prisma.gym.findUnique({
      where: { slug, isActive: true },
    });

    if (!gym) return null;

    return {
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      customDomain: gym.customDomain,
      logo: gym.logo,
      favicon: gym.favicon,
      primaryColor: gym.primaryColor,
      secondaryColor: gym.secondaryColor,
      description: gym.description,
      tagline: gym.tagline,
      address: gym.address,
      city: gym.city,
      state: gym.state,
      country: gym.country,
      phone: gym.phone,
      email: gym.email,
      website: gym.website,
      facebook: gym.facebook,
      instagram: gym.instagram,
      twitter: gym.twitter,
      youtube: gym.youtube,
      tiktok: gym.tiktok,
      businessHours: gym.businessHours as Gym['businessHours'],
      metaTitle: gym.metaTitle,
      metaDescription: gym.metaDescription,
      metaKeywords: gym.metaKeywords,
      heroContent: gym.heroContent as Gym['heroContent'],
      features: gym.features as Gym['features'],
      aboutContent: gym.aboutContent as Gym['aboutContent'],
      settings: gym.settings as Gym['settings'],
      galleryImages: gym.galleryImages,
      videoUrl: gym.videoUrl,
      heroImageUrl: gym.heroImageUrl,
      aboutImageUrl: gym.aboutImageUrl,
      isActive: gym.isActive,
    };
  } catch (error) {
    return null;
  }
});

// Get gym by custom domain
export const getGymByDomain = cache(async (domain: string): Promise<Gym | null> => {
  try {
    const gym = await prisma.gym.findUnique({
      where: { customDomain: domain, isActive: true },
    });

    if (!gym) return null;

    return {
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      customDomain: gym.customDomain,
      logo: gym.logo,
      favicon: gym.favicon,
      primaryColor: gym.primaryColor,
      secondaryColor: gym.secondaryColor,
      description: gym.description,
      tagline: gym.tagline,
      address: gym.address,
      city: gym.city,
      state: gym.state,
      country: gym.country,
      phone: gym.phone,
      email: gym.email,
      website: gym.website,
      facebook: gym.facebook,
      instagram: gym.instagram,
      twitter: gym.twitter,
      youtube: gym.youtube,
      tiktok: gym.tiktok,
      businessHours: gym.businessHours as Gym['businessHours'],
      metaTitle: gym.metaTitle,
      metaDescription: gym.metaDescription,
      metaKeywords: gym.metaKeywords,
      heroContent: gym.heroContent as Gym['heroContent'],
      features: gym.features as Gym['features'],
      aboutContent: gym.aboutContent as Gym['aboutContent'],
      settings: gym.settings as Gym['settings'],
      galleryImages: gym.galleryImages,
      videoUrl: gym.videoUrl,
      heroImageUrl: gym.heroImageUrl,
      aboutImageUrl: gym.aboutImageUrl,
      isActive: gym.isActive,
    };
  } catch (error) {
    return null;
  }
});

// Get gym by slug or domain
export const getGym = cache(async (identifier: string): Promise<Gym | null> => {
  // First try by slug
  let gym = await getGymBySlug(identifier);

  // If not found, try by domain
  if (!gym) {
    gym = await getGymByDomain(identifier);
  }

  return gym;
});

// Get all gyms (for static generation)
export async function getAllGyms(): Promise<Gym[]> {
  try {
    const gyms = await prisma.gym.findMany({
      where: { isActive: true },
    });

    return gyms.map((gym) => ({
      id: gym.id,
      name: gym.name,
      slug: gym.slug,
      customDomain: gym.customDomain,
      logo: gym.logo,
      favicon: gym.favicon,
      primaryColor: gym.primaryColor,
      secondaryColor: gym.secondaryColor,
      description: gym.description,
      tagline: gym.tagline,
      address: gym.address,
      city: gym.city,
      state: gym.state,
      country: gym.country,
      phone: gym.phone,
      email: gym.email,
      website: gym.website,
      facebook: gym.facebook,
      instagram: gym.instagram,
      twitter: gym.twitter,
      youtube: gym.youtube,
      tiktok: gym.tiktok,
      businessHours: gym.businessHours as Gym['businessHours'],
      metaTitle: gym.metaTitle,
      metaDescription: gym.metaDescription,
      metaKeywords: gym.metaKeywords,
      heroContent: gym.heroContent as Gym['heroContent'],
      features: gym.features as Gym['features'],
      aboutContent: gym.aboutContent as Gym['aboutContent'],
      settings: gym.settings as Gym['settings'],
      galleryImages: gym.galleryImages,
      videoUrl: gym.videoUrl,
      heroImageUrl: gym.heroImageUrl,
      aboutImageUrl: gym.aboutImageUrl,
      isActive: gym.isActive,
    }));
  } catch (error) {
    return [];
  }
}

// Get gym membership plans
export async function getGymMembershipPlans(gymId: string) {
  try {
    const plans = await prisma.membershipPlan.findMany({
      where: { gymId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map(plan => ({
      id: plan.id,
      gymId: plan.gymId,
      name: plan.name,
      description: plan.description,
      price: Number(plan.price),
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      durationValue: plan.durationValue,
      durationType: plan.durationType,
      classCredits: plan.classCredits ?? undefined,
      features: plan.features,
      isActive: plan.isActive,
      isFeatured: plan.isFeatured,
      sortOrder: plan.sortOrder,
    }));
  } catch (error) {
    return [];
  }
}

// Get gym trainers
export async function getGymTrainers(gymId: string) {
  try {
    const trainers = await prisma.trainer.findMany({
      where: { gymId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return trainers.map((t) => ({
      ...t,
      ptPrice: t.ptPrice ? Number(t.ptPrice) : null,
    }));
  } catch (error) {
    return [];
  }
}

// Get gym class schedules
export async function getGymClassSchedules(gymId: string) {
  try {
    return await prisma.classSchedule.findMany({
      where: { gymId, isActive: true },
      include: {
        gymClass: true,
        trainer: true,
      },
      orderBy: [
        { dayOfWeek: 'asc' },
        { startTime: 'asc' },
      ],
    });
  } catch (error) {
    return [];
  }
}

// Get gym testimonials
export async function getGymTestimonials(gymId: string) {
  try {
    return await prisma.testimonial.findMany({
      where: { gymId, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  } catch (error) {
    return [];
  }
}
