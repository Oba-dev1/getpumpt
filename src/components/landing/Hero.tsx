'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useGym, type HeroContent } from '@/contexts/GymContext';

interface HeroProps {
  heroContent: HeroContent | null;
}

export default function Hero({ heroContent }: HeroProps) {
  const { gym } = useGym();
  if (!heroContent) {
    // Render a default or fallback hero if no content is provided
    return (
        <section className="relative min-h-screen flex items-center justify-center pt-40 pb-20 text-center bg-[#0A0A0A]">
            <h1 className="text-4xl text-white">Welcome to the Gym</h1>
        </section>
    );
  }

  const {
    badge,
    title,
    subtitle,
    ctaText,
    ctaLink,
    secondaryCtaText,
    secondaryCtaLink,
    backgroundImage,
    stats,
    videoUrl,
    showVideo,
  } = heroContent;

  const heroImageUrl = gym?.heroImageUrl || backgroundImage;
  const heroVideoUrl = gym?.videoUrl || videoUrl;
  const shouldShowVideo = showVideo && heroVideoUrl;

  return (
    <section className="relative min-h-screen flex items-center pt-40 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] to-[#1A1A1A]" />

      {/* Video Background (if enabled) */}
      {shouldShowVideo && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-30"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(var(--gym-primary-rgb),0.15)_0%,transparent_50%),radial-gradient(ellipse_at_80%_20%,rgba(var(--gym-primary-rgb),0.1)_0%,transparent_50%)]" />

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
            {badge && (
                <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-6 py-3 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))] mb-10 rounded-md">
                    {badge}
                </span>
            )}

            {title && <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-10 text-white" dangerouslySetInnerHTML={{ __html: title.replace(/,(.*?),/g, ',<span class="text-[rgb(var(--gym-primary))]">$1</span>,') }} />}

            {subtitle && (
                <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-12 mx-auto lg:mx-0 leading-relaxed">
                    {subtitle}
                </p>
            )}

            <div className="flex flex-col sm:flex-row gap-6 justify-center lg:justify-start mb-16">
              {ctaText && ctaLink && (
                <Link
                  href={ctaLink}
                  className="inline-flex items-center justify-center gap-3 bg-[rgb(var(--gym-primary))] hover:brightness-110 text-white px-12 py-5 font-semibold text-base uppercase tracking-wider transition-all duration-200 rounded-md"
                >
                  {ctaText}
                  <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
                </Link>
              )}
              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center bg-transparent hover:bg-white/5 text-white px-12 py-5 border-2 border-white/30 hover:border-white/50 font-semibold text-base uppercase tracking-wider transition-all duration-200 rounded-md"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
                <div className="flex justify-center lg:justify-start gap-12 md:gap-16 pt-12 border-t border-white/10">
                    {stats.map((stat, index) => (
                        <div key={index} className="text-center">
                            <div className="text-3xl md:text-4xl font-bold text-[rgb(var(--gym-primary))]">{stat.value}</div>
                            <div className="text-xs text-gray-500 uppercase tracking-wider mt-2">{stat.label}</div>
                        </div>
                    ))}
                </div>
            )}
          </div>

          {/* Visual */}
          <div className="relative flex justify-center items-center order-1 lg:order-2">
            <div className="relative w-80 sm:w-96 md:w-[450px] lg:w-[500px]">
              {/* Glow effect */}
              <div className="absolute -inset-8 bg-[rgba(var(--gym-primary-rgb),0.2)] blur-3xl rounded-full" />

              {/* Image container */}
              {heroImageUrl && (
                <div className="relative w-full aspect-[3/4] rounded-2xl border border-white/10 overflow-hidden">
                    <Image
                    src={heroImageUrl}
                    alt={title || 'Gym promotional image'}
                    fill
                    className="object-cover"
                    priority
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}