// Root page - redirects to marketing or shows FitGym for development
// In production, the marketing site (GymFlow Pro) would be shown at the root domain
// Gym sites are accessed via subdomains (e.g., fitgym.gymflowpro.com) or custom domains

// For development, we'll show FitGym directly
// To test the marketing page, visit /marketing
// To test gym routes, visit /gym/fitgym or use ?gym=fitgym query param

import {
  Navbar,
  Hero,
  Features,
  Pricing,
  Schedule,
  Trainers,
  Testimonials,
  Contact,
  CTA,
  Footer,
} from '@/components/landing';

export default function Home() {
  // In development, show FitGym landing page directly
  // In production with proper domain setup, this would redirect based on domain
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Pricing />
        <Schedule />
        <Trainers />
        <Testimonials />
        <Contact />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
