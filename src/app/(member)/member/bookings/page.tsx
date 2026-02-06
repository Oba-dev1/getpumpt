import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatDate } from '@/lib/utils'
import { cancelMemberBooking, getMemberBookings } from '@/lib/actions/member-portal'
import { MemberActionForm } from '@/components/member/MemberActionForm'
import Link from 'next/link'
import { MemberActionProvider } from '@/components/member/MemberActionContext'
import { MemberActionButton } from '@/components/member/MemberActionButton'

export const dynamic = 'force-dynamic'

export default async function BookingsPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const bookings = await getMemberBookings()
  const today = new Date()
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  return (
    <main className="member-stack" aria-labelledby="member-bookings-title">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            id="member-bookings-title"
            className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            My Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Track your class bookings and upcoming sessions.
          </p>
        </div>
        <Button variant="gym" asChild className="h-9 px-4 text-sm">
          <Link href="/member/bookings/new">Book a class</Link>
        </Button>
      </header>

      <MemberActionProvider>
        <Card className="member-card">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">Booking History</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content">
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-400">No bookings yet.</p>
            ) : (
              <Table>
                <TableHeader className="bg-slate-950/60">
                  <TableRow>
                    <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Date
                    </TableHead>
                    <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Class
                    </TableHead>
                    <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Trainer
                    </TableHead>
                    <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Status
                    </TableHead>
                    <TableHead scope="col" className="text-right text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => {
                    const canCancel =
                      booking.status === 'CONFIRMED' &&
                      booking.date >= startOfToday

                    return (
                      <TableRow key={booking.id}>
                        <TableCell className="text-slate-200">
                          {formatDate(booking.date)}
                        </TableCell>
                        <TableCell className="text-slate-200">
                          {booking.schedule.gymClass.name}
                        </TableCell>
                        <TableCell className="text-slate-200">
                          {booking.schedule.trainer.firstName} {booking.schedule.trainer.lastName}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={booking.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {canCancel ? (
                            <MemberActionForm action={cancelMemberBooking}>
                              <input type="hidden" name="bookingId" value={booking.id} />
                              <MemberActionButton variant="outline" size="sm" pendingText="Cancelling...">
                                Cancel
                              </MemberActionButton>
                            </MemberActionForm>
                          ) : (
                            <span className="text-xs text-slate-500">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </MemberActionProvider>
    </main>
  )
}
