/**
 * Paystack Payment Integration
 *
 * This module provides integration with Paystack payment gateway.
 * Requires PAYSTACK_SECRET_KEY and PAYSTACK_PUBLIC_KEY environment variables.
 */

const PAYSTACK_API_BASE = 'https://api.paystack.co'

interface InitializePaymentParams {
  email: string
  amount: number
  reference?: string
  currency?: string
  metadata?: Record<string, any>
  callback_url?: string
}

interface InitializePaymentResponse {
  status: boolean
  message: string
  data: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

interface VerifyPaymentResponse {
  status: boolean
  message: string
  data: {
    id: number
    domain: string
    status: 'success' | 'failed' | 'abandoned'
    reference: string
    amount: number
    message: string
    gateway_response: string
    paid_at: string
    created_at: string
    channel: string
    currency: string
    ip_address: string
    metadata: Record<string, any>
    customer: {
      id: number
      email: string
      customer_code: string
    }
    authorization: {
      authorization_code: string
      bin: string
      last4: string
      exp_month: string
      exp_year: string
      channel: string
      card_type: string
      bank: string
      country_code: string
      brand: string
    }
  }
}

/**
 * Initialize a payment transaction
 *
 * @param params - Payment initialization parameters
 * @returns Authorization URL and payment reference
 */
export async function initializePayment(
  params: InitializePaymentParams
): Promise<InitializePaymentResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  const amountInKobo = Math.round(params.amount * 100)

  const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: params.email,
      amount: amountInKobo,
      reference: params.reference,
      currency: params.currency || 'NGN',
      metadata: params.metadata,
      callback_url: params.callback_url,
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to initialize payment')
  }

  return response.json()
}

/**
 * Verify a payment transaction
 *
 * @param reference - Payment reference from initialization
 * @returns Payment verification details
 */
export async function verifyPayment(
  reference: string
): Promise<VerifyPaymentResponse> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  const response = await fetch(
    `${PAYSTACK_API_BASE}/transaction/verify/${reference}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
      },
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'Failed to verify payment')
  }

  return response.json()
}

/**
 * Generate a unique payment reference using cryptographically secure random
 *
 * @param prefix - Optional prefix for the reference
 * @returns Unique payment reference
 */
export function generatePaymentReference(prefix = 'GYM'): string {
  const crypto = require('crypto')
  const timestamp = Date.now()
  // Use cryptographically secure random bytes
  const randomBytes = crypto.randomBytes(6)
  const random = randomBytes.toString('base64url').toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

/**
 * Convert amount to kobo (Paystack's smallest currency unit)
 *
 * @param amount - Amount in naira
 * @returns Amount in kobo
 */
export function toKobo(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert amount from kobo to naira
 *
 * @param kobo - Amount in kobo
 * @returns Amount in naira
 */
export function fromKobo(kobo: number): number {
  return kobo / 100
}

/**
 * Validate webhook signature from Paystack
 *
 * @param signature - Signature from webhook header
 * @param payload - Webhook payload
 * @returns Whether signature is valid
 */
export async function validateWebhookSignature(
  signature: string,
  payload: string
): Promise<boolean> {
  const secretKey = process.env.PAYSTACK_SECRET_KEY

  if (!secretKey) {
    throw new Error('PAYSTACK_SECRET_KEY is not configured')
  }

  const crypto = await import('crypto')
  const hash = crypto
    .createHmac('sha512', secretKey)
    .update(payload)
    .digest('hex')

  try {
    // Use timing-safe comparison to prevent timing attacks
    // Both signatures must be the same length for timingSafeEqual
    if (hash.length !== signature.length) {
      return false
    }

    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(signature, 'hex')
    )
  } catch (error) {
    // If signature is not valid hex or other error, return false
    return false
  }
}
