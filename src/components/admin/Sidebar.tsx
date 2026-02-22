'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard, Users, UserCheck, UsersRound, CreditCard, IdCard,
    Dumbbell, CalendarDays, ClipboardList, UserCog, Wallet, Bell,
    Settings, ExternalLink, X, ScrollText,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { ADMIN_NAV_ITEMS, hasPermission } from '@/lib/permissions';

const ICON_MAP: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    members: Users,
    checkin: UserCheck,
    staff: UsersRound,
    plans: CreditCard,
    plans2: IdCard,
    classes: Dumbbell,
    schedules: CalendarDays,
    bookings: ClipboardList,
    trainers: UserCog,
    payments: Wallet,
    notifications: Bell,
    activity: ScrollText,
    settings: Settings,
};

interface SidebarProps {
    isMobileOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const gymSlug = session?.user?.gymSlug;
    const userRole = session?.user?.role ?? '';

    const visibleNavItems = ADMIN_NAV_ITEMS.filter(
        (item) => hasPermission(userRole, item.requiredPermission)
    );

    const isRouteActive = (href: string) => {
        if (href === '/admin') {
            return pathname === '/admin'
        }

        return pathname === href || pathname.startsWith(`${href}/`)
    }

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
                aria-label="Admin navigation"
            >
                {/* Logo area */}
                <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-4">
                    <Link href="/admin" className="group inline-flex items-center gap-3" onClick={onClose}>
                        <Image
                            src="/FitStudio.png"
                            alt="FitStudio logo"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 p-1"
                            priority
                        />
                        <div>
                            <p className="text-sm font-bold tracking-wide text-white">FitStudio</p>
                            <p className="text-[11px] text-slate-400">Admin Portal</p>
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
                        {visibleNavItems.map((item) => {
                            const isActive = isRouteActive(item.href)
                            const Icon = ICON_MAP[item.iconKey]

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${isActive
                                            ? 'bg-indigo-500/15 text-white shadow-sm'
                                            : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                                            }`}
                                    >
                                        {Icon && (
                                            <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                        )}
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    {gymSlug && (
                        <div className="mt-6 border-t border-white/[0.06] pt-4">
                            <a
                                href={`/gym/${gymSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-indigo-400 transition-all duration-200 hover:bg-indigo-500/10 hover:text-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                            >
                                <ExternalLink className="h-[18px] w-[18px] text-indigo-400 group-hover:text-indigo-300" />
                                <span>View Website</span>
                            </a>
                        </div>
                    )}
                </nav>
            </aside>
        </>
    );
}
