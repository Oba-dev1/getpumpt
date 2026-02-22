'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  LayoutDashboard,
  User,
  CreditCard,
  Dumbbell,
  ClipboardList,
  Wallet,
  Bell,
  X,
} from 'lucide-react';

const navLinks = [
  { href: '/member', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/member/profile', label: 'Profile', icon: User },
  { href: '/member/membership', label: 'Membership', icon: CreditCard },
  { href: '/member/classes', label: 'Classes', icon: Dumbbell },
  { href: '/member/bookings', label: 'My Bookings', icon: ClipboardList },
  { href: '/member/payments', label: 'Payments', icon: Wallet },
  { href: '/member/notifications', label: 'Notifications', icon: Bell },
];

interface MemberSidebarProps {
  isMobileOpen: boolean
  onClose: () => void
}

export default function MemberSidebar({ isMobileOpen, onClose }: MemberSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/member') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {isMobileOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          aria-label="Close navigation menu"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/[0.06] bg-slate-950 text-slate-100 shadow-2xl transition-transform duration-300 ease-out lg:sticky lg:z-20 lg:w-64 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Member navigation"
      >
        {/* Logo area */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
          <Link href="/member" className="group inline-flex items-center gap-3" onClick={onClose}>
            <Image
              src="/FitStudio.png"
              alt="FitStudio logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 p-1"
              priority
            />
            <div>
              <p className="text-sm font-bold tracking-wide text-white">FitStudio</p>
              <p className="text-[11px] text-slate-400">Member Portal</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Main">
          <ul className="space-y-0.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      active
                        ? 'bg-indigo-500/15 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                    <span>{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
