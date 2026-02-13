'use client';

import Image from 'next/image';
import { User, ChevronRight } from 'lucide-react';
import type { Trainer } from '@/types/gym';

interface TrainersProps {
  trainers: Trainer[];
}

export default function Trainers({ trainers = [] }: TrainersProps) {
  return (
    <section id="trainers" className="bg-[#0A0A0A] py-16 md:py-24 lg:py-32">
      <div className="container-custom">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16 lg:mb-20">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            Meet The Team
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Expert Trainers at Your Service
          </h2>
          <p className="text-base text-slate-400 md:text-lg">
            Our certified professionals are dedicated to helping you achieve your fitness goals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {trainers.map((trainer) => (
            <div
              key={trainer.id}
              className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(var(--gym-primary-rgb),0.25)] hover:shadow-xl hover:shadow-[rgba(var(--gym-primary-rgb),0.08)]"
            >
              <div className="relative aspect-square w-full overflow-hidden">
                {trainer.imageUrl ? (
                  <Image
                    src={trainer.imageUrl}
                    alt={`${trainer.firstName} ${trainer.lastName}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#1E1E1E] to-[#0A0A0A]">
                    <User className="h-16 w-16 text-white/10" />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
              </div>

              <div className="p-5 md:p-6">
                <h3 className="mb-1 text-xl font-bold text-white md:text-2xl">
                  {trainer.firstName} {trainer.lastName}
                </h3>
                {trainer.specialties && trainer.specialties.length > 0 && (
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[rgb(var(--gym-primary))] md:text-sm">
                    {trainer.specialties.join(', ')}
                  </p>
                )}
                <p className="mb-4 h-20 overflow-hidden text-sm text-slate-400">
                  {trainer.bio}
                </p>
                <a
                  href={`/trainers/${trainer.id}`}
                  className="flex items-center gap-2 text-sm font-semibold text-white transition-colors duration-300 group-hover:text-[rgb(var(--gym-primary))]"
                >
                  View Profile
                  <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
