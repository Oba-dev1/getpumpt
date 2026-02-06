'use client'

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { MemberActionState } from '@/components/member/MemberActionForm'
import { cn } from '@/lib/utils'

type BannerState = MemberActionState & { visible: boolean }

interface MemberActionContextValue {
  setBanner: (state: MemberActionState) => void
}

const MemberActionContext = createContext<MemberActionContextValue | null>(null)

export function MemberActionProvider({ children }: { children: React.ReactNode }) {
  const [banner, setBannerState] = useState<BannerState>({
    status: 'idle',
    visible: false,
  })

  const setBanner = useCallback((state: MemberActionState) => {
    if (state.status === 'idle') {
      setBannerState({ status: 'idle', visible: false })
      return
    }
    setBannerState({ ...state, visible: true })
  }, [])

  const value = useMemo(() => ({ setBanner }), [setBanner])

  return (
    <MemberActionContext.Provider value={value}>
      <div className="space-y-3">
        <MemberActionBanner banner={banner} onDismiss={() => setBannerState({ status: 'idle', visible: false })} />
        {children}
      </div>
    </MemberActionContext.Provider>
  )
}

export function useMemberActionBanner() {
  return useContext(MemberActionContext)
}

function MemberActionBanner({
  banner,
  onDismiss,
}: {
  banner: BannerState
  onDismiss: () => void
}) {
  if (!banner.visible) {
    return null
  }

  const isSuccess = banner.status === 'success'
  const message = banner.message || (isSuccess ? 'Saved.' : 'Something went wrong.')

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm',
        isSuccess
          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
          : 'border-rose-500/40 bg-rose-500/10 text-rose-200'
      )}
      role="status"
    >
      <span>{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        className="text-xs uppercase tracking-[0.2em] text-slate-300 hover:text-white"
      >
        Dismiss
      </button>
    </div>
  )
}
