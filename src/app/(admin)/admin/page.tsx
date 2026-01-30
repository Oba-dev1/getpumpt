import { auth } from '@/lib/auth'
import { getDashboardStats } from '@/lib/actions/dashboard'
import { StatsCard } from '@/components/admin/StatsCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import {
  Users,
  DollarSign,
  UserPlus,
  CalendarCheck,
  AlertCircle,
  ArrowUpRight,
  PlusCircle,
  CreditCard,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const stats = await getDashboardStats(session.user.gymId)
  const currency = stats.recentPayments[0]?.currency ?? 'NGN'
  const revenueFormatter = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  })
  const maxPlanCount =
    stats.membershipBreakdown.length > 0
      ? Math.max(...stats.membershipBreakdown.map((plan) => plan.count))
      : 0

  return (
    <main className="space-y-6" aria-labelledby="dashboard-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 id="dashboard-title" className="text-3xl font-semibold text-gray-900">
          Dashboard
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="gym" asChild>
            <Link href="/admin/members/new">
              <PlusCircle className="h-4 w-4" />
              Add Member
            </Link>
          </Button>
          <Button variant="gym-outline" asChild>
            <Link href="/admin/plans/new">
              <CreditCard className="h-4 w-4" />
              Create Plan
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/members">
              <ArrowUpRight className="h-4 w-4" />
              View Members
            </Link>
          </Button>
        </div>
      </div>

      {stats.expiringMemberships > 0 && (
        <div
          className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900"
          role="status"
          aria-live="polite"
        >
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            {stats.expiringMemberships} membership(s) expiring in the next 7
            days
          </p>
        </div>
      )}

      <section aria-labelledby="dashboard-stats">
        <h2 id="dashboard-stats" className="sr-only">
          Key metrics
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={stats.totalMembers}
          icon={<Users className="h-6 w-6" />}
          description="Active members"
        />
        <StatsCard
          title="Monthly Revenue"
          value={revenueFormatter.format(stats.monthlyRevenue)}
          icon={<DollarSign className="h-6 w-6" />}
          description="This month"
        />
        <StatsCard
          title="New Members"
          value={stats.newMembersThisMonth}
          icon={<UserPlus className="h-6 w-6" />}
          description="This month"
        />
        <StatsCard
          title="Today's Bookings"
          value={stats.todayBookings}
          icon={<CalendarCheck className="h-6 w-6" />}
          description="Confirmed bookings"
        />
      </div>
      </section>

      <section
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
        aria-labelledby="dashboard-updates"
      >
        <h2 id="dashboard-updates" className="sr-only">
          Membership updates and payments
        </h2>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-gray-900">Expiring Memberships</CardTitle>
            <Button variant="link" asChild className="px-0 text-sm">
              <Link href="/admin/members">View all members</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.expiringMembershipList.length === 0 ? (
              <p className="text-sm text-gray-600">No memberships expiring soon</p>
            ) : (
              <ul className="space-y-4" role="list">
                {stats.expiringMembershipList.map((membership) => (
                  <li
                    key={membership.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex flex-col">
                      <Link
                        href={`/admin/members/${membership.memberId}`}
                        className="font-medium text-gray-900 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        {membership.memberName}
                      </Link>
                      <span className="text-xs text-gray-600">
                        {membership.planName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(membership.endDate).toLocaleDateString()}
                      </span>
                      <span className="block text-xs text-amber-700">
                        Expires soon
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-gray-900">Recent Payments</CardTitle>
            <Button variant="link" asChild className="px-0 text-sm">
              <Link href="/admin/payments">View all payments</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-gray-600">No payments yet</p>
            ) : (
              <Table>
                <caption className="sr-only">
                  Latest payment transactions
                </caption>
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col">Member</TableHead>
                    <TableHead scope="col">Amount</TableHead>
                    <TableHead scope="col">Status</TableHead>
                    <TableHead scope="col">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {payment.memberName}
                          </span>
                          <span className="text-xs text-gray-600">
                            {payment.memberEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: payment.currency,
                          maximumFractionDigits: 0,
                        }).format(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
            <CardTitle className="text-gray-900">Membership Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.membershipBreakdown.length === 0 ? (
              <p className="text-sm text-gray-600">No active memberships</p>
            ) : (
              <ul className="space-y-4" role="list">
                {stats.membershipBreakdown.map((plan) => (
                  <li key={plan.planName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {plan.planName}
                      </span>
                      <span className="text-sm text-gray-700">
                        {plan.count} {plan.count === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full bg-gray-100"
                      role="progressbar"
                      aria-valuenow={plan.count}
                      aria-valuemin={0}
                      aria-valuemax={maxPlanCount || 0}
                      aria-label={`${plan.planName} membership share`}
                    >
                      <div
                        className="h-2 rounded-full bg-indigo-600"
                        style={{
                          width: maxPlanCount
                            ? `${(plan.count / maxPlanCount) * 100}%`
                            : '0%',
                        }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
