'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useGym } from '@/contexts/GymContext';

const quickLinks = [
  { href: '#features', label: 'Features' },
  { href: '#pricing', label: 'Membership' },
  { href: '#schedule', label: 'Class Schedule' },
  { href: '#trainers', label: 'Our Trainers' },
  { href: '#contact', label: 'Contact Us' },
];

const programs = [
  { href: '#', label: 'Personal Training' },
  { href: '#', label: 'Group Classes' },
  { href: '#', label: 'Nutrition Plans' },
  { href: '#', label: 'Corporate Wellness' },
  { href: '#', label: 'Online Coaching' },
];

const support = [
  { href: '#', label: 'FAQs' },
  { href: '#', label: 'Help Center' },
  { href: '#', label: 'Membership Terms' },
  { href: '#', label: 'Cancellation Policy' },
  { href: '#', label: 'Careers' },
];

const socialIcons: Record<string, React.ReactNode> = {
  Facebook: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  ),
  Instagram: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  ),
  Twitter: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  ),
  YouTube: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  ),
  TikTok: (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
  ),
};

export default function Footer() {
  const { gym } = useGym();

  const socialLinks = [
    { href: gym?.facebook, label: 'Facebook' },
    { href: gym?.instagram, label: 'Instagram' },
    { href: gym?.twitter, label: 'Twitter' },
    { href: gym?.youtube, label: 'YouTube' },
    { href: gym?.tiktok, label: 'TikTok' },
  ].filter((link): link is { href: string; label: string } => !!link.href);

  return (
    <footer className="bg-[#0A0A0A] pb-6 pt-12 md:pb-8 md:pt-16 lg:pt-20">
      <div className="container-custom">
        <div className="mb-10 grid grid-cols-2 gap-8 md:mb-12 md:grid-cols-2 md:gap-10 lg:mb-16 lg:grid-cols-4 lg:gap-12">
          <div className="col-span-2 md:col-span-2 lg:col-span-1">
            <Link href="/" className="mb-5 flex items-center gap-2">
              {gym?.logo ? (
                <Image
                  src={gym.logo}
                  alt={gym.name}
                  width={100}
                  height={40}
                  className="h-10 w-auto object-contain md:h-12"
                />
              ) : (
                <span className="text-2xl font-bold text-white">{gym?.name}</span>
              )}
            </Link>
            <p className="mb-5 text-sm text-slate-400">
              {gym?.description || gym?.tagline || 'Transform your body, elevate your life.'}
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.02] text-slate-400 transition-all duration-300 hover:border-[rgb(var(--gym-primary))] hover:bg-[rgba(var(--gym-primary-rgb),0.1)] hover:text-[rgb(var(--gym-primary))]"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {socialIcons[social.label]}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-[rgb(var(--gym-primary))]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Programs
            </h4>
            <ul className="space-y-3">
              {programs.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-[rgb(var(--gym-primary))]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-5 text-sm font-bold uppercase tracking-wider text-white">
              Support
            </h4>
            <ul className="space-y-3">
              {support.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors duration-300 hover:text-[rgb(var(--gym-primary))]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 md:flex-row md:pt-8">
          <p className="text-xs text-slate-500 md:text-sm">
            &copy; {new Date().getFullYear()} {gym?.name}. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-slate-500 transition-colors duration-300 hover:text-[rgb(var(--gym-primary))] md:text-sm">
              Privacy Policy
            </Link>
            <Link href="#" className="text-xs text-slate-500 transition-colors duration-300 hover:text-[rgb(var(--gym-primary))] md:text-sm">
              Terms of Service
            </Link>
            <Link href="/login" className="text-xs text-slate-600 transition-colors duration-300 hover:text-slate-400">
              Staff Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
