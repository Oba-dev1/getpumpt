'use client';

import Image from 'next/image';
import type { AboutContent } from '@/contexts/GymContext';

interface AboutProps {
  aboutContent: AboutContent | null;
  aboutImageUrl: string | null;
  gymName: string;
}

export default function About({ aboutContent, aboutImageUrl, gymName }: AboutProps) {
  if (!aboutContent && !aboutImageUrl) {
    return null;
  }

  const { title, description, stats } = aboutContent || {};

  return (
    <section id="about" className="relative overflow-hidden bg-[#0A0A0A] py-16 md:py-24 lg:py-32">
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-[rgba(var(--gym-primary-rgb),0.06)] blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {aboutImageUrl && (
            <div className="relative order-2 aspect-[4/3] overflow-hidden rounded-2xl border border-white/[0.06] shadow-2xl shadow-black/30 lg:order-1">
              <Image
                src={aboutImageUrl}
                alt={`About ${gymName}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
            </div>
          )}

          <div className="order-1 lg:order-2">
            <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
              Our Story
            </span>
            <h2 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-white lg:text-5xl">
              {title || `Welcome to ${gymName}`}
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-slate-400">
              {description}
            </p>

            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-6 border-t border-white/[0.06] pt-8">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="mb-1 text-3xl font-bold text-[rgb(var(--gym-primary))] md:text-4xl">
                      {stat.value}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-slate-500">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
