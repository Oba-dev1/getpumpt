'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Mail, CheckCircle2 } from 'lucide-react';
import { useGym } from '@/contexts/GymContext';
import { requestPasswordReset } from '@/lib/actions/forgot-password';

export default function GymForgotPasswordPage() {
  const { gym } = useGym();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!gym) {
    notFound();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const result = await requestPasswordReset({ email });

      if (result.success) {
        setSuccess(result.message || 'If an account with that email exists, we have sent you a link to reset your password.');
      } else {
        setError(result.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
        </div>

        {success ? (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white">Check your email</h1>
              <p className="leading-relaxed text-slate-400">{success}</p>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="flex items-center justify-center gap-2 text-sm text-slate-300">
                <Mail className="h-4 w-4 text-[rgb(var(--gym-primary))]" />
                <span>
                  Sent to <strong className="text-white">{email}</strong>
                </span>
              </div>
            </div>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-[rgb(var(--gym-primary))] transition-colors duration-300 hover:brightness-125"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-6 space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
                <Mail className="h-8 w-8 text-[rgb(var(--gym-primary))]" />
              </div>
              <h1 className="text-2xl font-bold text-white">Forgot your password?</h1>
              <p className="text-slate-400">
                No worries. Enter your email and we&apos;ll send you a reset link.
              </p>
            </div>

            {error && (
              <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm md:p-8">
              <div className="mb-6 space-y-2">
                <label
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-400"
                  htmlFor="email"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white backdrop-blur-sm transition-all duration-300 placeholder:text-slate-500 focus:border-[rgb(var(--gym-primary))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--gym-primary-rgb),0.3)]"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-[rgb(var(--gym-primary))] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors duration-300 hover:text-slate-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
