'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { PasswordInput } from '@/components/ui/password-input'

interface PhonePasswordFormProps {
  gymId: string
}

export function PhonePasswordForm({ gymId }: PhonePasswordFormProps) {
  const router = useRouter()
  const [phone, setPhone] = useState('')
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
        phone,
        password,
        gymId,
      })

      if (result?.error) {
        setError('Invalid phone number or password. Please try again.')
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
        return
      }

      setError('Sign in failed. Please try again.')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
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
          htmlFor="phone"
        >
          Phone Number
        </label>
        <input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className={inputClasses}
          placeholder="08012345678"
          autoComplete="tel"
        />
      </div>

      <div>
        <label
          className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-400"
          htmlFor="phone-password"
        >
          Password
        </label>
        <PasswordInput
          id="phone-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className={inputClasses}
          placeholder="Enter your password"
        />
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
