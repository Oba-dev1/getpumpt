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
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out lg:sticky lg:z-20 lg:w-64 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Member navigation"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
          <Link href="/member" className="group inline-flex items-center gap-3" onClick={onClose}>
            <Image
              src="/FitStudio.png"
              alt="FitStudio logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-md border border-white/20 bg-white/5 p-1"
              priority
            />
            <div>
              <p className="text-sm font-semibold tracking-wide text-cyan-300">FitStudio</p>
              <p className="text-xs text-slate-300">Member Portal</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
            aria-label="Close sidebar"
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4" aria-label="Main">
          <ul className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.href);

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onClose}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${
                      active
                        ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.25)]'
                        : 'text-slate-200 hover:bg-white/8 hover:text-white'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${active ? 'text-cyan-300' : 'text-slate-300 group-hover:text-cyan-200'}`} />
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
