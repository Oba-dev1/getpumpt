'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faTachometerAlt, faUsers, faIdCard, faCalendarAlt, faDumbbell,
    faClipboardList, faUserTie, faWallet, faCog, faTimes, faBell,
    faExternalLinkAlt, faUsersGear, faUserCheck,
    type IconDefinition,
} from '@fortawesome/free-solid-svg-icons';
import { useSession } from 'next-auth/react';
import { ADMIN_NAV_ITEMS, hasPermission } from '@/lib/permissions';

const ICON_MAP: Record<string, IconDefinition> = {
    dashboard: faTachometerAlt,
    members: faUsers,
    checkin: faUserCheck,
    staff: faUsersGear,
    plans: faIdCard,
    plans2: faIdCard,
    classes: faDumbbell,
    schedules: faCalendarAlt,
    bookings: faClipboardList,
    trainers: faUserTie,
    payments: faWallet,
    notifications: faBell,
    settings: faCog,
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
                className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-slate-950/95 text-slate-100 shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out lg:sticky lg:z-20 lg:w-64 lg:translate-x-0 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Admin navigation"
            >
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5">
                    <Link href="/admin" className="group inline-flex items-center gap-3" onClick={onClose}>
                        <Image
                            src="/FitStudio.png"
                            alt="FitStudio logo"
                            width={40}
                            height={40}
                            className="h-10 w-10 rounded-md border border-white/20 bg-white/5 p-1"
                            priority
                        />
                        <div>
                            <p className="text-sm font-semibold tracking-wide text-cyan-300">FitStudio</p>
                            <p className="text-xs text-slate-300">Admin Control</p>
                        </div>
                    </Link>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-md p-2 text-slate-300 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <FontAwesomeIcon icon={faTimes} className="h-4 w-4" />
                    </button>
                </div>

                <nav className="flex-1 overflow-y-auto px-2.5 py-4" aria-label="Main">
                    <ul className="space-y-1">
                        {visibleNavItems.map((item) => {
                            const isActive = isRouteActive(item.href)
                            const icon = ICON_MAP[item.iconKey]

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={onClose}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.25)]'
                                            : 'text-slate-200 hover:bg-white/8 hover:text-white'
                                            }`}
                                    >
                                        {icon && (
                                            <FontAwesomeIcon icon={icon} className={`${isActive ? 'text-cyan-300' : 'text-slate-300 group-hover:text-cyan-200'}`} />
                                        )}
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>

                    {gymSlug && (
                        <div className="mt-6 border-t border-white/10 pt-4">
                            <a
                                href={`/gym/${gymSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-cyan-300 transition hover:bg-cyan-500/10 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
                            >
                                <FontAwesomeIcon icon={faExternalLinkAlt} className="text-cyan-400 group-hover:text-cyan-300" />
                                <span>View Website</span>
                            </a>
                        </div>
                    )}
                </nav>
            </aside>
        </>
    );
}
