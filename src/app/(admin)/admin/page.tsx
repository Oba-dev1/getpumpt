import { auth } from '@/lib/auth'
import { getDashboardStats } from '@/lib/actions/dashboard'
import { StatsCard } from '@/components/admin/StatsCard'
import { StatusBadge } from '@/components/admin/StatusBadge'
import {
  Users,
  DollarSign,
  UserPlus,
  CalendarCheck,
  AlertCircle,
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

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const stats = await getDashboardStats(session.user.gymId)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold text-gray-800">Dashboard</h1>

      {stats.expiringMemberships > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">
            {stats.expiringMemberships} membership(s) expiring in the next 7
            days
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Members"
          value={stats.totalMembers}
          icon={<Users className="h-6 w-6" />}
          description="Active members"
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue.toLocaleString()}`}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentPayments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments yet</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
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
                          <span className="text-xs text-gray-500">
                            {payment.memberEmail}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.currency} {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
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
          <CardHeader>
            <CardTitle>Membership Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.membershipBreakdown.length === 0 ? (
              <p className="text-sm text-gray-500">No active memberships</p>
            ) : (
              <div className="space-y-4">
                {stats.membershipBreakdown.map((plan, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900">
                        {plan.planName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {plan.count} {plan.count === 1 ? 'member' : 'members'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold text-indigo-600">
                        {plan.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
