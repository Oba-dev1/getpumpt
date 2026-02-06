'use client'

import React, { useEffect } from 'react'
import { useFormState } from 'react-dom'
import { toast } from 'sonner'
import { useMemberActionBanner } from '@/components/member/MemberActionContext'

export type MemberActionState = {
  status: 'idle' | 'success' | 'error'
  message?: string
}

const initialState: MemberActionState = { status: 'idle' }

interface MemberActionFormProps {
  action: (prevState: MemberActionState, formData: FormData) => Promise<MemberActionState>
  className?: string
  children: React.ReactNode
}

export function MemberActionForm({
  action,
  className,
  children,
}: MemberActionFormProps) {
  const [state, formAction] = useFormState(action, initialState)
  const banner = useMemberActionBanner()

  useEffect(() => {
    if (state.status === 'idle') return
    banner?.setBanner(state)
    if (state.status === 'success') {
      toast.success(state.message || 'Saved.')
    }
    if (state.status === 'error') {
      toast.error(state.message || 'Something went wrong.')
    }
  }, [banner, state])

  return (
    <form action={formAction} className={className}>
      {children}
    </form>
  )
}
