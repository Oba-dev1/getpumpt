'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
    } else if (result?.ok) {
      router.push('/admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-white">
              GymFlow<span className="text-indigo-500">Pro</span>
            </Link>
            <h2 className="mt-4 text-2xl font-semibold text-white">Welcome Back</h2>
            <p className="text-gray-400">Sign in to continue to your dashboard.</p>
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
            <input
              id="password"
              type="password"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              Sign In
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
        <p className="text-center text-gray-500 text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="font-semibold text-indigo-500 hover:text-indigo-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
