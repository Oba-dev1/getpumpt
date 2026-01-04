import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';

const testimonials = [
  {
    quote: 'Joining FIT GYM was the best decision I made this year. Lost 15kg in 4 months and gained confidence I never knew I had. The trainers are incredible!',
    name: 'Chioma A.',
    role: 'Member since 2023',
  },
  {
    quote: 'The facilities are world-class and the community is amazing. I\'ve tried many gyms in Lagos, but nothing compares to the experience here.',
    name: 'Emeka O.',
    role: 'Premium Member',
  },
  {
    quote: 'As a busy executive, the 24/7 access and personal training sessions fit perfectly into my schedule. Worth every naira!',
    name: 'Aisha M.',
    role: 'VIP Member',
  },
];

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24 lg:py-32 bg-[#141414] relative overflow-hidden">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-4 md:mb-6">
            Success Stories
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4">
            WHAT OUR MEMBERS SAY
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            Real results from real people who transformed their lives with us.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#0A0A0A] border border-white/5 p-6 md:p-8 lg:p-10 relative"
            >
              <div className="text-3xl md:text-4xl lg:text-5xl text-[#6366F1] opacity-30 leading-none mb-3 md:mb-4">
                <FontAwesomeIcon icon={faQuoteLeft} />
              </div>
              <p className="text-base md:text-[1.1rem] leading-[1.8] mb-6 md:mb-8 text-[#A0A0A0]">
                {testimonial.quote}
              </p>
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[50px] bg-[#1E1E1E] flex items-center justify-center text-lg md:text-xl lg:text-2xl text-[#A0A0A0]">
                  <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                  <h4 className="text-sm md:text-[1rem] mb-0.5 md:mb-1">{testimonial.name}</h4>
                  <p className="text-[#A0A0A0] text-xs md:text-[0.85rem]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
