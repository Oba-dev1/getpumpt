'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

export default function MemberSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/member') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="hidden lg:flex flex-col w-64 bg-indigo-900">
      <div className="flex items-center justify-center h-16 bg-indigo-950">
        <span className="text-white font-bold text-lg uppercase tracking-wide">
          Member Portal
        </span>
      </div>
      <nav className="flex-1 px-3 py-6 overflow-y-auto">
        <div className="space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${
                    active
                      ? 'bg-indigo-800 text-white'
                      : 'text-indigo-100 hover:bg-indigo-800/50 hover:text-white'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
