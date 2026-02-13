'use client';

import {
  Dumbbell,
  Users,
  Smartphone,
  Apple,
  ShowerHead,
  Clock,
  Shield,
  HeartPulse,
  Sparkles,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FeatureItem } from '@/types/gym';

const iconMap: Record<string, LucideIcon> = {
  faDumbbell: Dumbbell,
  faUsers: Users,
  faMobileScreen: Smartphone,
  faAppleWhole: Apple,
  faShower: ShowerHead,
  faClock: Clock,
  faShieldAlt: Shield,
  faHeartbeat: HeartPulse,
  faSpa: Sparkles,
};

interface FeaturesProps {
  features: FeatureItem[] | null;
}

export default function Features({ features }: FeaturesProps) {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <section id="features" className="relative overflow-hidden bg-[#0F0F14] py-20 md:py-28 lg:py-32">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-[rgba(var(--gym-primary-rgb),0.04)] blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            Why Choose Us
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-slate-400">
            Experience fitness like never before with our premium facilities, expert guidance, and supportive community.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, index) => {
            const Icon = iconMap[feature.icon] || Dumbbell;
            return (
              <div
                key={index}
                className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(var(--gym-primary-rgb),0.25)] hover:bg-white/[0.04] hover:shadow-xl hover:shadow-[rgba(var(--gym-primary-rgb),0.08)]"
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(var(--gym-primary-rgb),0.1)] text-[rgb(var(--gym-primary))] transition-colors duration-300 group-hover:bg-[rgba(var(--gym-primary-rgb),0.2)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold tracking-wide text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
