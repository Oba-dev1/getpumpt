import { auth } from '@/lib/auth'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MemberActionForm } from '@/components/member/MemberActionForm'
import { MemberActionProvider } from '@/components/member/MemberActionContext'
import { MemberActionButton } from '@/components/member/MemberActionButton'
import { requestPTSession, getAvailablePTTrainers } from '@/lib/actions/pt-sessions'
import { formatCurrency } from '@/lib/utils'
import { ArrowLeft, Clock, Award } from 'lucide-react'

export const dynamic = 'force-dynamic'

function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export default async function BookPTPage({ params }: { params: Promise<{ trainerId: string }> }) {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const { trainerId } = await params
  const trainers = await getAvailablePTTrainers()
  const trainer = trainers.find((t) => t.id === trainerId)

  if (!trainer) {
    notFound()
  }

  return (
    <main className="member-stack" aria-labelledby="book-pt-title">
      <header>
        <Link
          href="/member/trainers"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to trainers
        </Link>
        <h1
          id="book-pt-title"
          className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Request PT Session
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Submit your preferred schedule — the gym will confirm your booking.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="member-card lg:col-span-1">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">Your Trainer</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content space-y-4">
            <div className="flex items-start gap-3">
              {trainer.imageUrl ? (
                <Image
                  src={trainer.imageUrl}
                  alt={`${trainer.firstName} ${trainer.lastName}`}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-white/10"
                />
              ) : (
                <div
                  className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-lg font-semibold text-indigo-300"
                  aria-hidden="true"
                >
                  {trainer.firstName[0]}{trainer.lastName[0]}
                </div>
              )}
              <div>
                <p className="font-semibold text-white">
                  {trainer.firstName} {trainer.lastName}
                </p>
                {trainer.yearsExperience && (
                  <p className="text-xs text-slate-400">
                    {trainer.yearsExperience} yr{trainer.yearsExperience !== 1 ? 's' : ''} experience
                  </p>
                )}
              </div>
            </div>

            {trainer.bio && (
              <p className="text-xs text-slate-400">{trainer.bio}</p>
            )}

            {trainer.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {trainer.specialties.map((specialty) => (
                  <Badge
                    key={specialty}
                    variant="secondary"
                    className="bg-indigo-500/10 text-indigo-300"
                  >
                    <Award className="mr-1 h-3 w-3" aria-hidden="true" />
                    {specialty}
                  </Badge>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="h-3.5 w-3.5" />
                  Availability
                </span>
                <span className="text-white">{trainer.ptDaysPerWeek} days/week</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Price per session</span>
                <span className="font-semibold text-white">
                  {trainer.ptPrice !== null ? formatCurrency(trainer.ptPrice) : 'On request'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="member-card lg:col-span-2">
          <CardHeader className="member-card-header">
            <CardTitle className="text-base text-white">Session Details</CardTitle>
          </CardHeader>
          <CardContent className="member-card-content">
            <MemberActionProvider>
              <MemberActionForm action={requestPTSession} className="space-y-4">
                <input type="hidden" name="trainerId" value={trainer.id} />

                <div className="space-y-2">
                  <Label htmlFor="date" className="text-slate-200">
                    Preferred start date
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    min={todayISO()}
                    className="border-white/10 bg-slate-900 text-slate-100"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionsPerWeek" className="text-slate-200">
                    Sessions per week
                  </Label>
                  <Select name="sessionsPerWeek" defaultValue="1">
                    <SelectTrigger
                      id="sessionsPerWeek"
                      className="border-white/10 bg-slate-900 text-slate-100"
                    >
                      <SelectValue placeholder="Select sessions per week" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} {n === 1 ? 'session' : 'sessions'} per week
                          {trainer.ptPrice !== null && ` — ${formatCurrency(trainer.ptPrice * n)}/week`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    The gym will confirm your preferred schedule after reviewing the request.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-slate-200">
                    Additional notes (optional)
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    placeholder="e.g. preferred times, fitness goals, any injuries or limitations..."
                    className="border-white/10 bg-slate-900 text-slate-100 placeholder:text-slate-600"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <MemberActionButton variant="gym" className="h-9 px-4 text-sm" pendingText="Sending request...">
                    Send request
                  </MemberActionButton>
                  <Link
                    href="/member/trainers"
                    className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </Link>
                </div>
              </MemberActionForm>
            </MemberActionProvider>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
