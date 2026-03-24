'use client'

import { useState } from 'react'
import { Mail, X } from 'lucide-react'

interface EmailVerificationBannerProps {
  email: string
}

export function EmailVerificationBanner({ email }: EmailVerificationBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Mail className="h-4 w-4 flex-shrink-0 text-amber-400" />
          <p className="text-sm text-amber-300">
            Please verify your email address.{' '}
            <span className="font-medium text-amber-200">
              Check your inbox at {email}
            </span>{' '}
            for a verification link.
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 text-amber-400 transition-colors hover:text-amber-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
