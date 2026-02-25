'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { PasswordInput } from '@/components/ui/password-input';
import { useGym } from '@/contexts/GymContext';

export default function GymLoginPage() {
  const { gym } = useGym();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (!gym) {
    notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        gymId: gym.id,
      });

      if (result?.error) {
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      } else if (result?.ok) {
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user?.role === 'MEMBER') {
          router.push('/member');
        } else if (session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  const inputClasses = 'w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white backdrop-blur-sm transition-all duration-300 focus:border-[rgb(var(--gym-primary))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--gym-primary-rgb),0.3)]';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0A] p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          {gym.logo ? (
            <Link href="/" className="mb-4 inline-block">
              <Image src={gym.logo} alt={gym.name} width={120} height={120} className="mx-auto" />
            </Link>
          ) : (
            <Link href="/" className="text-3xl font-bold text-white">
              {gym.name}
            </Link>
          )}
          <h2 className="mt-4 text-2xl font-bold text-white">Welcome back to {gym.name}</h2>
          <p className="mt-1 text-slate-400">Sign in to access your member dashboard.</p>
        </div>

        {error && (
          <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm md:p-8">
          <div className="mb-4">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClasses}
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClasses}
              placeholder="Enter your password"
            />
            <div className="mt-2 text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-[rgb(var(--gym-primary))] transition-colors duration-300 hover:brightness-125"
              >
                Forgot Password?
              </Link>
            </div>
          </div>
          <div className="mb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[rgb(var(--gym-primary))] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[#0A0A0A] px-3 text-slate-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/member' })}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.06]"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign In with Google
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-semibold text-[rgb(var(--gym-primary))] transition-colors duration-300 hover:brightness-125"
            >
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
