/**
 * OTP utility helpers — phone normalisation, code generation, hashing.
 * Not a 'use server' file — safe to import from both server and client contexts.
 */

import crypto from 'crypto'

const OTP_MAX_ATTEMPTS = 5

/**
 * Normalise a Nigerian phone number to E.164 format (+234...).
 * Accepts: 08012345678, +2348012345678, 2348012345678
 * Returns: +2348012345678
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.startsWith('234')) {
    return `+${digits}`
  }

  if (digits.startsWith('0') && digits.length >= 10) {
    return `+234${digits.slice(1)}`
  }

  // Already in a usable format — prefix + if missing
  return phone.startsWith('+') ? phone : `+${digits}`
}

/**
 * Generate a cryptographically random 6-digit OTP code.
 */
export function generateOtpCode(): string {
  // Upper bound is exclusive — use 1000000 so 999999 is reachable.
  const code = crypto.randomInt(100000, 1000000)
  return code.toString()
}

/**
 * Hash an OTP code with SHA-256. Codes are never stored in plaintext.
 */
export function hashOtpCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('hex')
}

/**
 * Returns true if the OTP token has passed its expiry time.
 */
export function isOtpExpired(expires: Date): boolean {
  return new Date() > expires
}

/**
 * Returns true if the OTP token has reached the maximum failed attempts.
 */
export function isOtpMaxAttempts(attempts: number): boolean {
  return attempts >= OTP_MAX_ATTEMPTS
}
