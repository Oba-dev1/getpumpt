'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faTachometerAlt, faUsers, faIdCard, faCalendarAlt, faDumbbell, 
    faClipboardList, faUserTie, faWallet, faEnvelope, faChartBar, 
    faCog, faFileAlt
} from '@fortawesome/free-solid-svg-icons';

const navLinks = [
    { href: '/admin', label: 'Dashboard', icon: faTachometerAlt },
    { href: '/admin/members', label: 'Members', icon: faUsers },
    { href: '/admin/plans', label: 'Plans', icon: faIdCard },
    { href: '/admin/classes', label: 'Classes', icon: faDumbbell },
    { href: '/admin/schedules', label: 'Schedules', icon: faCalendarAlt },
    { href: '/admin/bookings', label: 'Bookings', icon: faClipboardList },
    { href: '/admin/trainers', label: 'Trainers', icon: faUserTie },
    { href: '/admin/payments', label: 'Payments', icon: faWallet },
    { href: '/admin/inquiries', label: 'Inquiries', icon: faEnvelope },
    { href: '/admin/reports', label: 'Reports', icon: faChartBar },
    { href: '/admin/testimonials', label: 'Testimonials', icon: faFileAlt },
    { href: '/admin/settings', label: 'Settings', icon: faCog },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="hidden lg:flex flex-col w-64 bg-gray-800">
            <div className="flex items-center justify-center h-16 bg-gray-900">
                <span className="text-white font-bold uppercase">FitStudio Admin</span>
            </div>
            <div className="flex flex-col flex-1 overflow-y-auto">
                <nav className="flex-1 px-2 py-4 bg-gray-800">
                    {navLinks.map(link => (
                        <Link key={link.href} href={link.href}>
                            <div className={`flex items-center px-4 py-2 text-gray-100 hover:bg-gray-700 rounded-md ${pathname === link.href ? 'bg-gray-700' : ''}`}>
                                <FontAwesomeIcon icon={link.icon} />
                                <span className="mx-4">{link.label}</span>
                            </div>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}
