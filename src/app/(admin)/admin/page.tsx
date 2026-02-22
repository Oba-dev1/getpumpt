import { auth } from '@/lib/auth'
import { getDashboardStats } from '@/lib/actions/dashboard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowUpRight,
  CalendarCheck,
  CreditCard,
  DollarSign,
  PlusCircle,
  Sparkles,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react'
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
  const topPlans = stats.membershipBreakdown.slice(0, 4)
  const totalPlanMembers = topPlans.reduce((sum, plan) => sum + plan.count, 0)
  const donutColors = ['#22d3ee', '#3b82f6', '#a855f7', '#f59e0b']
  const donutSegments = topPlans.reduce<{
    cursor: number
    segments: string[]
  }>(
    (acc, plan, index) => {
      const ratio = totalPlanMembers > 0 ? plan.count / totalPlanMembers : 0
      const start = acc.cursor
      const end = start + ratio * 360

      acc.segments.push(
        `${donutColors[index % donutColors.length]} ${start}deg ${end}deg`
      )

      return {
        cursor: end,
        segments: acc.segments,
      }
    },
    { cursor: 0, segments: [] }
  ).segments
  const donutBackground =
    donutSegments.length > 0
      ? `conic-gradient(${donutSegments.join(', ')})`
      : 'conic-gradient(#1e293b 0deg 360deg)'

  const paymentSeries = stats.recentPayments.slice(0, 6).reverse()
  const maxPaymentAmount = Math.max(
    ...paymentSeries.map((payment) => payment.amount),
    1
  )

  const firstName = session.user.name?.split(' ')[0] || 'Admin'

  return (
    <main className="space-y-6" aria-labelledby="dashboard-title">
      {/* Welcome banner with quick actions */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Admin Dashboard
            </p>
            <h1
              id="dashboard-title"
              className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
            >
              Welcome back, {firstName}
            </h1>
            <p className="max-w-lg text-sm text-slate-300">
              Monitor growth, manage members, and keep payments on track from one dashboard.
            </p>
          </div>

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
            <Button variant="outline" asChild className="border-slate-600 bg-slate-800/80 text-slate-100 hover:bg-slate-700">
              <Link href="/admin/members">
                <ArrowUpRight className="h-4 w-4" />
                View Members
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Key metrics - single row, no duplicates */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">
        <Card className="group border-white/10 bg-slate-900/80 text-slate-100 transition-colors hover:border-cyan-500/20">
          <CardContent className="flex items-start justify-between p-5">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Total Members</p>
              <p className="text-3xl font-bold tracking-tight text-white">{stats.totalMembers}</p>
              <p className="text-xs text-slate-500">Active member base</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="group border-white/10 bg-slate-900/80 text-slate-100 transition-colors hover:border-emerald-500/20">
          <CardContent className="flex items-start justify-between p-5">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Monthly Revenue</p>
              <p className="text-3xl font-bold tracking-tight text-white">
                {revenueFormatter.format(stats.monthlyRevenue)}
              </p>
              <p className="text-xs text-slate-500">Current month</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="group border-white/10 bg-slate-900/80 text-slate-100 transition-colors hover:border-fuchsia-500/20">
          <CardContent className="flex items-start justify-between p-5">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">New Members</p>
              <p className="text-3xl font-bold tracking-tight text-white">{stats.newMembersThisMonth}</p>
              <p className="text-xs text-slate-500">This month</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300">
              <UserPlus className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="group border-white/10 bg-slate-900/80 text-slate-100 transition-colors hover:border-amber-500/20">
          <CardContent className="flex items-start justify-between p-5">
            <div className="space-y-2">
              <p className="text-sm text-slate-400">Today&apos;s Bookings</p>
              <p className="text-3xl font-bold tracking-tight text-white">{stats.todayBookings}</p>
              <p className="text-xs text-slate-500">Scheduled today</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Analytics charts */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12" aria-label="Analytics charts">
        <Card className="border-white/10 bg-slate-900/80 text-slate-100 xl:col-span-4">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-base text-white">Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 pt-5">
            <div className="flex items-center gap-5">
              <div
                className="relative h-28 w-28 shrink-0 rounded-full"
                style={{ background: donutBackground }}
                role="img"
                aria-label="Membership plan distribution donut chart"
              >
                <div className="absolute inset-[16%] rounded-full bg-slate-900" />
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-slate-200">
                  {totalPlanMembers}
                </div>
              </div>
              <div className="space-y-2">
                {topPlans.length === 0 ? (
                  <p className="text-sm text-slate-400">No plan data yet.</p>
                ) : (
                  topPlans.map((plan, index) => (
                    <div key={plan.planName} className="flex items-center gap-2 text-xs text-slate-300">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: donutColors[index % donutColors.length] }}
                        aria-hidden="true"
                      />
                      <span>
                        {plan.planName} ({plan.count})
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/80 text-slate-100 xl:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
            <CardTitle className="text-base text-white">Revenue Snapshot</CardTitle>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300">
              <TrendingUp className="h-3.5 w-3.5" />
              Last 6 payments
            </span>
          </CardHeader>
          <CardContent className="pt-5">
            {paymentSeries.length === 0 ? (
              <p className="text-sm text-slate-400">No payment activity yet.</p>
            ) : (
              <div className="grid grid-cols-6 items-end gap-3">
                {paymentSeries.map((payment) => {
                  const height = Math.max(
                    Math.round((payment.amount / maxPaymentAmount) * 100),
                    8
                  )

                  return (
                    <div key={payment.id} className="space-y-2">
                      <div className="h-36 rounded-lg bg-slate-800/60 p-1">
                        <div
                          className="w-full rounded-md bg-gradient-to-t from-indigo-500 to-cyan-400"
                          style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <p className="truncate text-center text-[10px] text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Payments table and breakdown */}
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-12" aria-label="Dashboard details">
        <Card className="border-white/10 bg-slate-900/80 text-slate-100 xl:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 pb-4">
            <CardTitle className="text-base text-white">Recent Payments</CardTitle>
            <Button variant="link" asChild className="text-indigo-400 hover:text-indigo-300">
              <Link href="/admin/payments">View all</Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-2">
            {stats.recentPayments.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">No payments yet.</p>
            ) : (
              <Table>
                <caption className="sr-only">Latest payment transactions</caption>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-transparent">
                    <TableHead className="text-slate-400">Member</TableHead>
                    <TableHead className="text-slate-400">Amount</TableHead>
                    <TableHead className="text-slate-400">Status</TableHead>
                    <TableHead className="text-slate-400">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.recentPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-white/10 hover:bg-slate-800/60">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{payment.memberName}</span>
                          <span className="text-xs text-slate-400">{payment.memberEmail}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-slate-100">
                        {new Intl.NumberFormat('en-NG', {
                          style: 'currency',
                          currency: payment.currency,
                          maximumFractionDigits: 0,
                        }).format(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="text-sm text-slate-400">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-slate-900/80 text-slate-100 xl:col-span-4">
          <CardHeader className="border-b border-white/10 pb-4">
            <CardTitle className="text-base text-white">Membership Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-5">
            {stats.membershipBreakdown.length === 0 ? (
              <p className="text-sm text-slate-400">No active memberships yet.</p>
            ) : (
              <ul className="space-y-4" role="list">
                {stats.membershipBreakdown.map((plan) => (
                  <li key={plan.planName} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-200">{plan.planName}</span>
                      <span className="text-xs text-slate-400">
                        {plan.count} {plan.count === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <div
                      className="h-2 w-full rounded-full bg-slate-800"
                      role="progressbar"
                      aria-valuenow={plan.count}
                      aria-valuemin={0}
                      aria-valuemax={maxPlanCount || 0}
                      aria-label={`${plan.planName} membership share`}
                    >
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400"
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
