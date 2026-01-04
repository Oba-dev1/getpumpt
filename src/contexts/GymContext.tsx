'use client';

import { createContext, useContext, ReactNode } from 'react';

// Gym type matching Prisma schema
export interface Gym {
  id: string;
  name: string;
  slug: string;
  customDomain: string | null;
  logo: string | null;
  favicon: string | null;
  primaryColor: string;
  secondaryColor: string;
  description: string | null;
  tagline: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  twitter: string | null;
  youtube: string | null;
  tiktok: string | null;
  businessHours: Record<string, { open: string; close: string }> | null;
  metaTitle: string | null;
  metaDescription: string | null;
  metaKeywords: string[];
  heroContent: HeroContent | null;
  features: FeatureItem[] | null;
  aboutContent: AboutContent | null;
  settings: GymSettings | null;
  isActive: boolean;
}

export interface HeroContent {
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
  badge?: string;
  stats?: Array<{ value: string; label: string }>;
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
  stats?: Array<{ value: string; label: string }>;
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

interface GymContextType {
  gym: Gym | null;
  isLoading: boolean;
  error: Error | null;
}

const GymContext = createContext<GymContextType>({
  gym: null,
  isLoading: false,
  error: null,
});

interface GymProviderProps {
  children: ReactNode;
  gym: Gym | null;
}

export function GymProvider({ children, gym }: GymProviderProps) {
  return (
    <GymContext.Provider value={{ gym, isLoading: false, error: null }}>
      {children}
    </GymContext.Provider>
  );
}

export function useGym() {
  const context = useContext(GymContext);
  if (context === undefined) {
    throw new Error('useGym must be used within a GymProvider');
  }
  return context;
}

// Helper hook to get gym colors as CSS variables
export function useGymTheme() {
  const { gym } = useGym();

  return {
    primaryColor: gym?.primaryColor || '#6366F1',
    secondaryColor: gym?.secondaryColor || '#818CF8',
    cssVariables: {
      '--gym-primary': gym?.primaryColor || '#6366F1',
      '--gym-secondary': gym?.secondaryColor || '#818CF8',
    } as React.CSSProperties,
  };
}

// Helper to generate CSS variables from gym colors
export function getGymCssVariables(gym: Gym | null): React.CSSProperties {
  return {
    '--gym-primary': gym?.primaryColor || '#6366F1',
    '--gym-secondary': gym?.secondaryColor || '#818CF8',
    '--gym-primary-rgb': hexToRgb(gym?.primaryColor || '#6366F1'),
    '--gym-secondary-rgb': hexToRgb(gym?.secondaryColor || '#818CF8'),
  } as React.CSSProperties;
}

// Convert hex to RGB string for use with rgba()
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '99, 102, 241'; // Default to primary color RGB
}
