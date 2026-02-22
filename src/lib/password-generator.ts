import crypto from 'crypto'

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const DIGITS = '0123456789'
const SPECIAL = '!@#$%^&*'
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL

export function generateSecurePassword(length: number = 12): string {
  const mandatory = [
    UPPERCASE[crypto.randomInt(UPPERCASE.length)],
    LOWERCASE[crypto.randomInt(LOWERCASE.length)],
    DIGITS[crypto.randomInt(DIGITS.length)],
    SPECIAL[crypto.randomInt(SPECIAL.length)],
  ]

  const remaining = Array.from(
    { length: length - mandatory.length },
    () => ALL_CHARS[crypto.randomInt(ALL_CHARS.length)]
  )

  const chars = [...mandatory, ...remaining]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }

  return chars.join('')
}
