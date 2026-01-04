import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faDumbbell,
  faUsers,
  faMobileScreen,
  faAppleWhole,
  faShower,
  faClock
} from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

const features: Array<{
  icon: IconDefinition;
  title: string;
  description: string;
}> = [
  {
    icon: faDumbbell,
    title: 'PREMIUM EQUIPMENT',
    description: 'State-of-the-art machines and free weights from top brands. Everything maintained to perfection for your optimal workout.',
  },
  {
    icon: faUsers,
    title: 'EXPERT TRAINERS',
    description: 'Certified professionals who create personalized programs tailored to your goals, fitness level, and schedule.',
  },
  {
    icon: faMobileScreen,
    title: 'SMART TRACKING',
    description: 'Our digital platform tracks your progress, schedules classes, and keeps you motivated with insights and achievements.',
  },
  {
    icon: faAppleWhole,
    title: 'NUTRITION GUIDANCE',
    description: 'Complementary nutrition consultations to optimize your diet and accelerate your fitness results.',
  },
  {
    icon: faShower,
    title: 'LUXURY AMENITIES',
    description: 'Clean locker rooms, hot showers, sauna, and a relaxation lounge. Refresh and recover in comfort.',
  },
  {
    icon: faClock,
    title: '24/7 ACCESS',
    description: 'Work out on your schedule. Premium members enjoy round-the-clock access to all facilities.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 lg:py-32 bg-[#141414]">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-[#6366F1]/10 border border-[#6366F1]/30 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[#6366F1] mb-6 rounded">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
            EVERYTHING YOU NEED TO SUCCEED
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
              className="bg-[#0A0A0A] border border-white/5 p-8 rounded-lg transition-all duration-300 hover:-translate-y-1 hover:border-[#6366F1]/30 hover:shadow-xl group"
            >
              <div className="w-14 h-14 bg-[#6366F1]/10 rounded-lg flex items-center justify-center text-xl mb-6 text-[#6366F1] group-hover:bg-[#6366F1]/20 transition-colors">
                <FontAwesomeIcon icon={feature.icon} />
              </div>
              <h3 className="text-xl font-bold tracking-wide mb-3">
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
