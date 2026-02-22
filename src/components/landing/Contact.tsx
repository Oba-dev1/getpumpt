'use client';

import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';

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

  const inputClasses = 'w-full rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 text-sm text-white backdrop-blur-sm transition-all duration-300 focus:border-[rgb(var(--gym-primary))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--gym-primary-rgb),0.3)] md:p-4 md:text-base';

  return (
    <section id="contact" className="bg-[#0A0A0A] py-16 md:py-24 lg:py-32">
      <div className="container-custom">
        <div className="mx-auto mb-12 max-w-3xl text-center md:mb-16 lg:mb-20">
          <span className="mb-6 inline-block rounded-full border border-[rgba(var(--gym-primary-rgb),0.3)] bg-[rgba(var(--gym-primary-rgb),0.1)] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-[rgb(var(--gym-primary))]">
            Get In Touch
          </span>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Start Your Fitness Journey Today
          </h2>
          <p className="text-base text-slate-400 md:text-lg">
            Visit us or send a message. We&apos;re here to help you achieve your goals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <h3 className="mb-6 text-xl font-bold text-white md:mb-8 md:text-2xl">
              Contact Information
            </h3>

            <div className="mb-8 space-y-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--gym-primary-rgb),0.1)] text-[rgb(var(--gym-primary))]">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white">Location</h4>
                  <p className="text-sm text-slate-400">
                    123 Fitness Avenue, RiverPark Estate<br />
                    Abuja, Nigeria
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--gym-primary-rgb),0.1)] text-[rgb(var(--gym-primary))]">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white">Phone</h4>
                  <p className="text-sm text-slate-400">
                    +234 801 234 5678<br />
                    +234 802 345 6789
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[rgba(var(--gym-primary-rgb),0.1)] text-[rgb(var(--gym-primary))]">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="mb-1 text-sm font-semibold text-white">Email</h4>
                  <p className="text-sm text-slate-400">
                    info@fitgym.ng<br />
                    support@fitgym.ng
                  </p>
                </div>
              </div>
            </div>

            <h4 className="mb-4 text-lg font-bold text-white">Opening Hours</h4>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {hours.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-sm"
                >
                  <span className="text-slate-400">{item.day}</span>
                  <span className="font-semibold text-white">{item.time}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm md:p-8 lg:p-10">
            <h3 className="mb-6 text-xl font-bold text-white md:mb-8 md:text-2xl">
              Send Us a Message
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  I&apos;m Interested In
                </label>
                <select
                  name="interest"
                  value={formData.interest}
                  onChange={handleChange}
                  className={inputClasses}
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
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className={`${inputClasses} min-h-[120px] resize-y`}
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[rgb(var(--gym-primary))] py-4 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]"
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
