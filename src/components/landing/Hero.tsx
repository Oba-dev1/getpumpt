'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useGym, type HeroContent } from '@/contexts/GymContext';

interface HeroProps {
  heroContent: HeroContent | null;
}

function renderHighlightedTitle(title: string) {
  const parts = title.split(/,(.*?),/g);
  return parts.map((part, index) =>
    index % 2 === 1 ? (
      <span key={`${part}-${index}`} className="text-[rgb(var(--gym-primary))]">
        {part}
      </span>
    ) : (
      <span key={`${part}-${index}`}>{part}</span>
    )
  );
}

export default function Hero({ heroContent }: HeroProps) {
  const { gym } = useGym();
  if (!heroContent) {
    return (
      <section className="relative flex min-h-screen items-center justify-center bg-[#0A0A0A] pb-20 pt-40 text-center">
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
    <section className="relative flex min-h-screen items-center overflow-hidden pb-20 pt-40">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0F0F1A] to-[#0A0A0A]" />

      {/* Video Background */}
      {shouldShowVideo && (
        <div className="absolute inset-0 overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover opacity-25"
          >
            <source src={heroVideoUrl} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Gradient orbs */}
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-[rgba(var(--gym-primary-rgb),0.12)] blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-1/4 h-80 w-80 rounded-full bg-[rgba(var(--gym-primary-rgb),0.08)] blur-3xl" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="container-custom relative z-10 w-full">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text Content */}
          <div className="order-2 text-center lg:order-1 lg:text-left">
            {badge && (
              <span className="mb-8 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))] backdrop-blur-sm">
                {badge}
              </span>
            )}

            {title && (
              <h1 className="mb-8 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                {renderHighlightedTitle(title)}
              </h1>
            )}

            {subtitle && (
              <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-400 md:text-xl lg:mx-0">
                {subtitle}
              </p>
            )}

            <div className="mb-14 flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
              {ctaText && ctaLink && (
                <Link
                  href={ctaLink}
                  className="inline-flex items-center justify-center gap-3 rounded-xl bg-[rgb(var(--gym-primary))] px-10 py-4 text-base font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-xl hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]"
                >
                  {ctaText}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center justify-center rounded-xl border-2 border-white/20 bg-white/[0.03] px-10 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-white/[0.06]"
                >
                  {secondaryCtaText}
                </Link>
              )}
            </div>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="flex justify-center gap-10 border-t border-white/[0.06] pt-10 md:gap-14 lg:justify-start">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-[rgb(var(--gym-primary))] md:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Visual */}
          <div className="relative order-1 flex items-center justify-center lg:order-2">
            <div className="relative w-80 sm:w-96 md:w-[450px] lg:w-[500px]">
              {/* Glow effect */}
              <div className="absolute -inset-8 rounded-full bg-[rgba(var(--gym-primary-rgb),0.15)] blur-3xl" />

              {/* Image container */}
              {heroImageUrl && (
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
                  <Image
                    src={heroImageUrl}
                    alt={title || 'Gym promotional image'}
                    fill
                    className="object-cover"
                    priority
                  />
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
