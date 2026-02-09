'use client';
import { useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import type { MembershipPlan } from '@/types/gym';
import { Switch } from '@/components/ui/switch'; // Assuming you have a switch component
import { useGym } from '@/contexts/GymContext';

interface PricingProps {
  plans: MembershipPlan[];
}

export default function Pricing({ plans = [] }: PricingProps) {
  const { gym } = useGym();
  const [isYearly, setIsYearly] = useState(false);

  // Format currency
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 bg-[#0A0A0A] relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(var(--gym-primary-rgb),0.1)_0%,transparent_60%)]" />

      <div className="relative z-10 container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--gym-primary))] mb-4 md:mb-6 rounded-md">
            Membership Plans
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4 text-white">
            Choose Your Path to Fitness
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            Flexible plans designed to fit your lifestyle and goals. No hidden fees, no long-term contracts.
          </p>
        </div>

        {/* Monthly/Yearly Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-semibold transition-colors ${!isYearly ? 'text-white' : 'text-[#A0A0A0]'}`}>
            Monthly
          </span>
          <Switch checked={isYearly} onCheckedChange={setIsYearly} />
          <span className={`font-semibold transition-colors ${isYearly ? 'text-white' : 'text-[#A0A0A0]'}`}>
            Yearly
            <span className="ml-2 bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">SAVE 20%</span>
          </span>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-[#141414] border rounded-lg p-6 md:p-8 lg:p-12 relative transition-all duration-400 flex flex-col ${
                plan.isFeatured
                  ? 'border-[rgb(var(--gym-primary))] lg:scale-105 shadow-2xl shadow-[rgba(var(--gym-primary-rgb),0.2)]'
                  : 'border-white/5 hover:border-[rgba(var(--gym-primary-rgb),0.3)]'
              } hover:-translate-y-2.5`}
            >
              {plan.isFeatured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[rgb(var(--gym-primary))] px-4 md:px-6 py-1.5 md:py-2 text-[0.65rem] md:text-[0.75rem] font-semibold uppercase tracking-widest whitespace-nowrap rounded-full text-white">
                  Most Popular
                </div>
              )}

              <div className="flex-grow">
                <h3 className="font-['Bebas_Neue'] text-xl md:text-2xl lg:text-[1.8rem] tracking-[0.05em] mb-1 md:mb-2 text-white">
                  {plan.name}
                </h3>
                <p className="text-[#A0A0A0] text-sm md:text-[0.9rem] mb-6 md:mb-8 min-h-[40px]">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 md:gap-2 mb-6 md:mb-8">
                  <span className="text-4xl md:text-5xl lg:text-[4rem] text-[rgb(var(--gym-primary))] leading-none font-['Bebas_Neue']">
                    {formatPrice(isYearly ? plan.price * 12 * 0.8 : plan.price, plan.currency)}
                  </span>
                  <span className="text-[#A0A0A0] text-sm md:text-[0.9rem]">
                    /{isYearly ? 'year' : 'month'}
                  </span>
                </div>

                <ul className="list-none mb-6 md:mb-8 lg:mb-10 space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="flex items-center gap-2 md:gap-3 text-sm md:text-[0.95rem] text-[#A0A0A0]"
                    >
                      <FontAwesomeIcon icon={faCheck} className="text-[rgb(var(--gym-primary))] text-sm" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href={`/gym/${gym?.slug}/register`}
                className={`w-full mt-auto py-3 md:py-4 font-semibold text-sm md:text-[0.9rem] uppercase tracking-widest transition-all duration-300 rounded-md flex items-center justify-center ${
                  plan.isFeatured
                    ? 'bg-[rgb(var(--gym-primary))] text-white border-2 border-[rgb(var(--gym-primary))] hover:brightness-110'
                    : 'bg-transparent border-2 border-[rgb(var(--gym-primary))] text-[rgb(var(--gym-primary))] hover:bg-[rgb(var(--gym-primary))] hover:text-white'
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