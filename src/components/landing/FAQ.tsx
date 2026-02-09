'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';

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
    <section id="faq" className="py-16 md:py-24 lg:py-32 bg-[#141414]">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block bg-[rgba(var(--gym-primary-rgb),0.1)] border border-[rgba(var(--gym-primary-rgb),0.3)] px-4 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))] mb-6 rounded-md">
            FAQ
          </span>
          <h2 className="font-['Bebas_Neue'] text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-4 text-white leading-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about our gym and memberships.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-[#0A0A0A] border border-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:border-white/10"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left group"
                aria-expanded={openIndex === index}
              >
                <span className="text-white font-semibold text-lg pr-4 group-hover:text-[rgb(var(--gym-primary))] transition-colors duration-300">
                  {faq.question}
                </span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className={`text-[rgb(var(--gym-primary))] transition-transform duration-300 flex-shrink-0 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6 text-gray-400 leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-4">Still have questions?</p>
          <a
            href="#contact"
            className="inline-block bg-[rgb(var(--gym-primary))] hover:brightness-110 text-white px-8 py-3 font-semibold uppercase tracking-wider transition-all duration-200 rounded-md"
          >
            Contact Us
          </a>
        </div>
      </div>
    </section>
  );
}
