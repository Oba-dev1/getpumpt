'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { PasswordInput } from '@/components/ui/password-input';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
        setError('Invalid email or password. Please try again.');
        setLoading(false);
      } else if (result?.ok) {
        // Fetch session to get user role
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        // Redirect based on role
        if (session?.user?.role === 'MEMBER') {
          router.push('/member');
        } else if (['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(session?.user?.role)) {
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
        <div className="mb-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-md">
          <p className="text-indigo-400 text-sm text-center">
            <strong>Gym Members:</strong> Please log in at your gym&apos;s website (e.g., yourgym.getpumpt.com)
          </p>
        </div>

        <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-white">
              GymFlow<span className="text-indigo-500">Pro</span>
            </Link>
            <h2 className="mt-4 text-2xl font-semibold text-white">Gym Owner Login</h2>
            <p className="text-gray-400">Sign in to manage your gym.</p>
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
              className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
             <div className="text-right mt-2">
                <Link href="/forgot-password" className="text-sm text-indigo-500 hover:text-indigo-400">
                    Forgot Password?
                </Link>
            </div>
          </div>
          <div className="mb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
              onClick={() => signIn('google', { callbackUrl: '/admin' })}
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
            <Link href="/signup" className="font-semibold text-indigo-500 hover:text-indigo-400">
              Register your gym
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
