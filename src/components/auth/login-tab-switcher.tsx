'use client'

type LoginTab = 'email' | 'phone'

interface LoginTabSwitcherProps {
  active: LoginTab
  onChange: (tab: LoginTab) => void
}

export function LoginTabSwitcher({ active, onChange }: LoginTabSwitcherProps) {
  return (
    <div className="mb-6 flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
      {(['email', 'phone'] as LoginTab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={`flex-1 rounded-lg py-2.5 text-sm font-semibold capitalize transition-all duration-300 ${
            active === tab
              ? 'bg-[rgb(var(--gym-primary))] text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {tab === 'email' ? 'Email' : 'Phone (OTP)'}
        </button>
      ))}
    </div>
  )
}
