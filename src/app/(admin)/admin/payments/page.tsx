'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SearchInput } from '@/components/admin/SearchInput'
import { Pagination } from '@/components/admin/Pagination'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  RefreshCcw,
  X,
  Calendar,
  MoreVertical,
  RotateCcw,
} from 'lucide-react'
import { toast } from 'sonner'
import { getPayments, refundPayment } from '@/lib/actions/payments'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type PaymentStatus = 'all' | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

const methodOptions = [
  { value: 'all', label: 'All Methods' },
  { value: 'CASH', label: 'Cash' },
  { value: 'CARD', label: 'Card' },
  { value: 'BANK_TRANSFER', label: 'Bank transfer' },
  { value: 'PAYSTACK', label: 'Paystack' },
]

export default function PaymentsPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PaymentStatus>('all')
  const [method, setMethod] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayments, setTotalPayments] = useState(0)
  const [refundDialogOpen, setRefundDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')
  const [refunding, setRefunding] = useState(false)

  const fetchPayments = async () => {
    if (!session?.user?.gymId) return

    setLoading(true)
    setErrorMessage(null)
    try {
      const result = await getPayments(session.user.gymId, {
        search: search || undefined,
        status: status === 'all' ? undefined : status,
        method: method === 'all' ? undefined : method,
        dateFrom: dateFrom ? new Date(dateFrom) : undefined,
        dateTo: dateTo ? new Date(dateTo) : undefined,
        page: currentPage,
        limit: 20,
      })

      setPayments(result.payments)
      setTotalPages(result.totalPages)
      setTotalPayments(result.total)
    } catch (error) {
      setErrorMessage('Unable to load payments right now.')
      toast.error('Failed to load payments')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPayments()
  }, [session, search, status, method, dateFrom, dateTo, currentPage])

  const handleClearFilters = () => {
    setSearch('')
    setStatus('all')
    setMethod('all')
    setDateFrom('')
    setDateTo('')
    setCurrentPage(1)
  }

  const openRefundDialog = (payment: any) => {
    setSelectedPayment(payment)
    setRefundAmount('')
    setRefundReason('')
    setRefundDialogOpen(true)
  }

  const refundValidation = useMemo(() => {
    if (!selectedPayment) return null
    if (!refundAmount) return null
    const amount = Number(refundAmount)
    if (Number.isNaN(amount)) return 'Enter a valid refund amount'
    if (amount <= 0) return 'Refund amount must be greater than 0'
    if (amount > selectedPayment.amount) return 'Refund amount cannot exceed payment amount'
    if (amount < selectedPayment.amount && !refundReason.trim()) {
      return 'Reason is required for partial refunds'
    }
    return null
  }, [refundAmount, refundReason, selectedPayment])

  const handleRefund = async () => {
    if (!session?.user?.gymId || !selectedPayment) return
    if (refundValidation) return

    setRefunding(true)
    try {
      await refundPayment(session.user.gymId, selectedPayment.id, {
        amount: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason.trim() || undefined,
      })
      toast.success('Payment refunded')
      await fetchPayments()
      setRefundDialogOpen(false)
      setSelectedPayment(null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to refund payment')
    } finally {
      setRefunding(false)
    }
  }

  const emptyStateCopy = useMemo(() => {
    if (search || status !== 'all' || method !== 'all' || dateFrom || dateTo) {
      return 'No payments match your filters.'
    }
    return 'No payments recorded yet.'
  }, [search, status, method, dateFrom, dateTo])

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-4" aria-labelledby="payments-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 id="payments-title" className="text-2xl font-semibold tracking-tight text-gray-900">
            Payments
          </h1>
          <p className="mt-1 text-sm text-gray-600" aria-live="polite">
            {loading ? 'Loading payments...' : `${totalPayments} payments found`}
          </p>
        </div>
      </div>

      <Card className="border-gray-200 bg-slate-950/90">
        <CardHeader className="flex flex-col gap-3 rounded-t-xl border-b border-gray-200 bg-slate-900/90 py-4 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base text-gray-900">Filters</CardTitle>
          {(search || status !== 'all' || method !== 'all' || dateFrom || dateTo) && (
            <Button variant="link" className="h-auto px-0 text-sm" onClick={handleClearFilters}>
              <X className="h-4 w-4" />
              Clear filters
            </Button>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3 pt-4 lg:flex-row lg:items-center lg:justify-between">
          <SearchInput
            placeholder="Search by member or reference..."
            ariaLabel="Search payments by member or reference"
            onSearch={(value) => {
              setSearch(value)
              setCurrentPage(1)
            }}
            className="w-full lg:w-96"
            defaultValue={search}
          />
          <div className="flex w-full flex-wrap items-center gap-2.5 lg:w-auto">
            <Select value={status} onValueChange={(value) => setStatus(value as PaymentStatus)}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Method" />
              </SelectTrigger>
              <SelectContent>
                {methodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="sr-only" htmlFor="paymentFrom">From date</label>
                <Input
                  id="paymentFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-36"
                />
              </div>
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <label className="sr-only" htmlFor="paymentTo">To date</label>
                <Input
                  id="paymentTo"
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full sm:w-36"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <section aria-labelledby="payments-table">
        <h2 id="payments-table" className="sr-only">
          Payments list
        </h2>
        <div className="rounded-lg border border-gray-200 bg-slate-950/90">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <p className="text-sm text-gray-600">{errorMessage}</p>
              <Button variant="outline" onClick={fetchPayments}>
                <RefreshCcw className="h-4 w-4" />
                Retry
              </Button>
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600">{emptyStateCopy}</p>
              {(search || status !== 'all' || method !== 'all' || dateFrom || dateTo) && (
                <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <Table>
                <caption className="sr-only">Payment records</caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Member</TableHead>
                    <TableHead scope="col">Amount</TableHead>
                    <TableHead scope="col">Method</TableHead>
                    <TableHead scope="col">Date</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col" className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium text-gray-900">
                        <Button
                          variant="link"
                          className="h-auto px-0 text-left text-gray-900"
                          onClick={() => router.push(`/admin/payments/${payment.id}`)}
                        >
                          <div className="flex flex-col">
                            <span>{payment.memberName}</span>
                            <span className="text-xs text-gray-500">{payment.memberEmail}</span>
                          </div>
                        </Button>
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: payment.currency,
                          maximumFractionDigits: 0,
                        }).format(payment.amount)}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        {payment.paymentMethod || '—'}
                      </TableCell>
                      <TableCell className="text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" aria-hidden="true" />
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Open actions for ${payment.memberName}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/admin/payments/${payment.id}`)}>
                              View details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openRefundDialog(payment)}
                              disabled={payment.status !== 'COMPLETED'}
                              className="text-red-600"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Refund
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalPayments}
                itemsPerPage={20}
              />
            </>
          )}
        </div>
      </section>
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
            {selectedPayment && !refundAmount && (
              <p className="text-xs text-gray-500">
                Full refund:{' '}
                {new Intl.NumberFormat('en-NG', {
                  style: 'currency',
                  currency: selectedPayment.currency,
                  maximumFractionDigits: 0,
                }).format(selectedPayment.amount)}
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
            {refundAmount &&
              selectedPayment &&
              Number(refundAmount) < selectedPayment.amount &&
              !refundReason.trim() && (
                <p className="text-sm text-amber-700">
                  Partial refunds require a reason.
                </p>
              )}
          </div>
        </div>
      </ConfirmDialog>
    </main>
  )
}
