'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Quote, Star } from 'lucide-react';
import Image from 'next/image';
import type { Testimonial } from '@/types/gym';

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  return (
    <section className="relative overflow-hidden bg-[#0F0F14] py-16 md:py-24 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[rgba(var(--gym-primary-rgb),0.04)] blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16 lg:mb-20">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            Success Stories
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            What Our Members Say
          </h2>
          <p className="text-base text-slate-400 md:text-lg">
            Real results from real people who transformed their lives with us.
          </p>
        </div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="embla__slide">
                <div className="mx-2 flex h-full flex-col justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm md:p-8 lg:p-10">
                  <div>
                    <Quote className="mb-4 h-8 w-8 text-[rgba(var(--gym-primary-rgb),0.4)]" />
                    <p className="mb-6 text-base leading-relaxed text-slate-400 md:text-lg">
                      {testimonial.content}
                    </p>
                  </div>
                  <div className="mt-auto flex items-center gap-4">
                    {testimonial.imageUrl ? (
                      <Image
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(var(--gym-primary-rgb),0.1)] text-lg font-semibold text-[rgb(var(--gym-primary))]">
                        {testimonial.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-base font-semibold text-white md:text-lg">{testimonial.name}</h4>
                      {testimonial.role && <p className="text-sm text-slate-500">{testimonial.role}</p>}
                    </div>
                    {testimonial.rating && (
                      <div className="ml-auto flex items-center gap-1 text-amber-400">
                        <span className="text-sm font-semibold">{testimonial.rating.toFixed(1)}</span>
                        <Star className="h-4 w-4 fill-current" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
