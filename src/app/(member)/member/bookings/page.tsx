import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { cancelMemberBooking, getMemberBookings } from '@/lib/actions/member-portal'
import { cancelPTSession, getMemberPTSessions } from '@/lib/actions/pt-sessions'
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

  const [bookings, ptSessions] = await Promise.all([
    getMemberBookings(),
    getMemberPTSessions(),
  ])

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
            Track your class bookings and personal training sessions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="h-9 px-4 text-sm border-white/10 text-slate-200 hover:bg-white/5">
            <Link href="/member/trainers">Book PT</Link>
          </Button>
          <Button variant="gym" asChild className="h-9 px-4 text-sm">
            <Link href="/member/bookings/new">Book a class</Link>
          </Button>
        </div>
      </header>

      <MemberActionProvider>
        <Card className="member-card">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">Class Bookings</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content">
            {bookings.length === 0 ? (
              <p className="text-sm text-slate-400">No class bookings yet.</p>
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

      <section aria-labelledby="pt-sessions-title">
        <MemberActionProvider>
          <Card className="member-card">
            <CardHeader className="member-card-header flex-row items-center justify-between">
              <CardTitle id="pt-sessions-title" className="text-base text-white">Personal Training Sessions</CardTitle>
              <Button variant="outline" asChild className="h-8 px-3 text-xs border-white/10 text-slate-200 hover:bg-white/5">
                <Link href="/member/trainers">Request new</Link>
              </Button>
            </CardHeader>
            <CardContent className="member-card-content">
              {ptSessions.length === 0 ? (
                <div className="flex flex-col items-start gap-2">
                  <p className="text-sm text-slate-400">No personal training sessions yet.</p>
                  <Button variant="gym" asChild className="h-8 px-3 text-xs mt-1">
                    <Link href="/member/trainers">Browse trainers</Link>
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader className="bg-slate-950/60">
                    <TableRow>
                      <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Trainer
                      </TableHead>
                      <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Start Date
                      </TableHead>
                      <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Sessions/Week
                      </TableHead>
                      <TableHead scope="col" className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Amount
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
                    {ptSessions.map((session) => {
                      const canCancel =
                        session.status === 'SCHEDULED' &&
                        session.date >= startOfToday

                      return (
                        <TableRow key={session.id}>
                          <TableCell className="text-slate-200">
                            {session.trainer.firstName} {session.trainer.lastName}
                          </TableCell>
                          <TableCell className="text-slate-200">
                            {formatDate(session.date)}
                          </TableCell>
                          <TableCell className="text-slate-200">
                            {session.sessionsPerWeek}x / week
                          </TableCell>
                          <TableCell className="text-slate-200">
                            {session.amount !== null ? formatCurrency(session.amount) : '—'}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={session.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {canCancel ? (
                              <MemberActionForm action={cancelPTSession}>
                                <input type="hidden" name="sessionId" value={session.id} />
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
      </section>
    </main>
  )
}
