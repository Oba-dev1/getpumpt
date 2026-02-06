import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { getMemberClasses, createMemberBooking } from '@/lib/actions/member-portal'
import { MemberActionProvider } from '@/components/member/MemberActionContext'
import { MemberBookingForm } from '@/components/member/MemberBookingForm'

export const dynamic = 'force-dynamic'

export default async function NewBookingPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const schedules = await getMemberClasses()

  return (
    <main className="member-stack" aria-labelledby="member-booking-new-title">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            id="member-booking-new-title"
            className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
          >
            Book a Class
          </h1>
          <p className="mt-1 text-sm text-slate-300">
            Select a class schedule and a date that matches the class day.
          </p>
        </div>
        <Button variant="outline" asChild className="h-9 px-4 text-sm">
          <Link href="/member/bookings">Back to bookings</Link>
        </Button>
      </header>

      <MemberActionProvider>
        <Card className="member-card">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">New Booking</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content space-y-4">
            {schedules.length === 0 ? (
              <p className="text-sm text-slate-400">
                No active class schedules available right now.
              </p>
            ) : (
              <MemberBookingForm schedules={schedules} action={createMemberBooking} />
            )}
          </CardContent>
        </Card>
      </MemberActionProvider>
    </main>
  )
}
