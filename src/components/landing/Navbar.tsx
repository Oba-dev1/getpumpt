'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useGym } from '@/contexts/GymContext';

export default function Navbar() {
  const { gym } = useGym();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Membership' },
    { href: '#schedule', label: 'Schedule' },
    { href: '#trainers', label: 'Trainers' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#0A0A0A]/80 py-2 shadow-xl shadow-black/20 backdrop-blur-xl'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="container-custom">
        <nav
          className={`flex items-center justify-between ${
            isScrolled
              ? ''
              : 'rounded-2xl border border-white/[0.06] bg-white/[0.03] px-6 py-2 backdrop-blur-md'
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {gym?.logo ? (
              <Image
                src={gym.logo}
                alt={gym.name}
                width={80}
                height={40}
                className="h-8 w-auto md:h-10"
                priority
              />
            ) : (
              <span className="text-xl font-bold text-white">{gym?.name}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden items-center gap-1 lg:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-colors duration-200 hover:bg-white/[0.04] hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href={`/gym/${gym?.slug}/login`}
              className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-white"
            >
              Member Login
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center rounded-xl bg-[rgb(var(--gym-primary))] px-7 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-0 z-40 bg-[#0A0A0A]/98 backdrop-blur-xl lg:hidden">
          <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-2xl font-bold tracking-wide text-white transition-colors hover:text-[rgb(var(--gym-primary))]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col items-center gap-4">
              <Link
                href={`/gym/${gym?.slug}/login`}
                className="text-lg font-medium text-slate-400 transition-colors hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Member Login
              </Link>
              <Link
                href="#pricing"
                className="rounded-xl bg-[rgb(var(--gym-primary))] px-10 py-3.5 text-sm font-semibold text-white transition-all hover:brightness-110"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Join Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
