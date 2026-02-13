'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useGym } from '@/contexts/GymContext';

export default function CTA() {
  const { gym } = useGym();

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[rgb(var(--gym-primary))] to-[rgba(var(--gym-primary-rgb),0.7)] py-16 text-center md:py-24 lg:py-32">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="container-custom relative z-10">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
          Ready to Transform Your Life?
        </h2>
        <p className="mx-auto mb-8 max-w-2xl text-base text-white/90 md:text-lg">
          Join {gym?.name || 'us'} today and start your journey to a healthier, stronger you. First week free for all new members!
        </p>
        <Link
          href="#pricing"
          className="inline-flex items-center gap-3 rounded-xl bg-[#0A0A0A] px-10 py-4 text-sm font-semibold uppercase tracking-widest text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl hover:shadow-black/30 md:px-12 md:py-5"
        >
          Start Free Trial
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
