import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-40 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(99,102,241,0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(99,102,241,0.1)_0%,transparent_50%)]" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 container-custom w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text Content */}
          <div className="text-center lg:text-left order-2 lg:order-1">
            <span className="inline-block bg-[#6366F1]/10 border border-[#6366F1]/30 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[#6366F1] mb-10 rounded-md">
              Now Open in RiverPark Estate Abuja
            </span>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-10">
              TRANSFORM YOUR{' '}
              <span className="text-[#6366F1]">BODY</span>,{' '}
              ELEVATE YOUR{' '}
              <span className="text-[#6366F1]">LIFE</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-12 mx-auto lg:mx-0 leading-relaxed">
              Join the most advanced fitness facility in Abuja. State-of-the-art equipment, world-class trainers, and a community that pushes you to achieve your best.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16">
              <Link
                href="#pricing"
                className="inline-flex items-center justify-center gap-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-12 py-5 font-semibold text-base uppercase tracking-wider transition-all duration-200 rounded-md"
              >
                Start Your Journey
                <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
              </Link>
              <Link
                href="#schedule"
                className="inline-flex items-center justify-center bg-transparent hover:bg-white/5 text-white px-12 py-5 border-2 border-white/30 hover:border-white/50 font-semibold text-base uppercase tracking-wider transition-all duration-200 rounded-md"
              >
                View Classes
              </Link>
            </div>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start gap-12 md:gap-16 pt-12 border-t border-white/10">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#6366F1]">500+</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#6366F1]">15+</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">Trainers</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-[#6366F1]">50+</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">Classes/Week</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative flex justify-center items-center order-1 lg:order-2">
            <div className="relative w-80 sm:w-96 md:w-[450px] lg:w-[500px]">
              {/* Glow effect */}
              <div className="absolute -inset-8 bg-[#6366F1]/20 blur-3xl rounded-full" />

              {/* Image container */}
              <div className="relative w-full aspect-[3/4] rounded-2xl border border-white/10 overflow-hidden">
                <Image
                  src="https://res.cloudinary.com/dws3lnn4d/image/upload/v1767215000/woman-training-weightlifting-gym_rlaviu.jpg"
                  alt="Woman training with weights at FIT GYM"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
