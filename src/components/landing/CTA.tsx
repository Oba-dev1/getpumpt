import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function CTA() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-center relative overflow-hidden">
      {/* Pattern Overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 container-custom">
        <h2 className="font-['Bebas_Neue'] text-3xl sm:text-4xl md:text-5xl lg:text-[5rem] tracking-[0.02em] mb-3 md:mb-4">
          READY TO TRANSFORM YOUR LIFE?
        </h2>
        <p className="text-base md:text-lg lg:text-[1.2rem] mb-6 md:mb-8 opacity-90">
          Join FitStudio today and start your journey to a healthier, stronger you. First week free for all new members!
        </p>
        <Link
          href="#pricing"
          className="inline-flex items-center gap-2 md:gap-3 bg-[#0A0A0A] text-white px-8 md:px-12 py-4 md:py-5 font-semibold text-sm md:text-[1rem] uppercase tracking-widest transition-all duration-300 hover:-translate-y-0.75 hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)]"
        >
          Start Free Trial
          <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
        </Link>
      </div>
    </section>
  );
}
