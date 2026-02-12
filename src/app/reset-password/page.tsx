'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resetPassword } from '@/lib/actions/reset-password';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword({ token, password });

      if (result.success) {
        setSuccess(result.message || 'Your password has been reset successfully.');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="mb-8">
            <Link href="/" className="text-3xl font-bold text-white">
              Get<span className="text-indigo-500">Pumpt</span>
            </Link>
          </div>
          <div className="bg-[#141414] border border-white/10 shadow-lg rounded-lg px-8 pt-6 pb-8">
            <p className="text-red-500 mb-4">Invalid reset link. The link may be malformed or expired.</p>
            <Link href="/forgot-password" className="text-indigo-500 hover:text-indigo-400 font-semibold">
              Request a new reset link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-white">
            Get<span className="text-indigo-500">Pumpt</span>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-white">Reset Password</h2>
          <p className="text-gray-400">Enter your new password below.</p>
        </div>

        {error && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}
        {success && (
          <div className="mb-4 text-center">
            <p className="text-green-500 bg-green-500/10 p-3 rounded-md mb-4">{success}</p>
            <Link href="/login" className="text-indigo-500 hover:text-indigo-400 font-semibold">
              Go to Sign In
            </Link>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="bg-[#141414] border border-white/10 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="At least 8 characters"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Confirm your password"
              />
            </div>
            <div className="mb-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:shadow-outline transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

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
