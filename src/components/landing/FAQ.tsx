'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const defaultFAQs: FAQItem[] = [
  {
    question: 'What are your operating hours?',
    answer: 'We are open Monday-Friday 5:00 AM - 10:00 PM, Saturday-Sunday 7:00 AM - 8:00 PM. Holiday hours may vary.',
  },
  {
    question: 'Do you offer day passes or trial memberships?',
    answer: 'Yes, day passes are available for purchase at the front desk. We also offer a 3-day trial pass for first-time visitors to experience our facilities.',
  },
  {
    question: 'What is your cancellation policy?',
    answer: 'You can cancel your membership anytime with 30 days notice. No long-term contracts required. We believe in earning your membership every day.',
  },
  {
    question: 'Do I need to book classes in advance?',
    answer: 'Yes, we recommend booking classes through your member portal or mobile app to secure your spot. Classes can be booked up to 7 days in advance.',
  },
  {
    question: 'What amenities do you provide?',
    answer: 'We offer locker rooms with showers, towel service, free WiFi, complimentary toiletries, secure parking, and a smoothie bar. All amenities are included in your membership.',
  },
  {
    question: 'Can I freeze my membership if I travel?',
    answer: 'Yes, you can freeze your membership for up to 3 months per year. A small administrative fee applies. Submit freeze requests through your member portal.',
  },
];

interface FAQProps {
  faqs?: FAQItem[];
}

export default function FAQ({ faqs = defaultFAQs }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="bg-[#0F0F14] py-16 md:py-24 lg:py-32">
      <div className="container-custom max-w-4xl">
        <div className="mb-12 text-center md:mb-16">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            FAQ
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-400 md:text-lg">
            Everything you need to know about our gym and memberships.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.12]"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="group flex w-full items-center justify-between p-6 text-left"
                aria-expanded={openIndex === index}
              >
                <span className="pr-4 text-base font-semibold text-white transition-colors duration-300 group-hover:text-[rgb(var(--gym-primary))] md:text-lg">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-[rgb(var(--gym-primary))] transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6 leading-relaxed text-slate-400">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="mb-4 text-slate-400">Still have questions?</p>
          <a
            href="#contact"
            className="inline-block rounded-xl bg-[rgb(var(--gym-primary))] px-8 py-3.5 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
