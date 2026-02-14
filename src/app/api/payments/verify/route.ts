import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { verifyMembershipPayment } from '@/lib/actions/payments'

/**
 * Paystack callback handler
 *
 * Paystack redirects here after payment. This route verifies the payment
 * and redirects the user back to the member portal with the result.
 * This lives outside the member layout to avoid auth guard issues
 * when the session cookie isn't sent on cross-site redirects.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const reference = searchParams.get('reference') || searchParams.get('trxref')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  if (!reference) {
    return NextResponse.redirect(
      `${appUrl}/member/membership?payment=error&message=Missing+payment+reference`
    )
  }

  const session = await auth()

  if (!session?.user?.gymId) {
    // Session lost during redirect - send to login with return URL
    return NextResponse.redirect(
      `${appUrl}/login?callbackUrl=${encodeURIComponent(`${appUrl}/member/payments/verify?reference=${reference}`)}`
    )
  }

  try {
    const result = await verifyMembershipPayment(session.user.gymId, reference)
    return NextResponse.redirect(
      `${appUrl}/member/payments/verify?reference=${reference}&status=success&amount=${result.amount}&currency=${result.currency}`
    )
  } catch (error: any) {
    return NextResponse.redirect(
      `${appUrl}/member/payments/verify?reference=${reference}&status=error&message=${encodeURIComponent(error.message || 'Verification failed')}`
    )
  }
}
