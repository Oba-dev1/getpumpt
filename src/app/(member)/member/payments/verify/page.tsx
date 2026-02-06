'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { verifyMembershipPayment } from '@/lib/actions/payments'
import { toast } from 'sonner'

export default function PaymentVerificationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const [verifying, setVerifying] = useState(true)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentDetails, setPaymentDetails] = useState<any>(null)

  const reference = searchParams.get('reference')

  useEffect(() => {
    async function verifyPayment() {
      if (!session?.user?.gymId || !reference) {
        setError('Invalid payment reference')
        setVerifying(false)
        return
      }

      try {
        const result = await verifyMembershipPayment(session.user.gymId, reference)
        setPaymentDetails(result)
        setSuccess(true)
        toast.success('Payment verified successfully')
      } catch (err: any) {
        setError(err.message || 'Payment verification failed')
        toast.error('Payment verification failed')
      } finally {
        setVerifying(false)
      }
    }

    if (session?.user?.gymId && reference) {
      verifyPayment()
    }
  }, [session, reference])

  if (verifying) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Verifying Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center">
              <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
            </div>
            <p className="text-center text-sm text-gray-600">
              Please wait while we verify your payment...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Payment Failed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-sm text-gray-600">{error}</p>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/member/membership')}
              >
                Back to Membership
              </Button>
              <Button variant="gym" onClick={() => router.push('/member/payments')}>
                View Payments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle2 className="h-6 w-6" />
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-gray-600">
            Your payment has been verified successfully
          </p>

          {paymentDetails && (
            <div className="space-y-2 rounded-lg bg-gray-50 p-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600">Amount Paid</span>
                <span className="font-semibold text-gray-900">
                  {paymentDetails.currency} {paymentDetails.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600">Status</span>
                <span className="font-semibold text-green-600">
                  {paymentDetails.status}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-600">Reference</span>
                <span className="font-mono text-xs text-gray-700">{reference}</span>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/member/membership')}
            >
              View Membership
            </Button>
            <Button variant="gym" onClick={() => router.push('/member/payments')}>
              View Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
