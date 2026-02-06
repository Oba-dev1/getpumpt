import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getMemberPayments } from '@/lib/actions/member-portal'

export const dynamic = 'force-dynamic'

export default async function PaymentsPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const payments = await getMemberPayments()

  return (
    <main className="member-stack" aria-labelledby="member-payments-title">
      <header>
        <h1
          id="member-payments-title"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Payment History
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Review receipts and payment status for your membership.
        </p>
      </header>

      <Card className="member-card">
        <CardHeader className="member-card-header">
          <CardTitle className="text-base text-white">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="member-card-content">
          {payments.length === 0 ? (
            <p className="text-sm text-slate-400">No payments recorded yet.</p>
          ) : (
            <Table>
              <TableHeader className="bg-slate-950/60">
                <TableRow>
                  <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Date
                  </TableHead>
                  <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Plan
                  </TableHead>
                  <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Amount
                  </TableHead>
                  <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Method
                  </TableHead>
                  <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-slate-200">
                      {formatDate(payment.createdAt)}
                    </TableCell>
                    <TableCell className="text-slate-200">
                      {payment.planName ?? 'Membership'}
                    </TableCell>
                    <TableCell className="text-slate-200">
                      {formatCurrency(payment.amount, payment.currency)}
                    </TableCell>
                    <TableCell className="text-slate-200">
                      {payment.paymentMethod ?? 'Online'}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payment.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
