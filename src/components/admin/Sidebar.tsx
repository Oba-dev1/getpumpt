'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faUsers, faIdCard, faCalendarAlt, faDumbbell,
    faClipboardList, faUserTie, faWallet, faCog, faTimes, faBell
} from '@fortawesome/free-solid-svg-icons';

const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: faTachometerAlt },
    { href: '/admin/members', label: 'Members', icon: faUsers },
    { href: '/admin/membership-plans', label: 'Membership Plans', icon: faIdCard },
    { href: '/admin/plans', label: 'Plans', icon: faIdCard },
    { href: '/admin/classes', label: 'Classes', icon: faDumbbell },
    { href: '/admin/schedules', label: 'Schedules', icon: faCalendarAlt },
    { href: '/admin/bookings', label: 'Bookings', icon: faClipboardList },
    { href: '/admin/trainers', label: 'Trainers', icon: faUserTie },
    { href: '/admin/payments', label: 'Payments', icon: faWallet },
    { href: '/admin/notifications', label: 'Notifications', icon: faBell },
    { href: '/admin/settings', label: 'Settings', icon: faCog },
];

interface SidebarProps {
    isMobileOpen: boolean
    onClose: () => void
}

export default function Sidebar({ isMobileOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
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
                        {navLinks.map((link) => {
                            const isActive = isRouteActive(link.href)

                            return (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        onClick={onClose}
                                        aria-current={isActive ? 'page' : undefined}
                                        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 ${isActive
                                            ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/20 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.25)]'
                                            : 'text-slate-200 hover:bg-white/8 hover:text-white'
                                            }`}
                                    >
                                        <FontAwesomeIcon icon={link.icon} className={`${isActive ? 'text-cyan-300' : 'text-slate-300 group-hover:text-cyan-200'}`} />
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    );
}
