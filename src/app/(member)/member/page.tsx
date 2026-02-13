import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  Calendar,
  CreditCard,
  Dumbbell,
  ChevronRight,
  Bell,
  Wallet,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getMemberDashboardData } from '@/lib/actions/member-portal'

export const dynamic = 'force-dynamic'

export default async function MemberDashboard() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const firstName = session.user.name?.split(' ')[0] || 'Member'
  const dashboard = await getMemberDashboardData()
  const membership = dashboard.membership
  const upcomingBookings = dashboard.upcomingBookings
  const recentPayments = dashboard.recentPayments

  return (
    <main className="member-stack" aria-labelledby="member-dashboard-title">
      {/* Welcome banner */}
      <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-r from-indigo-500/10 via-slate-900/50 to-slate-900/30 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Member Portal
            </p>
            <h1
              id="member-dashboard-title"
              className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
            >
              Welcome back, {firstName}!
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Here is what is happening with your membership.
            </p>
          </div>
          <Button variant="gym" asChild className="h-10 gap-2 rounded-xl px-5 text-sm font-medium">
            <Link href="/member/classes">
              <Calendar className="h-4 w-4" />
              Book a Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Member summary"
      >
        <Card className="member-card group transition-all duration-200 hover:border-indigo-500/20">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Membership</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10">
              <CreditCard className="h-4 w-4 text-indigo-400" />
            </span>
          </CardHeader>
          <CardContent className="member-card-content">
            {membership ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span className="font-medium">{membership.plan.name}</span>
                  <StatusBadge status={membership.status} />
                </div>
                <p className="text-xs text-slate-500">
                  Renews {formatDate(membership.endDate)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No active membership plan yet.
              </p>
            )}
            <Button variant="link" className="mt-2 h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300" asChild>
              <Link href="/member/membership">
                View Membership
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card group transition-all duration-200 hover:border-cyan-500/20">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Next Booking</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10">
              <Calendar className="h-4 w-4 text-cyan-400" />
            </span>
          </CardHeader>
          <CardContent className="member-card-content">
            {upcomingBookings.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  {upcomingBookings[0].schedule.gymClass.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatDate(upcomingBookings[0].date)} ·{' '}
                  {upcomingBookings[0].schedule.trainer.firstName}{' '}
                  {upcomingBookings[0].schedule.trainer.lastName}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No upcoming bookings.</p>
            )}
            <Button variant="link" className="mt-2 h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300" asChild>
              <Link href="/member/bookings">
                My Bookings
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card group transition-all duration-200 hover:border-emerald-500/20">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Payments</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <Wallet className="h-4 w-4 text-emerald-400" />
            </span>
          </CardHeader>
          <CardContent className="member-card-content">
            {recentPayments.length > 0 ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">
                  {formatCurrency(recentPayments[0].amount, recentPayments[0].currency)}
                </p>
                <p className="text-xs text-slate-500">{formatDate(recentPayments[0].createdAt)}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No payments yet.</p>
            )}
            <Button variant="link" className="mt-2 h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300" asChild>
              <Link href="/member/payments">
                View Payments
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card group transition-all duration-200 hover:border-amber-500/20">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Notifications</CardTitle>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10">
              <Bell className="h-4 w-4 text-amber-400" />
            </span>
          </CardHeader>
          <CardContent className="member-card-content">
            <p className="text-sm font-medium text-slate-200">
              {dashboard.unreadNotifications} unread
            </p>
            <p className="text-xs text-slate-500">alert(s)</p>
            <Button variant="link" className="mt-2 h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300" asChild>
              <Link href="/member/notifications">
                View Notifications
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Activity sections */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Member activity">
        <Card className="member-card">
          <CardHeader className="member-card-header flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-white">Upcoming Bookings</CardTitle>
            <Dumbbell className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="member-card-content space-y-3">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-slate-500">No upcoming bookings.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-100">{booking.schedule.gymClass.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatDate(booking.date)} · {booking.schedule.trainer.firstName}{' '}
                        {booking.schedule.trainer.lastName}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </li>
                ))}
              </ul>
            )}
            <Button variant="link" className="h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300" asChild>
              <Link href="/member/bookings">
                Manage bookings
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card">
          <CardHeader className="member-card-header flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold text-white">Recent Payments</CardTitle>
            <Wallet className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent className="member-card-content space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-500">No recent payments.</p>
            ) : (
              <ul className="space-y-3">
                {recentPayments.map((payment) => (
                  <li
                    key={payment.id}
                    className="flex items-center justify-between rounded-xl border border-white/[0.04] bg-white/[0.02] px-3 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium text-slate-100">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {payment.planName ?? 'Membership'} · {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </li>
                ))}
              </ul>
            )}
            <Button variant="link" className="h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300" asChild>
              <Link href="/member/payments">
                View all payments
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
