'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  ArrowRight,
  Building2,
  Dumbbell,
  BarChart3,
  Smartphone,
  Menu,
  X,
  CreditCard,
  Users,
  Globe,
  Star,
  UserPlus,
  Palette,
  Rocket,
  ChevronDown,
  Quote,
  CalendarDays,
  TrendingUp,
  Bell,
  Shield,
  Check,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#product', label: 'Product' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#faq', label: 'FAQ' },
];

const FEATURES = [
  {
    icon: Building2,
    title: 'Multi-Location',
    description: 'Manage multiple gym locations from a single dashboard.',
  },
  {
    icon: Dumbbell,
    title: 'Class Scheduling',
    description: 'Easy-to-use scheduler for classes, trainers, and rooms.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Track revenue, attendance, and member engagement in real time.',
  },
  {
    icon: Smartphone,
    title: 'Member App',
    description: 'Branded mobile experience for your members to book and pay.',
  },
  {
    icon: CreditCard,
    title: 'Payments',
    description: 'Accept payments online with automated billing and invoicing.',
  },
  {
    icon: Users,
    title: 'Member Management',
    description: 'Complete CRM for tracking memberships, check-ins, and progress.',
  },
  {
    icon: Globe,
    title: 'Custom Website',
    description: 'Beautiful branded website included. No coding required.',
  },
  {
    icon: Star,
    title: 'Reviews & Ratings',
    description: 'Collect and showcase member testimonials automatically.',
  },
];

const STEPS = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your account in under 2 minutes. No credit card required.',
  },
  {
    number: '02',
    icon: Palette,
    title: 'Customize',
    description: 'Add your branding, set up classes, and configure memberships.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Launch',
    description: 'Go live with your branded website and start accepting members.',
  },
];

const TESTIMONIALS = [
  {
    quote: 'GetPumpt transformed how we run our gym. Membership sign-ups increased 40% in the first month alone.',
    name: 'Sarah Chen',
    role: 'Owner, FitStudio NYC',
    rating: 5,
  },
  {
    quote: 'The branded website and member app are game changers. Our members love the seamless booking experience.',
    name: 'Marcus Johnson',
    role: 'Director, Iron Temple Fitness',
    rating: 5,
  },
  {
    quote: 'Finally, a platform that understands what gym owners actually need. Simple, powerful, and affordable.',
    name: 'Priya Patel',
    role: 'Founder, ZenFit Studios',
    rating: 5,
  },
];

const FAQS = [
  {
    question: 'How long does it take to get set up?',
    answer: 'Most gyms are fully set up and live within 24 hours. Our onboarding wizard walks you through every step, from branding to class schedules.',
  },
  {
    question: 'Do I need any technical skills?',
    answer: 'Not at all. GetPumpt is designed for gym owners, not developers. Everything is point-and-click, including your custom website.',
  },
  {
    question: 'Can I migrate from my current system?',
    answer: 'Yes. We offer free migration assistance for all plans. Our team will help transfer your member data, class schedules, and payment records.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'We support all major payment methods through Paystack, including cards, bank transfers, and mobile money. Automatic billing and invoicing are included.',
  },
  {
    question: 'Is there a contract or commitment?',
    answer: 'No long-term contracts. All plans are month-to-month and you can cancel anytime. We also offer a 14-day free trial.',
  },
];

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Product', href: '#product' },
    { label: 'Integrations', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
  ],
};

function DashboardMockup() {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/80 shadow-2xl overflow-hidden">
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700/40 bg-slate-800/60">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="bg-slate-700/50 rounded-md px-4 py-1 text-xs text-slate-400">
            admin.getpumpt.com/dashboard
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Active Members', value: '1,247', change: '+12%' },
            { label: 'Revenue (MTD)', value: '\u20A6 4.8M', change: '+8%' },
            { label: 'Classes Today', value: '18', change: '3 open' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-800/60 border border-slate-700/40 rounded-lg p-3">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider">{stat.label}</p>
              <p className="text-lg font-bold text-white mt-1">{stat.value}</p>
              <p className="text-[10px] text-emerald-400 mt-0.5">{stat.change}</p>
            </div>
          ))}
        </div>
        {/* Chart placeholder */}
        <div className="bg-slate-800/40 border border-slate-700/30 rounded-lg p-4 h-32 flex items-end gap-1.5">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-indigo-500/60 rounded-t"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        {/* Table rows */}
        <div className="space-y-2">
          {['Alex Rivera - HIIT Blast', 'Maria Santos - Yoga Flow', 'James Kim - Strength'].map((row) => (
            <div key={row} className="flex items-center justify-between bg-slate-800/30 border border-slate-700/20 rounded-lg px-3 py-2">
              <span className="text-xs text-slate-300">{row}</span>
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Active</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MemberAppMockup() {
  return (
    <div className="rounded-xl border border-slate-700/60 bg-gradient-to-b from-slate-800/80 to-slate-900/80 shadow-2xl overflow-hidden max-w-[280px] mx-auto">
      {/* Phone status bar */}
      <div className="flex items-center justify-between px-5 py-2 bg-slate-800/60">
        <span className="text-[10px] text-slate-400">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-sm bg-slate-500/60" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-500/60" />
        </div>
      </div>
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-slate-700/30">
        <p className="text-sm font-bold text-white">FitStudio</p>
        <p className="text-[10px] text-slate-400 mt-0.5">Welcome back, Alex</p>
      </div>
      {/* Upcoming class */}
      <div className="p-4 space-y-3">
        <div className="bg-indigo-500/15 border border-indigo-500/30 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] text-indigo-300 uppercase tracking-wider font-medium">Next Class</span>
          </div>
          <p className="text-sm font-semibold text-white">HIIT Blast</p>
          <p className="text-[10px] text-slate-400 mt-1">Today at 6:00 PM - Studio A</p>
        </div>
        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: CalendarDays, label: 'Book Class' },
            { icon: CreditCard, label: 'Payments' },
            { icon: TrendingUp, label: 'Progress' },
            { icon: Bell, label: 'Updates' },
          ].map((action) => {
            const Icon = action.icon;
            return (
              <div key={action.label} className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-3 text-center">
                <Icon className="w-4 h-4 text-indigo-400 mx-auto mb-1.5" />
                <span className="text-[10px] text-slate-300">{action.label}</span>
              </div>
            );
          })}
        </div>
        {/* Membership card */}
        <div className="bg-gradient-to-r from-indigo-600/30 to-violet-600/20 border border-indigo-500/20 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-indigo-300 uppercase tracking-wider">Membership</p>
              <p className="text-sm font-semibold text-white mt-0.5">Premium Plan</p>
            </div>
            <Shield className="w-5 h-5 text-indigo-400" />
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Renews Mar 15, 2026</p>
        </div>
      </div>
    </div>
  );
}

export default function MarketingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [mobileMenuOpen]);

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-60 focus:bg-slate-800 focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-white"
      >
        Skip to content
      </a>

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Main navigation" className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold text-white">
              Get<span className="text-indigo-400">Pumpt</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm font-medium text-slate-400 hover:text-white transition-colors duration-200"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
              >
                Start Free Trial
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden p-2 text-slate-400 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-dark-secondary border-t border-slate-800/60 px-4 pb-4">
            <div className="flex flex-col gap-2 pt-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-slate-400 hover:text-white py-2 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-slate-800 my-2" />
              <Link
                href="/login"
                className="text-sm font-medium text-slate-400 hover:text-white py-2 transition-colors duration-200"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium text-center transition-colors duration-200"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        {/* Hero Section */}
        <section className="pt-36 sm:pt-44 pb-20 sm:pb-28 px-4 relative overflow-hidden">
          {/* Subtle gradient orb */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-4xl mx-auto text-center relative">
            <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 text-sm font-medium rounded-full mb-8">
              The #1 Gym Management Platform
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight leading-[1.1] mb-6">
              Run Your Gym{' '}
              <br className="hidden sm:block" />
              Like a <span className="text-gradient">Pro</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              All-in-one platform to manage memberships, classes, trainers, and payments.
              Beautiful branded websites included.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3.5 rounded-lg font-medium text-base shadow-lg shadow-indigo-600/20 transition-colors duration-200"
              >
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="#product"
                className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-200 px-8 py-3.5 rounded-lg font-medium text-base border border-slate-700 transition-colors duration-200"
              >
                See the Product
              </Link>
            </div>
            <p className="text-slate-500 text-sm mt-8">
              No credit card required &middot; 14-day free trial &middot; Cancel anytime
            </p>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="py-12 sm:py-16 bg-dark-secondary/50 border-y border-slate-800/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm font-medium text-slate-500 mb-8 uppercase tracking-wider">
              Trusted by 500+ gyms worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
              {['FitStudio', 'Iron Temple', 'ZenFit', 'PowerHouse', 'FlexGym'].map((name) => (
                <span
                  key={name}
                  className="text-xl font-bold text-slate-600 select-none"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 sm:py-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Everything You Need to Manage Your Gym
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                From membership management to class scheduling, we&apos;ve got you covered.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-8 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-colors duration-200"
                  >
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 mb-5">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Showcase - Admin Dashboard */}
        <section id="product" className="py-20 sm:py-28 px-4 bg-dark-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 text-sm font-medium rounded-full mb-6">
                See it in Action
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                A Dashboard Built for Gym Owners
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Track members, revenue, classes, and more from one powerful admin panel.
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <DashboardMockup />
            </div>

            <div className="grid sm:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
              {[
                { icon: BarChart3, title: 'Real-time Analytics', desc: 'Live data on revenue, attendance, and growth trends.' },
                { icon: Users, title: 'Member Insights', desc: 'Track check-ins, engagement, and retention at a glance.' },
                { icon: CalendarDays, title: 'Class Overview', desc: 'See today\'s schedule, capacity, and waitlists instantly.' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="text-center">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 mx-auto mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Showcase - Member App */}
        <section className="py-20 sm:py-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1">
                <MemberAppMockup />
              </div>
              <div className="order-1 lg:order-2">
                <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 text-sm font-medium rounded-full mb-6">
                  Member Experience
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Your Members Will Love It
                </h2>
                <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                  A branded member portal where your gym members can book classes, track progress, manage payments, and stay connected.
                </p>
                <ul className="space-y-4">
                  {[
                    'Book and manage class reservations',
                    'View membership status and payment history',
                    'Track fitness progress and goals',
                    'Receive notifications and updates',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center mt-0.5 shrink-0">
                        <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      </div>
                      <span className="text-slate-300 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-20 sm:py-28 px-4 bg-dark-secondary/30">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Get Started in 3 Simple Steps
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Launch your gym&apos;s digital presence in under 24 hours.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 md:gap-12">
              {STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.number} className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-2xl mb-6 shadow-lg shadow-indigo-600/20">
                      <Icon className="w-7 h-7" />
                    </div>
                    <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                      Step {step.number}
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                    <p className="text-slate-400 leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 sm:py-28 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-1.5 text-sm font-medium rounded-full mb-6">
                Simple Pricing
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Plans That Grow With Your Gym
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Start free, upgrade when you&apos;re ready. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[
                {
                  name: 'Starter',
                  price: '15,000',
                  period: '/month',
                  description: 'Perfect for small gyms just getting started.',
                  features: [
                    'Up to 100 members',
                    'Class scheduling',
                    'Online payments (Paystack)',
                    'Member portal',
                    'Email support',
                  ],
                  cta: 'Start Free Trial',
                  highlighted: false,
                },
                {
                  name: 'Growth',
                  price: '35,000',
                  period: '/month',
                  description: 'For growing gyms that need more power.',
                  features: [
                    'Up to 500 members',
                    'Everything in Starter',
                    'Custom branded website',
                    'Analytics dashboard',
                    'Multi-trainer support',
                    'Priority support',
                  ],
                  cta: 'Start Free Trial',
                  highlighted: true,
                },
                {
                  name: 'Pro',
                  price: '75,000',
                  period: '/month',
                  description: 'For established gyms and multi-location businesses.',
                  features: [
                    'Unlimited members',
                    'Everything in Growth',
                    'Multi-location management',
                    'Advanced analytics & reports',
                    'API access',
                    'Dedicated account manager',
                  ],
                  cta: 'Start Free Trial',
                  highlighted: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-xl p-8 flex flex-col ${
                    plan.highlighted
                      ? 'bg-indigo-600/10 border-2 border-indigo-500/40 relative'
                      : 'bg-slate-800/40 border border-slate-700/40'
                  }`}
                >
                  {plan.highlighted && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold text-white mb-2">{plan.name}</h3>
                  <p className="text-sm text-slate-400 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-3xl font-bold text-white">{'\u20A6'}{plan.price}</span>
                    <span className="text-slate-400 text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                        <span className="text-sm text-slate-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/signup"
                    className={`inline-flex items-center justify-center py-3 px-6 rounded-lg font-medium text-sm transition-colors duration-200 ${
                      plan.highlighted
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'
                        : 'bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <p className="text-center text-slate-500 text-sm mt-8">
              All plans include a 14-day free trial. No credit card required.
            </p>
          </div>
        </section>

        {/* Testimonials */}
        <section id="testimonials" className="py-20 sm:py-28 px-4 bg-dark-secondary/30">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Loved by Gym Owners
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                See what our customers have to say about GetPumpt.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial) => (
                <div
                  key={testimonial.name}
                  className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-8 flex flex-col"
                >
                  <Quote className="w-8 h-8 text-indigo-500/30 mb-4" />
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-300 leading-relaxed mb-6 flex-1">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div>
                    <p className="font-semibold text-white">{testimonial.name}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 sm:py-28 px-4 bg-dark-secondary/30">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-slate-400">
                Got questions? We&apos;ve got answers.
              </p>
            </div>

            <div className="space-y-3">
              {FAQS.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={index}
                    className="bg-slate-800/40 border border-slate-700/40 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      className="flex items-center justify-between w-full px-6 py-5 text-left"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      id={`faq-question-${index}`}
                    >
                      <span className="font-medium text-white pr-4">{faq.question}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {isOpen && (
                      <div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                        className="pb-5"
                      >
                        <p className="px-6 text-slate-400 leading-relaxed">{faq.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/5 to-transparent pointer-events-none" />
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Gym Business?
            </h2>
            <p className="text-lg text-slate-400 mb-10">
              Join hundreds of gym owners who are growing their business with GetPumpt.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-lg font-medium text-lg shadow-lg shadow-indigo-600/20 transition-colors duration-200"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark-secondary/50 border-t border-slate-800/40 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2">
              <div className="text-xl font-bold mb-4">
                Get<span className="text-indigo-400">Pumpt</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                The all-in-one gym management platform. Memberships, classes, payments, and branded websites.
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title}>
                <h4 className="font-semibold text-sm text-white mb-4">{title}</h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-slate-400 hover:text-white transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-slate-800/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-500 text-sm">
              &copy; {new Date().getFullYear()} GetPumpt. All rights reserved.
            </p>
            <Link
              href="/login"
              className="text-sm text-slate-500 hover:text-white transition-colors duration-200"
            >
              Staff Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
