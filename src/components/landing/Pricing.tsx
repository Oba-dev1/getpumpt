import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

const plans = [
  {
    name: 'BASIC',
    description: 'Perfect for getting started on your fitness journey',
    price: '25,000',
    features: [
      'Access to gym floor',
      'Basic equipment usage',
      'Locker room access',
      '2 group classes/week',
      'Fitness assessment',
    ],
    featured: false,
  },
  {
    name: 'PREMIUM',
    description: 'Our most popular choice for serious fitness enthusiasts',
    price: '45,000',
    features: [
      'Full gym access 24/7',
      'All equipment & classes',
      'Personal training (2x/month)',
      'Nutrition consultation',
      'Sauna & spa access',
      'Guest passes (2/month)',
    ],
    featured: true,
  },
  {
    name: 'VIP',
    description: 'The ultimate experience for dedicated athletes',
    price: '75,000',
    features: [
      'Everything in Premium',
      'Unlimited personal training',
      'Priority class booking',
      'Private locker',
      'Complimentary supplements',
      'Unlimited guest passes',
    ],
    featured: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(99,102,241,0.1)_0%,transparent_60%)]" />

      <div className="relative z-10 container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-4 md:mb-6">
            Membership Plans
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4">
            CHOOSE YOUR PATH TO FITNESS
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            Flexible plans designed to fit your lifestyle and goals. No hidden fees, no long-term contracts.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-[#141414] border p-6 md:p-8 lg:p-12 relative transition-all duration-400 ${
                plan.featured
                  ? 'border-[#6366F1] lg:scale-105'
                  : 'border-white/5 hover:border-[rgba(99,102,241,0.3)]'
              } hover:-translate-y-2.5`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#6366F1] px-4 md:px-6 py-1.5 md:py-2 text-[0.65rem] md:text-[0.75rem] font-semibold uppercase tracking-widest whitespace-nowrap">
                  Most Popular
                </div>
              )}

              <h3 className="font-['Bebas_Neue'] text-xl md:text-2xl lg:text-[1.8rem] tracking-[0.05em] mb-1 md:mb-2">
                {plan.name}
              </h3>
              <p className="text-[#A0A0A0] text-sm md:text-[0.9rem] mb-6 md:mb-8">
                {plan.description}
              </p>

              <div className="flex items-baseline gap-1 md:gap-2 mb-6 md:mb-8">
                <span className="text-lg md:text-xl lg:text-[1.5rem] text-[#A0A0A0]">₦</span>
                <span className="font-['Bebas_Neue'] text-4xl md:text-5xl lg:text-[4rem] text-[#6366F1] leading-none">
                  {plan.price}
                </span>
                <span className="text-[#A0A0A0] text-sm md:text-[0.9rem]">/month</span>
              </div>

              <ul className="list-none mb-6 md:mb-8 lg:mb-10">
                {plan.features.map((feature, featureIndex) => (
                  <li
                    key={featureIndex}
                    className="py-2 md:py-3 border-b border-white/5 flex items-center gap-2 md:gap-3 text-sm md:text-[0.95rem]"
                  >
                    <FontAwesomeIcon icon={faCheck} className="text-[#6366F1] text-sm" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 md:py-4 font-semibold text-sm md:text-[0.9rem] uppercase tracking-widest transition-all duration-300 ${
                  plan.featured
                    ? 'bg-[#6366F1] text-white border-2 border-[#6366F1] hover:bg-[#4F46E5]'
                    : 'bg-transparent border-2 border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1] hover:text-white'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
