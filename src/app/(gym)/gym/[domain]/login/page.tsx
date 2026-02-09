'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
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

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {gym.logo ? (
            <Link href="/" className="inline-block mb-4">
              <Image src={gym.logo} alt={gym.name} width={120} height={120} className="mx-auto" />
            </Link>
          ) : (
            <Link href="/" className="text-3xl font-bold text-white">
              {gym.name}
            </Link>
          )}
          <h2 className="mt-4 text-2xl font-semibold text-white">Welcome back to {gym.name}</h2>
          <p className="text-gray-400">Sign in to access your member dashboard.</p>
        </div>

        {error && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="bg-[#141414] border border-white/10 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--gym-primary)]"
              placeholder="you@example.com"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--gym-primary)]"
              placeholder="••••••••"
            />
            <div className="text-right mt-2">
              <Link href={`/gym/${gym.slug}/forgot-password`} className="text-sm hover:underline" style={{ color: 'var(--gym-primary)' }}>
                Forgot Password?
              </Link>
            </div>
          </div>
          <div className="mb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--gym-primary)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#141414] text-gray-500">Or continue with</span>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/member' })}
              className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              <FontAwesomeIcon icon={faGoogle} />
              Sign In with Google
            </button>
          </div>
        </form>
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Don't have an account?{' '}
            <Link href={`/gym/${gym.slug}/register`} className="font-semibold hover:underline" style={{ color: 'var(--gym-primary)' }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
