const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export async function verifyTurnstile(token: string, ip?: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  // Skip verification in development when keys are not configured
  if (!secretKey) {
    return process.env.NODE_ENV !== 'production'
  }

  try {
    const response = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: secretKey, response: token, remoteip: ip }),
    })
    const data = await response.json() as { success: boolean }
    return data.success === true
  } catch {
    return false
  }
}
