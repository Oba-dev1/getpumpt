'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { PasswordInput } from '@/components/ui/password-input';
import { useGym } from '@/contexts/GymContext';
import { resetPassword } from '@/lib/actions/reset-password';

export default function GymResetPasswordPage() {
  const { gym } = useGym();

  if (!gym) {
    notFound();
  }

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

        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[rgb(var(--gym-primary))]" />
            </div>
          }
        >
          <ResetPasswordContent gymSlug={gym.slug} />
        </Suspense>
      </div>
    </div>
  );
}

function ResetPasswordContent({ gymSlug }: { gymSlug: string }) {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClasses =
    'w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white backdrop-blur-sm transition-all duration-300 placeholder:text-slate-500 focus:border-[rgb(var(--gym-primary))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--gym-primary-rgb),0.3)]';

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
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10">
          <AlertTriangle className="h-8 w-8 text-amber-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Invalid Reset Link</h1>
          <p className="text-slate-400">This link may be malformed or expired.</p>
        </div>
        <Link
          href={`/gym/${gymSlug}/forgot-password`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--gym-primary))] px-6 py-3 font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]"
        >
          Request a New Link
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
          <CheckCircle2 className="h-8 w-8 text-emerald-400" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Password Reset</h1>
          <p className="text-slate-400">{success}</p>
        </div>
        <Link
          href={`/gym/${gymSlug}/login`}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--gym-primary))] px-6 py-3 font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)]"
        >
          Sign In
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 space-y-2 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02]">
          <Lock className="h-8 w-8 text-[rgb(var(--gym-primary))]" />
        </div>
        <h1 className="text-2xl font-bold text-white">Set new password</h1>
        <p className="text-slate-400">Choose a strong password for your account.</p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mb-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 backdrop-blur-sm md:p-8">
        <div className="mb-4 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="password">
            New Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className={inputClasses}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="mb-6 space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400" htmlFor="confirmPassword">
            Confirm Password
          </label>
          <PasswordInput
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
            className={inputClasses}
            placeholder="Confirm your password"
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
              Resetting...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="text-center">
        <Link
          href={`/gym/${gymSlug}/login`}
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition-colors duration-300 hover:text-slate-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>
      </p>
    </>
  );
}
