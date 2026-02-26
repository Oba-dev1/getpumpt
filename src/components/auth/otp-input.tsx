'use client'

import { useRef, type KeyboardEvent, type ClipboardEvent } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

const DIGITS = 6

export function OtpInput({ value, onChange, disabled }: OtpInputProps) {
  const refs = useRef<(HTMLInputElement | null)[]>([])

  const chars = value.padEnd(DIGITS, '').split('').slice(0, DIGITS)

  const updateValue = (index: number, char: string) => {
    const next = chars.map((c, i) => (i === index ? char : c)).join('').replace(/[^0-9]/g, '')
    onChange(next.slice(0, DIGITS))
  }

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/[^0-9]/g, '').slice(-1)
    updateValue(index, digit)
    if (digit && index < DIGITS - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (chars[index]) {
        updateValue(index, '')
      } else if (index > 0) {
        refs.current[index - 1]?.focus()
        updateValue(index - 1, '')
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      refs.current[index - 1]?.focus()
    } else if (e.key === 'ArrowRight' && index < DIGITS - 1) {
      refs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, DIGITS)
    onChange(pasted)
    const nextFocus = Math.min(pasted.length, DIGITS - 1)
    refs.current[nextFocus]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: DIGITS }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={chars[i] ?? ''}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-12 h-14 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center text-xl font-bold text-white backdrop-blur-sm transition-all duration-300 focus:border-[rgb(var(--gym-primary))] focus:outline-none focus:ring-1 focus:ring-[rgba(var(--gym-primary-rgb),0.3)] disabled:cursor-not-allowed disabled:opacity-50"
        />
      ))}
    </div>
  )
}
