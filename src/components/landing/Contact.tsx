'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';

const hours = [
  { day: 'Mon - Fri', time: '5AM - 11PM' },
  { day: 'Saturday', time: '6AM - 10PM' },
  { day: 'Sunday', time: '7AM - 9PM' },
  { day: 'Holidays', time: '8AM - 6PM' },
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission via API
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-16 md:py-24 lg:py-32">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <span className="inline-block bg-[rgba(99,102,241,0.1)] border border-[rgba(99,102,241,0.3)] px-3 md:px-4 py-2 text-[0.7rem] md:text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[#6366F1] mb-4 md:mb-6">
            Get In Touch
          </span>
          <h2 className="font-['Bebas_Neue'] text-3xl md:text-4xl lg:text-[4.5rem] tracking-[0.02em] mb-3 md:mb-4">
            START YOUR FITNESS JOURNEY TODAY
          </h2>
          <p className="text-[#A0A0A0] text-base md:text-[1.1rem]">
            Visit us or send a message. We&apos;re here to help you achieve your goals.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
          {/* Contact Info */}
          <div>
            <h3 className="font-['Bebas_Neue'] text-xl md:text-2xl lg:text-[2rem] tracking-[0.05em] mb-6 md:mb-8">
              CONTACT INFORMATION
            </h3>

            {/* Contact Items */}
            <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[50px] bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#6366F1] text-base md:text-lg lg:text-[1.2rem] shrink-0">
                  <FontAwesomeIcon icon={faLocationDot} />
                </div>
                <div>
                  <h4 className="text-sm md:text-[1rem] mb-1">Location</h4>
                  <p className="text-[#A0A0A0] text-sm md:text-[0.95rem]">
                    123 Fitness Avenue, RiverPark Estate<br />
                    Abuja, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[50px] bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#6366F1] text-base md:text-lg lg:text-[1.2rem] shrink-0">
                  <FontAwesomeIcon icon={faPhone} />
                </div>
                <div>
                  <h4 className="text-sm md:text-[1rem] mb-1">Phone</h4>
                  <p className="text-[#A0A0A0] text-sm md:text-[0.95rem]">
                    +234 801 234 5678<br />
                    +234 802 345 6789
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 md:gap-4">
                <div className="w-10 h-10 md:w-12 md:h-12 lg:w-[50px] lg:h-[50px] bg-[rgba(99,102,241,0.1)] flex items-center justify-center text-[#6366F1] text-base md:text-lg lg:text-[1.2rem] shrink-0">
                  <FontAwesomeIcon icon={faEnvelope} />
                </div>
                <div>
                  <h4 className="text-sm md:text-[1rem] mb-1">Email</h4>
                  <p className="text-[#A0A0A0] text-sm md:text-[0.95rem]">
                    info@fitgym.ng<br />
                    support@fitgym.ng
                  </p>
                </div>
              </div>
            </div>

            {/* Hours Grid */}
            <h4 className="font-['Bebas_Neue'] text-lg md:text-xl lg:text-[1.3rem] tracking-[0.05em] mb-3 md:mb-4">
              OPENING HOURS
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
              {hours.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between p-2 md:p-3 bg-[#141414] border border-white/5 text-sm md:text-base"
                >
                  <span className="text-[#A0A0A0]">{item.day}</span>
                  <span>{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-[#141414] border border-white/5 p-6 md:p-8 lg:p-12">
            <h3 className="font-['Bebas_Neue'] text-xl md:text-2xl lg:text-[2rem] tracking-[0.05em] mb-6 md:mb-8">
              SEND US A MESSAGE
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div>
                <label className="block text-[0.75rem] md:text-[0.85rem] uppercase tracking-[0.1em] text-[#A0A0A0] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-white/10 p-3 md:p-4 text-white font-sans text-sm md:text-[1rem] transition-colors duration-300 focus:outline-none focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.75rem] md:text-[0.85rem] uppercase tracking-[0.1em] text-[#A0A0A0] mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-white/10 p-3 md:p-4 text-white font-sans text-sm md:text-[1rem] transition-colors duration-300 focus:outline-none focus:border-[#6366F1]"
                  required
                />
              </div>

              <div>
                <label className="block text-[0.75rem] md:text-[0.85rem] uppercase tracking-[0.1em] text-[#A0A0A0] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-white/10 p-3 md:p-4 text-white font-sans text-sm md:text-[1rem] transition-colors duration-300 focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block text-[0.75rem] md:text-[0.85rem] uppercase tracking-[0.1em] text-[#A0A0A0] mb-2">
                  I&apos;m Interested In
                </label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className="w-full bg-[#0A0A0A] border border-white/10 p-3 md:p-4 text-white font-sans text-sm md:text-[1rem] transition-colors duration-300 focus:outline-none focus:border-[#6366F1]"
                >
                  <option value="">Select an option</option>
                  <option value="basic">Basic Membership</option>
                  <option value="premium">Premium Membership</option>
                  <option value="vip">VIP Membership</option>
                  <option value="personal-training">Personal Training</option>
                  <option value="group-classes">Group Classes</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[0.75rem] md:text-[0.85rem] uppercase tracking-[0.1em] text-[#A0A0A0] mb-2">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full bg-[#0A0A0A] border border-white/10 p-3 md:p-4 text-white font-sans text-sm md:text-[1rem] transition-colors duration-300 focus:outline-none focus:border-[#6366F1] resize-y min-h-[100px] md:min-h-[120px]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#6366F1] text-white py-4 md:py-5 font-semibold text-sm md:text-[1rem] uppercase tracking-[0.1em] transition-colors duration-300 hover:bg-[#4F46E5]"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
