'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PasswordInput } from '@/components/ui/password-input'

interface EmailLoginFormProps {
  gymId: string
  gymSlug: string
}

export function EmailLoginForm({ gymId, gymSlug }: EmailLoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const inputClasses =
    'w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white backdrop-blur-sm transition-all duration-300 focus:border-[rgb(var(--gym-primary))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--gym-primary-rgb),0.3)]'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
        gymId,
      })

      if (result?.error) {
        setError('Invalid email or password. Please try again.')
        setLoading(false)
        return
      }

      if (result?.ok) {
        const response = await fetch('/api/auth/session')
        const session = await response.json()

        if (session?.user?.role === 'MEMBER') {
          router.push('/member')
        } else if (['ADMIN', 'SUPER_ADMIN', 'STAFF'].includes(session?.user?.role)) {
          router.push('/admin')
        } else {
          router.push('/')
        }
        router.refresh()
      }
    } catch {
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <div>
        <label
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
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
          className={inputClasses}
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
          htmlFor="password"
        >
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
            href={`/gym/${gymSlug}/forgot-password`}
            className="text-sm text-[rgb(var(--gym-primary))] transition-colors duration-300 hover:brightness-125"
          >
            Forgot Password?
          </Link>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-[rgb(var(--gym-primary))] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
