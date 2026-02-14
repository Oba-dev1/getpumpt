'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ExternalLink, Menu, Search } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface HeaderProps {
  onMenuToggle: () => void
}

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/members': 'Members',
  '/admin/membership-plans': 'Membership Plans',
  '/admin/plans': 'Plans',
  '/admin/classes': 'Classes',
  '/admin/schedules': 'Schedules',
  '/admin/bookings': 'Bookings',
  '/admin/trainers': 'Trainers',
  '/admin/payments': 'Payments',
  '/admin/settings': 'Settings',
  '/admin/notifications': 'Notifications',
  '/admin/staff': 'Staff',
  '/admin/check-in': 'Check In',
  '/admin/activity-log': 'Activity Log',
}

function getPageTitle(pathname: string) {
  const sorted = Object.keys(PAGE_TITLES).sort((a, b) => b.length - a.length)
  const matched = sorted.find((path) => pathname === path || pathname.startsWith(`${path}/`))
  return matched ? PAGE_TITLES[matched] : 'Admin'
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const pageTitle = getPageTitle(pathname)
  const notificationHref = '/admin/notifications'
  const hasNotificationsPage = pathname.startsWith(notificationHref)

  const initials = (() => {
    const name = session?.user?.name
    if (!name) return 'AD'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
  })()

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
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-indigo-400">Admin</p>
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
            aria-label="Search dashboard"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="relative h-9 w-9 rounded-xl border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <Link
              href={notificationHref}
              aria-label="Open notifications"
              aria-current={hasNotificationsPage ? 'page' : undefined}
            >
              <Bell className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-indigo-500" aria-hidden="true" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="inline-flex h-auto items-center gap-2 rounded-xl border-white/10 bg-white/5 px-2 py-1.5 text-left text-sm text-slate-100 hover:bg-white/10"
                aria-label="Open user account menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={session?.user?.image || ''} alt={session?.user?.name || 'Admin'} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-600 to-indigo-400 text-[10px] font-semibold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-[140px] truncate text-slate-200 sm:inline">
                  {session?.user?.name || 'Admin'}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium text-slate-900">{session?.user?.name || 'Admin'}</p>
                <p className="text-xs text-slate-500">{session?.user?.email || 'admin@fitstudio.com'}</p>
              </div>
              <DropdownMenuSeparator />
              {session?.user?.gymSlug && (
                <DropdownMenuItem asChild>
                  <a
                    href={`/gym/${session.user.gymSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    View Website
                  </a>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin')}>
                Dashboard
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-red-600 focus:text-red-600"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
