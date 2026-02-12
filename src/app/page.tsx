// Root page - Pumpt SaaS Marketing Site
// Individual gym sites are accessed via /gym/[domain] route (e.g., /gym/fitstudio)
// or subdomains in production (e.g., fitstudio.getpumpt.com)

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowRight,
  faDumbbell,
  faBuilding,
  faChartLine,
  faMobileScreen,
  faUsers,
  faCreditCard,
  faBoxes,
  faCalendarAlt,
  faBell,
  faUserShield,
  faClipboardCheck
} from '@fortawesome/free-solid-svg-icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              Get<span className="text-[#6366F1]">Pumpt</span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#demo" className="text-gray-400 hover:text-white transition-colors">
                Demo
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-md font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block bg-[#6366F1]/10 border border-[#6366F1]/30 px-4 py-2 text-sm font-semibold text-[#6366F1] rounded-full mb-6">
            The #1 Gym Management Platform
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Run Your Gym Like a{' '}
            <span className="text-[#6366F1]">Pro</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
            Complete platform for memberships, payments, class scheduling, inventory management, and analytics.
            Beautiful branded websites included. Everything you need to grow your fitness business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-8 py-4 rounded-md font-semibold text-lg transition-colors"
            >
              Start Free Trial
              <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
            </Link>
            <Link
              href="/demo"
              className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-md font-semibold text-lg border border-white/10 transition-colors"
            >
              View Demo
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Complete Gym Management Solution
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              All the tools you need to run and grow your fitness business in one powerful platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: faUsers,
                title: 'Member Management',
                description: 'Complete member profiles, attendance tracking, and automated renewals.',
              },
              {
                icon: faCreditCard,
                title: 'Payment Processing',
                description: 'Secure online payments, recurring billing, and invoice management.',
              },
              {
                icon: faBoxes,
                title: 'Inventory Management',
                description: 'Track equipment, merchandise, and supplies with low-stock alerts.',
              },
              {
                icon: faDumbbell,
                title: 'Class Scheduling',
                description: 'Easy-to-use scheduler for classes, trainers, and rooms.',
              },
              {
                icon: faCalendarAlt,
                title: 'Booking System',
                description: 'Online class bookings with automated confirmations and reminders.',
              },
              {
                icon: faUserShield,
                title: 'Staff Management',
                description: 'Manage trainers, schedules, permissions, and performance tracking.',
              },
              {
                icon: faChartLine,
                title: 'Analytics & Reports',
                description: 'Track revenue, attendance, member engagement, and business insights.',
              },
              {
                icon: faBell,
                title: 'Notifications',
                description: 'Automated SMS and email notifications for bookings and renewals.',
              },
              {
                icon: faClipboardCheck,
                title: 'Check-In System',
                description: 'Quick member check-in with QR codes and access control.',
              },
              {
                icon: faMobileScreen,
                title: 'Branded Website',
                description: 'Beautiful white-label website and member portal for your gym.',
              },
              {
                icon: faBuilding,
                title: 'Multi-Location',
                description: 'Manage multiple gym locations from a single dashboard.',
              },
              {
                icon: faDumbbell,
                title: 'Membership Plans',
                description: 'Flexible subscription plans with tiered pricing and trial periods.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#141414] border border-white/5 p-8 rounded-xl hover:border-[#6366F1]/30 transition-colors"
              >
                <div className="w-12 h-12 bg-[#6366F1]/10 rounded-lg flex items-center justify-center text-[#6366F1] mb-4">
                  <FontAwesomeIcon icon={feature.icon} className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Highlight */}
      <section className="py-20 px-4 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
            <div>
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Smart Inventory Management
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                Keep track of all your gym equipment, merchandise, supplements, and supplies in one place.
                Get automated low-stock alerts, track equipment maintenance schedules, and manage vendor orders seamlessly.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Equipment Tracking</h4>
                    <p className="text-gray-400">Monitor equipment condition, maintenance history, and replacement schedules.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Retail Management</h4>
                    <p className="text-gray-400">Sell merchandise, supplements, and gear with integrated POS and inventory sync.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Automated Alerts</h4>
                    <p className="text-gray-400">Get notified when stock runs low or equipment needs maintenance.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-[#6366F1]/10 to-[#818CF8]/5 rounded-2xl border border-white/10 p-8 md:p-12">
              <div className="space-y-6">
                <div className="bg-[#0A0A0A] rounded-lg p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-semibold">Dumbbells Set</h5>
                    <span className="text-[#6366F1] text-sm font-semibold">In Stock</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Quantity</p>
                      <p className="text-white font-semibold">24 pairs</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Condition</p>
                      <p className="text-white font-semibold">Excellent</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0A0A0A] rounded-lg p-6 border border-orange-500/30">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-semibold">Protein Powder</h5>
                    <span className="text-orange-400 text-sm font-semibold">Low Stock</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Quantity</p>
                      <p className="text-orange-400 font-semibold">3 units</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Reorder</p>
                      <p className="text-white font-semibold">20 units</p>
                    </div>
                  </div>
                </div>
                <div className="bg-[#0A0A0A] rounded-lg p-6 border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="text-white font-semibold">Treadmill - Zone A</h5>
                    <span className="text-[#6366F1] text-sm font-semibold">Maintained</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Last Service</p>
                      <p className="text-white font-semibold">Jan 15, 2026</p>
                    </div>
                    <div>
                      <p className="text-gray-500 mb-1">Next Service</p>
                      <p className="text-white font-semibold">Apr 15, 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-[#6366F1]/10 to-[#818CF8]/5 rounded-2xl border border-white/10 p-8 md:p-12">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-[#0A0A0A] rounded-lg border border-white/5">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
                    <p className="text-white text-3xl font-bold">$48,950</p>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">+12.5%</div>
                </div>
                <div className="flex items-center justify-between p-6 bg-[#0A0A0A] rounded-lg border border-white/5">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Active Members</p>
                    <p className="text-white text-3xl font-bold">342</p>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">+8.2%</div>
                </div>
                <div className="flex items-center justify-between p-6 bg-[#0A0A0A] rounded-lg border border-white/5">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">Class Attendance</p>
                    <p className="text-white text-3xl font-bold">89%</p>
                  </div>
                  <div className="text-green-400 text-sm font-semibold">+5.1%</div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Powerful Analytics & Insights
              </h3>
              <p className="text-gray-400 text-lg mb-6">
                Make data-driven decisions with comprehensive analytics. Track revenue, member engagement,
                class popularity, trainer performance, and business growth metrics in real-time.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Revenue Tracking</h4>
                    <p className="text-gray-400">Monitor membership fees, class bookings, and retail sales in one dashboard.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Member Insights</h4>
                    <p className="text-gray-400">Track attendance patterns, engagement levels, and retention rates.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">Custom Reports</h4>
                    <p className="text-gray-400">Generate detailed reports on any metric that matters to your business.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-[#0A0A0A]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose the plan that fits your business. All plans include 14-day free trial.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 hover:border-[#6366F1]/30 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
              <p className="text-gray-400 mb-6">Perfect for small gyms</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$99</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Up to 100 members</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Single location</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">All core features</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Branded website</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Email support</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=starter"
                className="block w-full text-center bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-md font-semibold border border-white/10 transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-[#141414] border-2 border-[#6366F1] rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#6366F1] text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
              <p className="text-gray-400 mb-6">For growing gyms</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">$199</span>
                <span className="text-gray-400">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Up to 500 members</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Up to 3 locations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">All features + Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Custom branding</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Priority support</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=professional"
                className="block w-full text-center bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Start Free Trial
              </Link>
            </div>

            <div className="bg-[#141414] border border-white/5 rounded-2xl p-8 hover:border-[#6366F1]/30 transition-colors">
              <h3 className="text-2xl font-bold text-white mb-2">Enterprise</h3>
              <p className="text-gray-400 mb-6">For gym chains</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">Custom</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Unlimited members</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Unlimited locations</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">All features + Custom development</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">White-label solution</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#6366F1]"></div>
                  </div>
                  <span className="text-gray-300">Dedicated account manager</span>
                </li>
              </ul>
              <Link
                href="/signup?plan=enterprise"
                className="block w-full text-center bg-white/5 hover:bg-white/10 text-white px-6 py-3 rounded-md font-semibold border border-white/10 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#6366F1] to-[#818CF8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Gym Business?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join hundreds of gym owners who are growing their business with GetPumpt.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-white text-[#6366F1] px-8 py-4 rounded-md font-semibold text-lg hover:bg-gray-100 transition-colors"
          >
            Start Your Free Trial
            <FontAwesomeIcon icon={faArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-[#0A0A0A] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-2xl font-bold text-white">
              Get<span className="text-[#6366F1]">Pumpt</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} GetPumpt. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
