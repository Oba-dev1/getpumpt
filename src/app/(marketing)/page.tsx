import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck, faDumbbell, faBuilding, faChartLine, faMobileScreen } from '@fortawesome/free-solid-svg-icons';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-white">
              GymFlow<span className="text-[#6366F1]">Pro</span>
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
            All-in-one platform to manage memberships, classes, trainers, and payments.
            Beautiful branded websites included. No coding required.
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
              Everything You Need to Manage Your Gym
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From membership management to class scheduling, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: faBuilding,
                title: 'Multi-Location',
                description: 'Manage multiple gym locations from a single dashboard.',
              },
              {
                icon: faDumbbell,
                title: 'Class Scheduling',
                description: 'Easy-to-use scheduler for classes, trainers, and rooms.',
              },
              {
                icon: faChartLine,
                title: 'Analytics',
                description: 'Track revenue, attendance, and member engagement.',
              },
              {
                icon: faMobileScreen,
                title: 'Member App',
                description: 'Branded mobile app for your members to book and pay.',
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

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-[#6366F1] to-[#818CF8]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Gym Business?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join hundreds of gym owners who are growing their business with GymFlow Pro.
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
              GymFlow<span className="text-[#6366F1]">Pro</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} GymFlow Pro. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
