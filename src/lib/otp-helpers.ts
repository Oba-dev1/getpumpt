/**
 * OTP utility helpers — phone normalisation, code generation, hashing.
 * Not a 'use server' file — safe to import from both server and client contexts.
 */

import crypto from 'crypto'

// Phone normalisation lives in the client-safe utils module so browser code
// (e.g. Excel import preview) can share the exact same E.164 logic without
// pulling this file's node:crypto import into the client bundle.
export { normalizePhone } from '@/lib/utils'

const OTP_MAX_ATTEMPTS = 5

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
