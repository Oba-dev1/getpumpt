// Type definitions for gym-related data

export interface GymBranding {
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
}

export interface GymContact {
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
}

export interface GymSocial {
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  tiktok: string | null;
}

export interface BusinessHours {
  [day: string]: {
    open: string;
    close: string;
  };
}

export interface HeroContent {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

export interface AboutContent {
  title?: string;
  description?: string;
  image?: string;
  stats?: Array<{
    value: string;
    label: string;
  }>;
}

export interface GymSettings {
  timezone?: string;
  currency?: string;
  dateFormat?: string;
  timeFormat?: '12h' | '24h';
  allowOnlineBooking?: boolean;
  allowOnlinePayment?: boolean;
  requireEmailVerification?: boolean;
  maxBookingsPerDay?: number;
  cancellationPolicy?: string;
  termsOfService?: string;
  privacyPolicy?: string;
}

export interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration: number;
  features: string[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface Trainer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  bio: string | null;
  specialties: string[];
  imageUrl: string | null;
  certifications: string[];
  yearsExperience: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface GymClass {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  capacity: number;
  category: string;
  imageUrl: string | null;
  isActive: boolean;
}

export interface ClassSchedule {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  location: string | null;
  isActive: boolean;
  gymClass: GymClass;
  trainer: Trainer;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number | null;
  imageUrl: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export interface Gym {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  branding: GymBranding;
  contact: GymContact;
  social: GymSocial;
  description: string | null;
  tagline: string | null;
  businessHours: BusinessHours | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  heroContent: HeroContent | null;
  features: FeatureItem[] | null;
  aboutContent: AboutContent | null;
  settings: GymSettings | null;
  isActive: boolean;
}

// Helper type for gym data with related entities
export interface GymWithData extends Gym {
  membershipPlans: MembershipPlan[];
  trainers: Trainer[];
  classSchedules: ClassSchedule[];
  testimonials: Testimonial[];
}
