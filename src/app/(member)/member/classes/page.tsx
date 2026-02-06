import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatTime } from '@/lib/utils'
import { getMemberClasses } from '@/lib/actions/member-portal'

export const dynamic = 'force-dynamic'

export default async function ClassesPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const schedules = await getMemberClasses()
  const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']
  const grouped = schedules.reduce<Record<string, typeof schedules>>((acc, schedule) => {
    acc[schedule.dayOfWeek] = acc[schedule.dayOfWeek] || []
    acc[schedule.dayOfWeek].push(schedule)
    return acc
  }, {})

  return (
    <main className="member-stack" aria-labelledby="member-classes-title">
      <header>
        <h1
          id="member-classes-title"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Browse Classes
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          View the weekly class schedule and plan your workouts.
        </p>
      </header>

      {schedules.length === 0 ? (
        <Card className="member-card">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">No Classes Available</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content">
            <p className="text-sm text-slate-400">
              There are no active class schedules right now. Check back soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {dayOrder
            .filter((day) => grouped[day])
            .map((day) => (
              <Card key={day} className="member-card">
                <CardHeader className="member-card-header">
                  <CardTitle className="text-base text-white">
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </CardTitle>
                </CardHeader>
                <CardContent className="member-card-content space-y-3">
                  {grouped[day].map((schedule) => (
                    <div
                      key={schedule.id}
                      className="rounded-lg border border-white/10 bg-slate-950/60 p-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-slate-100">
                            {schedule.gymClass.name}
                          </p>
                      <p className="text-xs text-slate-400">
                        {schedule.gymClass.category} - {schedule.gymClass.duration} min - Capacity {schedule.maxCapacity}
                      </p>
                      <p className="mt-1 text-xs text-emerald-300">
                        Remaining {schedule.remainingSpots} / {schedule.maxCapacity}
                        {schedule.nextDate ? ` (next: ${formatDate(schedule.nextDate)})` : ''}
                      </p>
                        </div>
                        <p className="text-xs text-slate-300">
                          {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                        </p>
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        Trainer: {schedule.trainer.firstName} {schedule.trainer.lastName}
                      </p>
                      {schedule.location ? (
                        <p className="text-xs text-slate-500">Location: {schedule.location}</p>
                      ) : null}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
        </section>
      )}
    </main>
  )
}
