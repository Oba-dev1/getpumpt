'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, Search } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { NotificationBell } from './NotificationBell';

interface MemberHeaderProps {
  onMenuToggle: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/member': 'Dashboard',
  '/member/profile': 'Profile',
  '/member/membership': 'Membership',
  '/member/classes': 'Classes',
  '/member/bookings': 'My Bookings',
  '/member/payments': 'Payments',
  '/member/notifications': 'Notifications',
}

function getPageTitle(pathname: string) {
  const sorted = Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length)
  const matched = sorted.find((path) => pathname === path || pathname.startsWith(`${path}/`))
  return matched ? PAGE_TITLES[matched] : 'Member'
}

export default function MemberHeader({ onMenuToggle }: MemberHeaderProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname()
  const pageTitle = getPageTitle(pathname)

  const getInitials = () => {
    if (!session?.user?.name) return 'M';
    const names = session.user.name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return session.user.name[0].toUpperCase();
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-slate-950/90 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 lg:hidden"
            type="button"
            aria-label="Open navigation menu"
            onClick={onMenuToggle}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400">
              Member
            </p>
            <p className="text-base font-semibold text-white sm:text-lg">{pageTitle}</p>
          </div>
        </div>

        {/* Search bar */}
        <div className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-slate-500" aria-hidden="true" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full bg-transparent text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none"
            aria-label="Search member portal"
          />
        </div>

        <div className="flex items-center gap-2">
          {session?.user?.id && (
            <NotificationBell
              className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
            />
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="inline-flex h-auto items-center gap-2 rounded-xl border-white/10 bg-white/5 px-2 py-1.5 text-left text-sm text-slate-100 hover:bg-white/10"
                aria-label="Open member account menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || ''} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-400 text-[10px] font-semibold text-white">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-slate-200 sm:inline">{session?.user?.name || 'Member'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{session?.user?.name}</p>
                  <p className="text-xs text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/member/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/member')}>
                <span>Dashboard</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
