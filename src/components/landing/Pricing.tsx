'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check } from 'lucide-react';
import type { MembershipPlan } from '@/types/gym';
import { Switch } from '@/components/ui/switch';
import { useGym } from '@/contexts/GymContext';

interface PricingProps {
  plans: MembershipPlan[];
}

export default function Pricing({ plans = [] }: PricingProps) {
  const { gym } = useGym();
  const [isYearly, setIsYearly] = useState(false);

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="pricing" className="relative overflow-hidden bg-[#0A0A0A] py-16 md:py-24 lg:py-32">
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-[rgba(var(--gym-primary-rgb),0.06)] blur-3xl" />

      <div className="container-custom relative z-10">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16 lg:mb-20">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            Membership Plans
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Choose Your Path to Fitness
          </h2>
          <p className="text-base text-slate-400 md:text-lg">
            Flexible plans designed to fit your lifestyle and goals. No hidden fees, no long-term contracts.
          </p>
        </div>

        <div className="mb-12 flex items-center justify-center gap-4">
          <span className={`font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-slate-500'}`}>
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`font-semibold transition-colors ${isYearly ? 'text-white' : 'text-slate-500'}`}>
            Yearly
            <span className="ml-2 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-400">
              SAVE 20%
            </span>
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`group relative flex flex-col rounded-2xl border p-6 transition-all duration-300 md:p-8 lg:p-10 ${
                plan.isFeatured
                  ? 'border-[rgb(var(--gym-primary))] bg-[rgba(var(--gym-primary-rgb),0.05)] shadow-2xl shadow-[rgba(var(--gym-primary-rgb),0.15)] lg:scale-105'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-[rgba(var(--gym-primary-rgb),0.25)]'
              } hover:-translate-y-1`}
            >
              {plan.isFeatured && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[rgb(var(--gym-primary))] px-5 py-1.5 text-xs font-semibold uppercase tracking-widest text-white">
                  Most Popular
                </div>
              )}

              <div className="flex-grow">
                <h3 className="mb-2 text-xl font-bold text-white md:text-2xl">
                  {plan.name}
                </h3>
                <p className="mb-6 min-h-[40px] text-sm text-slate-400 md:mb-8">
                  {plan.description}
                </p>

                <div className="mb-6 flex items-baseline gap-1 md:mb-8">
                  <span className="text-4xl font-bold text-[rgb(var(--gym-primary))] md:text-5xl">
                    {formatPrice(isYearly ? plan.price * 12 * 0.8 : plan.price, plan.currency)}
                  </span>
                  <span className="text-sm text-slate-500">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>

                <ul className="mb-8 space-y-3 lg:mb-10">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-3 text-sm text-slate-300"
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(var(--gym-primary-rgb),0.15)]">
                        <Check className="h-3 w-3 text-[rgb(var(--gym-primary))]" />
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/gym/${gym?.slug}/register`}
                className={`mt-auto flex w-full items-center justify-center rounded-xl border-2 py-3.5 text-sm font-semibold uppercase tracking-wider transition-all duration-300 md:py-4 ${
                  plan.isFeatured
                    ? 'border-[rgb(var(--gym-primary))] bg-[rgb(var(--gym-primary))] text-white hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]'
                    : 'border-[rgba(var(--gym-primary-rgb),0.4)] text-[rgb(var(--gym-primary))] hover:border-[rgb(var(--gym-primary))] hover:bg-[rgb(var(--gym-primary))] hover:text-white'
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
