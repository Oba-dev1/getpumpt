'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { PasswordInput } from '@/components/ui/password-input';
import { signupGymOwner } from '@/lib/actions/signup';
import { ArrowRight, Building2, Users, CreditCard, BarChart3 } from 'lucide-react';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gymName, setGymName] = useState('');
  const [country, setCountry] = useState('Nigeria');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signupGymOwner({
        firstName,
        lastName,
        email,
        password,
        gymName,
        country,
      });

      if (!result.success) {
        setError(result.error || 'Failed to create account');
        setLoading(false);
        return;
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        setError('Account created but failed to sign in. Please try logging in.');
        setLoading(false);
        return;
      }

      router.push('/onboarding/welcome');
      router.refresh();
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex">
      {/* Left side - Branding panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl" />
        </div>

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="text-2xl font-bold text-white">
            Get<span className="text-indigo-400">Pumpt</span>
          </Link>

          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Launch your gym&apos;s
              <br />
              digital <span className="text-gradient">empire</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Set up in minutes. Get a branded website, member portal, and powerful admin dashboard.
            </p>

            <div className="space-y-4">
              {[
                { icon: Building2, text: 'Custom branded gym website' },
                { icon: Users, text: 'Member management portal' },
                { icon: CreditCard, text: 'Online payment processing' },
                { icon: BarChart3, text: 'Analytics and insights' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                      <Icon className="h-5 w-5 text-indigo-400" />
                    </div>
                    <span className="text-slate-200 text-sm">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-slate-500 text-sm">
            14-day free trial. No credit card required.
          </p>
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] p-4 sm:p-8">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center lg:hidden">
            <Link href="/" className="text-3xl font-bold text-white">
              Get<span className="text-indigo-400">Pumpt</span>
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              Create your account
            </h1>
            <p className="text-slate-400">Set up your gym on GetPumpt in just a few steps.</p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="firstName">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="password">
                Password
              </label>
              <PasswordInput
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="gymName">
                Gym Name
              </label>
              <input
                id="gymName"
                type="text"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-slate-500 transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="FitStudio Pro"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300" htmlFor="country">
                Country
              </label>
              <select
                id="country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white transition-colors focus:border-indigo-500/50 focus:bg-white/[0.07] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 [&>option]:bg-slate-900 [&>option]:text-white"
              >
                <option value="Nigeria">Nigeria</option>
                <option value="Ghana">Ghana</option>
                <option value="Kenya">Kenya</option>
                <option value="South Africa">South Africa</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Creating your account...
                </span>
              ) : (
                <>
                  Create My Gym
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-500 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
