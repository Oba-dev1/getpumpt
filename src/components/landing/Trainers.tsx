'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import type { Trainer } from '@/types/gym';

interface TrainersProps {
  trainers: Trainer[];
}

export default function Trainers({ trainers = [] }: TrainersProps) {
  return (
    <section id="trainers" className="py-16 md:py-24 lg:py-32 bg-[#0A0A0A]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gym-primary))] mb-4 md:mb-6 rounded-md">
            Meet The Team
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4 text-white">
            Expert Trainers at Your Service
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            Our certified professionals are dedicated to helping you achieve your fitness goals.
          </p>
        </div>

        {/* Trainers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="bg-[#141414] border border-white/5 rounded-lg overflow-hidden group transition-all duration-400 hover:border-[rgba(var(--gym-primary-rgb),0.3)] hover:-translate-y-2.5 hover:shadow-2xl hover:shadow-[rgba(var(--gym-primary-rgb),0.1)]"
            >
              {/* Image */}
              <div className="w-full aspect-square relative overflow-hidden">
                {trainer.imageUrl ? (
                    <Image
                        src={trainer.imageUrl}
                        alt={`${trainer.firstName} ${trainer.lastName}`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A] flex items-center justify-center">
                        <FontAwesomeIcon icon={faUser} className="text-6xl text-white/10" />
                    </div>
                )}
                <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#141414] to-transparent" />
              </div>

              {/* Info */}
              <div className="p-4 md:p-5 lg:p-6">
                <h3 className="font-['Bebas_Neue'] text-xl md:text-2xl text-white tracking-[0.05em] mb-1">
                  {trainer.firstName} {trainer.lastName}
                </h3>
                {trainer.specialties && trainer.specialties.length > 0 && (
                    <p className="text-[rgb(var(--gym-primary))] text-xs md:text-sm font-semibold uppercase tracking-wider mb-3">
                        {trainer.specialties.join(', ')}
                    </p>
                )}
                <p className="text-[#A0A0A0] text-sm md:text-[0.9rem] mb-4 h-20 overflow-hidden">
                  {trainer.bio}
                </p>
                <a href={`/trainers/${trainer.id}`} className="font-semibold text-sm text-white group-hover:text-[rgb(var(--gym-primary))] transition-colors duration-300 flex items-center gap-2">
                    View Profile
                    <FontAwesomeIcon icon={faChevronRight} className="transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}