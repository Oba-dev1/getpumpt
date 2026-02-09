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
    <section id="about" className="py-16 md:py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Image */}
          {aboutImageUrl && (
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 order-2 lg:order-1">
              <Image
                src={aboutImageUrl}
                alt={`About ${gymName}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/60 via-transparent to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="order-1 lg:order-2">
            <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))] mb-6 rounded-md">
              Our Story
            </span>
            <h2 className="font-['Bebas_Neue'] text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-6 text-white leading-tight">
              {title || `Welcome to ${gymName}`}
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed mb-8">
              {description}
            </p>

            {/* Stats */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-3 gap-8 pt-8 border-t border-white/10">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-3xl md:text-4xl font-bold text-[rgb(var(--gym-primary))] mb-2">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">
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
