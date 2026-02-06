import { NextRequest, NextResponse } from 'next/server'
import { validateWebhookSignature } from '@/lib/paystack'
import { handlePaystackWebhook } from '@/lib/actions/payments'
import { webhookRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limiter'

export async function POST(request: NextRequest) {
  try {
    const clientIp = getClientIp(request.headers)
    checkRateLimit(webhookRateLimiter, clientIp)

    const signature = request.headers.get('x-paystack-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const body = await request.text()
    const isValid = await validateWebhookSignature(signature, body)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    const result = await handlePaystackWebhook(event.event, event.data)

    return NextResponse.json({
      success: true,
      message: result.message,
    })
  } catch (error: any) {
    console.error('Paystack webhook error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
