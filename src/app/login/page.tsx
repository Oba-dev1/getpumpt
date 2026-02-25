'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { PasswordInput } from '@/components/ui/password-input';
import { Dumbbell, ArrowRight, ShieldCheck, Zap, CheckCircle } from 'lucide-react';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex">
      {/* Left side - Branding panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/10 rounded-full blur-2xl" />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="text-2xl font-bold text-white">
            Get<span className="text-indigo-400">Pumpt</span>
          </Link>

          <div className="space-y-8 max-w-md">
            <h2 className="text-4xl font-bold text-white leading-tight">
              Manage your gym
              <br />
              like a <span className="text-gradient">Pro</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              All-in-one platform to manage memberships, classes, trainers, and payments from one powerful dashboard.
            </p>

            <div className="space-y-4">
              {[
                { icon: Dumbbell, text: 'Class scheduling and bookings' },
                { icon: ShieldCheck, text: 'Secure member management' },
                { icon: Zap, text: 'Real-time analytics and insights' },
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
            Trusted by 500+ gyms worldwide
          </p>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center bg-[#0A0A0A] p-4 sm:p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile logo */}
          <div className="text-center lg:hidden">
            <Link href="/" className="text-3xl font-bold text-white">
              Get<span className="text-indigo-400">Pumpt</span>
            </Link>
          </div>

          {/* Gym member redirect notice */}
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 backdrop-blur-sm">
            <p className="text-indigo-300 text-sm text-center">
              <strong>Gym Members:</strong> Please log in at your gym&apos;s website (e.g., yourgym.getpumpt.com)
            </p>
          </div>

          <Suspense fallback={<div className="h-10" />}>
            <LoginForm />
          </Suspense>

          <p className="text-center text-slate-500 text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors">
              Register your gym
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get('verified') === 'true';
  const prefillEmail = searchParams.get('email') ?? '';
  const [email, setEmail] = useState(prefillEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        const errorMap: Record<string, string> = {
          CredentialsSignin: 'Invalid email or password. Please try again.',
          Configuration: 'Server configuration error. Please contact support.',
          AccessDenied: 'Access denied. Your account may be inactive.',
        };
        setError(errorMap[result.error] || `Login failed: ${result.error}`);
        setLoading(false);
      } else if (result?.ok) {
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user?.role === 'MEMBER') {
          router.push('/member');
        } else if (['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session?.user?.role)) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Welcome back
        </h1>
        <p className="text-slate-400">Sign in to your gym owner dashboard.</p>
      </div>

      {verified && (
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
          <p className="text-green-400 text-sm">Email verified. Your gym is now active — sign in to continue.</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
          <p className="text-red-400 text-sm text-center">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
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
            placeholder="Enter your password"
          />
          <div className="text-right">
            <Link href="/forgot-password" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
              Forgot Password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="group w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Signing in...
            </span>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-[#0A0A0A] px-4 text-slate-500">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => signIn('google', { callbackUrl: '/admin' })}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-medium text-white transition-colors hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
        >
          <FontAwesomeIcon icon={faGoogle} className="h-4 w-4" />
          Sign In with Google
        </button>
      </form>
    </>
  );
}
