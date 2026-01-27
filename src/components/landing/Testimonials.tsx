'use client'

import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faQuoteLeft } from '@fortawesome/free-solid-svg-icons'
import Image from 'next/image'
import type { Testimonial } from '@/types/gym'

interface TestimonialsProps {
  testimonials: Testimonial[]
}

export default function Testimonials({ testimonials = [] }: TestimonialsProps) {
  const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' });

  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[#141414] relative overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gym-primary))] mb-4 md:mb-6 rounded-md">
            Success Stories
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4 text-white">
            What Our Members Say
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            Real results from real people who transformed their lives with us.
          </p>
        </div>

        {/* Testimonials Carousel */}
        <div className="embla" ref={emblaRef}>
          <div className="embla__container">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="embla__slide">
                <div className="bg-[#0A0A0A] border border-white/5 p-6 md:p-8 lg:p-10 h-full flex flex-col justify-between rounded-lg mx-2">
                    <div>
                        <FontAwesomeIcon icon={faQuoteLeft} className="text-4xl text-[rgba(var(--gym-primary-rgb),0.5)] mb-4" />
                        <p className="text-base md:text-lg leading-relaxed text-[#A0A0A0] mb-6">
                            {testimonial.content}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 mt-auto">
                        {testimonial.imageUrl ? (
                            <Image
                                src={testimonial.imageUrl}
                                alt={testimonial.name}
                                width={50}
                                height={50}
                                className="rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-[#1E1E1E] rounded-full flex items-center justify-center text-xl text-[#A0A0A0]">
                                {testimonial.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h4 className="text-base md:text-lg font-semibold text-white">{testimonial.name}</h4>
                            {testimonial.role && <p className="text-sm text-[#A0A0A0]">{testimonial.role}</p>}
                        </div>
                        {testimonial.rating && (
                            <div className="ml-auto flex items-center gap-1 text-yellow-400">
                               <span>{testimonial.rating.toFixed(1)}</span>
                               <FontAwesomeIcon icon={faStar} />
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
  )
}