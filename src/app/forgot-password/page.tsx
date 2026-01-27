'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // TODO: Implement password reset logic
    console.log('Requesting password reset for', email);

    // For now, show a success message
    setSuccess('If an account with that email exists, we have sent you a link to reset your password.');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-white">
              GymFlow<span className="text-indigo-500">Pro</span>
            </Link>
            <h2 className="mt-4 text-2xl font-semibold text-white">Forgot Password</h2>
            <p className="text-gray-400">Enter your email to reset your password.</p>
        </div>

        {error && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
        {success && <p className="mb-4 text-center text-green-500 bg-green-500/10 p-3 rounded-md">{success}</p>}

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
          <div className="mb-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300"
            >
              Send Reset Link
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm">
          Remember your password?{' '}
          <Link href="/login" className="font-semibold text-indigo-500 hover:text-indigo-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
