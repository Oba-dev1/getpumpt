import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getAvailablePTTrainers } from '@/lib/actions/pt-sessions'
import { formatCurrency } from '@/lib/utils'
import { UserCheck, Clock, Award, ChevronRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MemberTrainersPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const trainers = await getAvailablePTTrainers()

  return (
    <main className="member-stack" aria-labelledby="pt-trainers-title">
      <header>
        <h1
          id="pt-trainers-title"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Personal Trainers
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Book one-on-one personal training sessions with our certified trainers.
        </p>
      </header>

      {trainers.length === 0 ? (
        <Card className="member-card">
          <CardContent className="member-card-content flex flex-col items-center justify-center gap-3 py-12 text-center">
            <UserCheck className="h-10 w-10 text-slate-600" aria-hidden="true" />
            <p className="text-sm text-slate-400">No personal trainers available right now.</p>
            <p className="text-xs text-slate-500">Check back soon — we&apos;re adding more.</p>
          </CardContent>
        </Card>
      ) : (
        <section aria-label="Available personal trainers">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
            {trainers.map((trainer) => (
              <li key={trainer.id}>
                <Card className="member-card h-full transition-colors hover:border-white/20">
                  <CardContent className="member-card-content flex h-full flex-col gap-4 p-4">
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
                      <div className="min-w-0">
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
                      <p className="line-clamp-3 text-xs text-slate-400">{trainer.bio}</p>
                    )}

                    {trainer.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5" aria-label="Specialties">
                        {trainer.specialties.slice(0, 3).map((specialty) => (
                          <Badge
                            key={specialty}
                            variant="secondary"
                            className="bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                          >
                            <Award className="mr-1 h-3 w-3" aria-hidden="true" />
                            {specialty}
                          </Badge>
                        ))}
                        {trainer.specialties.length > 3 && (
                          <Badge variant="secondary" className="bg-white/5 text-slate-400">
                            +{trainer.specialties.length - 3} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="mt-auto space-y-3 border-t border-white/[0.06] pt-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>{trainer.ptDaysPerWeek} days/week</span>
                        </div>
                        {trainer.ptPrice !== null ? (
                          <span className="font-semibold text-white">{formatCurrency(trainer.ptPrice)}</span>
                        ) : (
                          <span className="text-slate-400">Price on request</span>
                        )}
                      </div>
                      <Button
                        asChild
                        variant="gym"
                        className="w-full h-9 text-sm"
                      >
                        <Link href={`/member/trainers/${trainer.id}/book`}>
                          Request PT Session
                          <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
