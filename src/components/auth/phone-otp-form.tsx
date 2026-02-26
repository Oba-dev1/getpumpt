'use client'

import { useState, useEffect, useCallback } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { OtpInput } from './otp-input'
import { sendOtp } from '@/lib/actions/otp'

interface PhoneOtpFormProps {
  gymId: string
}

type Step = 'phone' | 'otp'

const RESEND_COOLDOWN_S = 60

export function PhoneOtpForm({ gymId }: PhoneOtpFormProps) {
  const router = useRouter()
  const [step, setStep] = useState<Step>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  const inputClasses =
    'w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-white backdrop-blur-sm transition-all duration-300 focus:border-[rgb(var(--gym-primary))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--gym-primary-rgb),0.3)]'

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  const handleSendOtp = useCallback(async () => {
    setError('')
    setInfo('')

    if (!phone.trim()) {
      setError('Please enter your phone number.')
      return
    }

    setLoading(true)
    try {
      const result = await sendOtp(gymId, phone.trim())
      setInfo(result.message)
      if (result.success) {
        setStep('otp')
        setCooldown(RESEND_COOLDOWN_S)
      }
    } catch {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [gymId, phone])

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (otp.length < 6) {
      setError('Please enter the 6-digit code sent to your phone.')
      return
    }

    setLoading(true)
    try {
      const result = await signIn('phone-otp', {
        redirect: false,
        phone,
        code: otp,
        gymId,
      })

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid or expired code.' : result.error)
        setOtp('')
        return
      }

      if (result?.ok) {
        const response = await fetch('/api/auth/session')
        const session = await response.json()

        if (session?.user?.role === 'MEMBER') {
          router.push('/member')
        } else {
          router.push('/')
        }
        router.refresh()
        return
      }

      // Unexpected result shape
      setError('Sign in failed. Please try again.')
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'phone') {
    return (
      <div className="space-y-4">
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
            className={inputClasses}
            placeholder="08012345678"
            autoComplete="tel"
          />
        </div>

        <button
          type="button"
          onClick={handleSendOtp}
          disabled={loading}
          className="w-full rounded-xl bg-[rgb(var(--gym-primary))] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Sending...' : 'Send One-Time Code'}
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleVerifyOtp} className="space-y-6">
      {info && (
        <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-center text-sm text-emerald-400">
          {info}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
          {error}
        </p>
      )}

      <div>
        <p className="mb-4 text-center text-sm text-slate-400">
          Enter the 6-digit code sent to <span className="font-semibold text-white">{phone}</span>
        </p>
        <OtpInput value={otp} onChange={setOtp} disabled={loading} />
      </div>

      <button
        type="submit"
        disabled={loading || otp.length < 6}
        className="w-full rounded-xl bg-[rgb(var(--gym-primary))] py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:shadow-[rgba(var(--gym-primary-rgb),0.3)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Verifying...' : 'Verify & Sign In'}
      </button>

      <div className="text-center text-sm text-slate-400">
        Didn&apos;t receive the code?{' '}
        {cooldown > 0 ? (
          <span className="text-slate-500">Resend in {cooldown}s</span>
        ) : (
          <button
            type="button"
            onClick={handleSendOtp}
            disabled={loading}
            className="font-semibold text-[rgb(var(--gym-primary))] transition-colors duration-300 hover:brightness-125 disabled:opacity-50"
          >
            Resend code
          </button>
        )}
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={() => { setStep('phone'); setOtp(''); setError(''); setInfo('') }}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors duration-300"
        >
          Change phone number
        </button>
      </div>
    </form>
  )
}
