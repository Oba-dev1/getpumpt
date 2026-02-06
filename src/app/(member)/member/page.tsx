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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            id="member-dashboard-title"
            className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            Welcome back, {firstName}!
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Here is what is happening with your membership.
          </p>
        </div>
        <Button variant="gym" asChild className="h-9 px-4 text-sm">
          <Link href="/member/classes">
            <Calendar className="h-4 w-4" />
            Book a Class
          </Link>
        </Button>
      </div>

      <section
        className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
        aria-label="Member summary"
      >
        <Card className="member-card">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-100">Membership</CardTitle>
            <CreditCard className="h-4 w-4 text-cyan-300" />
          </CardHeader>
          <CardContent className="member-card-content">
            {membership ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-200">
                  <span>{membership.plan.name}</span>
                  <StatusBadge status={membership.status} />
                </div>
                <p className="text-xs text-slate-400">
                  Renews {formatDate(membership.endDate)}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                No active membership plan yet.
              </p>
            )}
            <Button variant="link" className="mt-2 px-0 text-cyan-300" asChild>
              <Link href="/member/membership">
                View Membership
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-100">Next Booking</CardTitle>
            <Calendar className="h-4 w-4 text-cyan-300" />
          </CardHeader>
          <CardContent className="member-card-content">
            {upcomingBookings.length > 0 ? (
              <div className="space-y-1 text-xs text-slate-300">
                <p className="text-sm text-slate-200">
                  {upcomingBookings[0].schedule.gymClass.name}
                </p>
                <p>
                  {formatDate(upcomingBookings[0].date)} ·{' '}
                  {upcomingBookings[0].schedule.trainer.firstName}{' '}
                  {upcomingBookings[0].schedule.trainer.lastName}
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No upcoming bookings.</p>
            )}
            <Button variant="link" className="mt-2 px-0 text-cyan-300" asChild>
              <Link href="/member/bookings">
                My Bookings
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-100">Payments</CardTitle>
            <Dumbbell className="h-4 w-4 text-cyan-300" />
          </CardHeader>
          <CardContent className="member-card-content">
            {recentPayments.length > 0 ? (
              <div className="space-y-1 text-xs text-slate-300">
                <p className="text-sm text-slate-200">
                  {formatCurrency(recentPayments[0].amount, recentPayments[0].currency)}
                </p>
                <p>{formatDate(recentPayments[0].createdAt)}</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No payments yet.</p>
            )}
            <Button variant="link" className="mt-2 px-0 text-cyan-300" asChild>
              <Link href="/member/payments">
                View Payments
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card">
          <CardHeader className="member-card-header flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-100">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-cyan-300" />
          </CardHeader>
          <CardContent className="member-card-content">
            <p className="text-xs text-slate-300">
              {dashboard.unreadNotifications} unread alert(s).
            </p>
            <Button variant="link" className="mt-2 px-0 text-cyan-300" asChild>
              <Link href="/member/notifications">
                View Notifications
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Member activity">
        <Card className="member-card">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">Upcoming Bookings</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content space-y-3">
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-slate-400">No upcoming bookings.</p>
            ) : (
              <ul className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between text-sm text-slate-200">
                    <div>
                      <p className="font-medium text-slate-100">{booking.schedule.gymClass.name}</p>
                      <p className="text-xs text-slate-400">
                        {formatDate(booking.date)} · {booking.schedule.trainer.firstName}{' '}
                        {booking.schedule.trainer.lastName}
                      </p>
                    </div>
                    <StatusBadge status={booking.status} />
                  </li>
                ))}
              </ul>
            )}
            <Button variant="link" className="px-0 text-cyan-300" asChild>
              <Link href="/member/bookings">
                Manage bookings
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="member-card">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">Recent Payments</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content space-y-3">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-slate-400">No recent payments.</p>
            ) : (
              <ul className="space-y-3">
                {recentPayments.map((payment) => (
                  <li key={payment.id} className="flex items-center justify-between text-sm text-slate-200">
                    <div>
                      <p className="font-medium text-slate-100">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <p className="text-xs text-slate-400">
                        {payment.planName ?? 'Membership'} · {formatDate(payment.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={payment.status} />
                  </li>
                ))}
              </ul>
            )}
            <Button variant="link" className="px-0 text-cyan-300" asChild>
              <Link href="/member/payments">
                View all payments
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
