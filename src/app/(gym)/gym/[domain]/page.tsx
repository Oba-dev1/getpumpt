import { notFound } from 'next/navigation';
import { getGym, getGymMembershipPlans, getGymTrainers, getGymClassSchedules, getGymTestimonials } from '@/lib/gym';

// Import landing page components
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import Pricing from '@/components/landing/Pricing';
import Schedule from '@/components/landing/Schedule';
import Trainers from '@/components/landing/Trainers';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

interface GymPageProps {
  params: Promise<{ domain: string }>;
}

export default async function GymLandingPage({ params }: GymPageProps) {
  const { domain } = await params;
  const gym = await getGym(domain);

  if (!gym) {
    notFound();
  }

  // Fetch all gym data in parallel
  const [membershipPlans, trainers, schedules, testimonials] = await Promise.all([
    getGymMembershipPlans(gym.id),
    getGymTrainers(gym.id),
    getGymClassSchedules(gym.id),
    getGymTestimonials(gym.id),
  ]);

  return (
    <>
      <Navbar />
      <main>
        <Hero heroContent={gym.heroContent} />
        <Features features={gym.features} />
        <Pricing plans={membershipPlans} />
        <Schedule schedules={schedules} />
        <Trainers trainers={trainers} />
        <Testimonials testimonials={testimonials} />
        <CTA />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

// Generate static params for all gyms (for static site generation)
export async function generateStaticParams() {
  // For now, return empty array - will be populated when database is seeded
  // In production, this would fetch all gym slugs from the database
  return [];
}
