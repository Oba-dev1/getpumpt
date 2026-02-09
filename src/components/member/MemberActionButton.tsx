'use client'

import React from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface MemberActionButtonProps {
  children: React.ReactNode
  className?: string
  variant?: React.ComponentProps<typeof Button>['variant']
  size?: React.ComponentProps<typeof Button>['size']
  type?: 'submit' | 'button'
  pendingText?: string
  disabled?: boolean
}

export function MemberActionButton({
  children,
  className,
  variant,
  size,
  type = 'submit',
  pendingText = 'Working...',
  disabled = false,
}: MemberActionButtonProps) {
  const { pending } = useFormStatus()

  return (
    <Button
      variant={variant}
      size={size}
      type={type}
      disabled={pending || disabled}
      className={cn('relative', className)}
    >
      {pending ? (
        <>
          <span className="absolute left-3 inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          <span className="pl-5">{pendingText}</span>
        </>
      ) : (
        children
      )}
    </Button>
  )
}
