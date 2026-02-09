'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { PasswordInput } from '@/components/ui/password-input';
import { signupMember } from '@/lib/actions/member-signup';
import { useGym } from '@/contexts/GymContext';

export default function GymRegisterPage() {
  const { gym } = useGym();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      const result = await signupMember({
        firstName,
        lastName,
        email,
        phone,
        password,
        gymId: gym.id,
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
        gymId: gym.id,
      });

      if (signInResult?.error) {
        setError('Account created but failed to sign in. Please try logging in.');
        setLoading(false);
        return;
      }

      router.push('/member');
      router.refresh();
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
          <h2 className="mt-4 text-2xl font-semibold text-white">Join {gym.name}</h2>
          <p className="text-gray-400">Create your member account and start your fitness journey.</p>
        </div>

        {error && <p className="mb-4 text-center text-red-500 bg-red-500/10 p-3 rounded-md">{error}</p>}

        <form onSubmit={handleSubmit} className="bg-[#141414] border border-white/10 shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--gym-primary)]"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--gym-primary)]"
                placeholder="Doe"
              />
            </div>
          </div>

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

          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="phone">
              Phone Number (Optional)
            </label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 text-white rounded-md py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--gym-primary)]"
              placeholder="+234 123 456 7890"
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
              placeholder="Min 8 chars, 1 uppercase, 1 number"
            />
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
              {loading ? 'Creating Your Account...' : 'Create Account'}
            </button>
          </div>

          <div className="text-center text-xs text-gray-500 mb-4">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </div>
        </form>

        <p className="text-center text-gray-500 text-sm">
          Already have an account?{' '}
          <Link href={`/gym/${gym.slug}/login`} className="font-semibold hover:underline" style={{ color: 'var(--gym-primary)' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
