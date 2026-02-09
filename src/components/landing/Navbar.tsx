'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-2 bg-[#0A0A0A]/95 backdrop-blur-md border-b border-white/5'
          : 'py-3 bg-transparent'
      }`}
    >
      <div className="container-custom">
        <nav className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {gym?.logo ? (
              <Image
                src={gym.logo}
                alt={gym.name}
                width={80}
                height={40}
                className="h-8 md:h-10 w-auto"
                priority
              />
            ) : (
              <span className="text-2xl font-bold text-white">{gym?.name}</span>
            )}
          </Link>

          {/* Desktop Navigation - Centered */}
          <ul className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-gray-400 text-sm font-medium uppercase tracking-wider hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* CTA Buttons Group */}
          <div className="hidden lg:flex items-center gap-4">
            <Link
              href={`/gym/${gym?.slug}/login`}
              className="text-gray-400 hover:text-white px-6 py-3 text-sm font-medium uppercase tracking-wider transition-colors duration-200"
            >
              Member Login
            </Link>
            <Link
              href="#pricing"
              className="inline-flex items-center justify-center bg-[rgb(var(--gym-primary))] hover:brightness-110 text-white px-10 py-4 text-base font-semibold uppercase tracking-wider transition-all duration-200 rounded-md"
            >
              Join Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <FontAwesomeIcon icon={isMobileMenuOpen ? faXmark : faBars} className="text-xl" />
          </button>
        </nav>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-0 bg-[#0A0A0A] z-40">
          <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-white text-2xl font-bold uppercase tracking-wider"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/gym/${gym?.slug}/login`}
              className="text-gray-300 text-xl font-semibold uppercase tracking-wider"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Member Login
            </Link>
            <Link
              href="#pricing"
              className="mt-6 bg-[rgb(var(--gym-primary))] text-white px-10 py-4 text-sm font-semibold uppercase tracking-wider rounded"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Join Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
