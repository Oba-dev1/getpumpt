'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDumbbell,
  faUsers,
  faMobileScreen,
  faAppleWhole,
  faShower,
  faClock,
  faShieldAlt,
  faHeartbeat,
  faSpa,
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import type { FeatureItem } from '@/types/gym';

const iconMap: { [key: string]: IconDefinition } = {
  faDumbbell,
  faUsers,
  faMobileScreen,
  faAppleWhole,
  faShower,
  faClock,
  faShieldAlt,
  faHeartbeat,
  faSpa,
};

interface FeaturesProps {
  features: FeatureItem[] | null;
}

export default function Features({ features }: FeaturesProps) {
    if (!features || features.length === 0) {
        return null;
    }

  return (
    <section id="features" className="py-20 md:py-28 lg:py-32 bg-[#141414]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))] mb-6 rounded-md">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4 text-white">
            Everything You Need to Succeed
          </h2>
          <p className="text-gray-400 text-lg">
            Experience fitness like never before with our premium facilities, expert guidance, and supportive community.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-[#0A0A0A] border border-white/5 p-8 rounded-lg transition-all duration-300 hover:-translate-y-2 hover:border-[rgba(var(--gym-primary-rgb),0.3)] hover:shadow-2xl hover:shadow-[rgba(var(--gym-primary-rgb),0.1)] group"
            >
              <div className="w-16 h-16 bg-[rgba(var(--gym-primary-rgb),0.1)] rounded-lg flex items-center justify-center text-2xl mb-6 text-[rgb(var(--gym-primary))] group-hover:bg-[rgba(var(--gym-primary-rgb),0.2)] transition-colors duration-300">
                <FontAwesomeIcon icon={iconMap[feature.icon] || faDumbbell} />
              </div>
              <h3 className="text-xl font-bold tracking-wide mb-3 text-white">
                {feature.title}
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}