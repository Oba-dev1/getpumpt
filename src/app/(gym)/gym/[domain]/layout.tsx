import { notFound } from 'next/navigation';
import { getGym } from '@/lib/gym';
import { GymProvider } from '@/contexts/GymContext';
import type { Metadata } from 'next';

interface GymLayoutProps {
  children: React.ReactNode;
  params: Promise<{ domain: string }>;
}

// Generate metadata based on gym
export async function generateMetadata({ params }: GymLayoutProps): Promise<Metadata> {
  const { domain } = await params;
  const gym = await getGym(domain);

  if (!gym) {
    return {
      title: 'Gym Not Found',
    };
  }

  return {
    title: gym.metaTitle || `${gym.name} | Transform Your Body, Elevate Your Life`,
    description: gym.metaDescription || gym.description || `Join ${gym.name} today and start your fitness journey.`,
    keywords: gym.metaKeywords.length > 0 ? gym.metaKeywords : ['gym', 'fitness', 'workout', 'health'],
    icons: gym.favicon ? { icon: gym.favicon } : undefined,
    openGraph: {
      title: gym.metaTitle || gym.name,
      description: gym.metaDescription || gym.description || undefined,
      images: gym.logo ? [gym.logo] : undefined,
    },
  };
}

export default async function GymLayout({ children, params }: GymLayoutProps) {
  const { domain } = await params;
  const gym = await getGym(domain);

  if (!gym) {
    notFound();
  }

  return (
    <GymProvider gym={gym}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --gym-primary: ${gym.primaryColor};
              --gym-secondary: ${gym.secondaryColor};
              --gym-primary-rgb: ${hexToRgb(gym.primaryColor)};
              --gym-secondary-rgb: ${hexToRgb(gym.secondaryColor)};
            }
          `,
        }}
      />
      {children}
    </GymProvider>
  );
}

// Convert hex to RGB string
function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '99, 102, 241';
}
