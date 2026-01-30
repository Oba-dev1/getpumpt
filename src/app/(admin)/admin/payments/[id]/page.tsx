'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  ArrowLeft,
  Calendar,
  Mail,
  CreditCard,
  Hash,
  RotateCcw,
} from 'lucide-react'
import { getPaymentById, refundPayment } from '@/lib/actions/payments'
import { toast } from 'sonner'

export default function PaymentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [payment, setPayment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [refunding, setRefunding] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const paymentId = params.id as string

  useEffect(() => {
    async function fetchPayment() {
      if (!session?.user?.gymId || !paymentId) return

      setLoading(true)
      try {
        const result = await getPaymentById(session.user.gymId, paymentId)
        setPayment(result)
      } catch (error: any) {
        toast.error(error.message || 'Failed to load payment')
        router.push('/admin/payments')
      } finally {
        setLoading(false)
      }
    }

    fetchPayment()
  }, [session, paymentId, router])

  const refundValidation = useMemo(() => {
    if (!payment) return null
    if (!refundAmount) return null
    const amount = Number(refundAmount)
    if (Number.isNaN(amount)) return 'Enter a valid refund amount'
    if (amount <= 0) return 'Refund amount must be greater than 0'
    if (amount > payment.amount) return 'Refund amount cannot exceed payment amount'
    return null
  }, [refundAmount, payment])

  const handleRefund = async () => {
    if (!session?.user?.gymId || !paymentId) return
    if (refundValidation) return

    setRefunding(true)
    try {
      await refundPayment(session.user.gymId, paymentId, {
        amount: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason.trim() || undefined,
      })
      toast.success('Payment refunded')
      const refreshed = await getPaymentById(session.user.gymId, paymentId)
      setPayment(refreshed)
      setRefundDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to refund payment')
    } finally {
      setRefunding(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  const formattedAmount = payment
    ? new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: payment.currency,
        maximumFractionDigits: 0,
      }).format(payment.amount)
    : ''

  return (
    <main className="space-y-6" aria-labelledby="payment-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/payments')}>
            <ArrowLeft className="h-4 w-4" />
            Back to payments
          </Button>
          <h1 id="payment-title" className="mt-4 text-3xl font-semibold text-gray-900">
            Payment Details
          </h1>
        </div>
        {payment && (
          <Button
            variant="destructive"
            onClick={() => setRefundDialogOpen(true)}
            disabled={payment.status !== 'COMPLETED'}
          >
            <RotateCcw className="h-4 w-4" />
            Refund
          </Button>
        )}
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : payment ? (
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-xl font-semibold text-gray-900">{payment.memberName}</h2>
                <p className="text-sm text-gray-600">{payment.memberEmail}</p>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                    {payment.planName || 'Membership payment'}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {new Date(payment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="space-y-4 rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <StatusBadge status={payment.status} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Amount</span>
                  <span className="text-sm font-medium text-gray-900">{formattedAmount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Method</span>
                  <span className="text-sm font-medium text-gray-900">
                    {payment.paymentMethod || '—'}
                  </span>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {payment && (
        <Card className="border-gray-200">
          <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-lg text-gray-900">Payment metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Mail className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>{payment.memberEmail}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <CreditCard className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>{payment.paymentProvider || '—'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <Hash className="h-4 w-4 text-gray-400" aria-hidden="true" />
              <span>{payment.providerRef || '—'}</span>
            </div>
            {payment.description && (
              <div className="rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                {payment.description}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={refundDialogOpen}
        onOpenChange={setRefundDialogOpen}
        title="Refund payment"
        description="Provide a refund amount (optional) and reason."
        confirmLabel="Refund"
        variant="destructive"
        onConfirm={handleRefund}
        isLoading={refunding}
        confirmDisabled={!!refundValidation}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="refundAmount">Refund amount</Label>
            <Input
              id="refundAmount"
              type="number"
              min="0"
              placeholder="Leave blank for full refund"
              value={refundAmount}
              onChange={(event) => setRefundAmount(event.target.value)}
            />
            {refundValidation && (
              <p className="text-sm text-red-600">{refundValidation}</p>
            )}
            {payment && !refundAmount && (
              <p className="text-xs text-gray-500">
                Full refund: {formattedAmount}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="refundReason">Reason</Label>
            <Textarea
              id="refundReason"
              rows={3}
              value={refundReason}
              onChange={(event) => setRefundReason(event.target.value)}
            />
          </div>
        </div>
      </ConfirmDialog>
    </main>
  )
}
