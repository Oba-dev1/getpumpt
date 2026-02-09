import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { getMembershipPlans } from '@/lib/actions/member-subscriptions'
import { getMemberMembership } from '@/lib/actions/member-portal'
import { PlanCard } from '@/components/member/PlanCard'
import { AlertBanner } from '@/components/member/AlertBanner'
import { MemberActionProvider } from '@/components/member/MemberActionContext'

export const dynamic = 'force-dynamic'

export default async function MemberPlansPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const [plans, membership] = await Promise.all([
    getMembershipPlans(),
    getMemberMembership(),
  ])

  const hasActiveMembership = membership?.status === 'ACTIVE'

  return (
    <main className="member-stack" aria-labelledby="plans-title">
      <header>
        <h1
          id="plans-title"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          Membership Plans
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Choose the plan that fits your fitness journey.
        </p>
      </header>

      <MemberActionProvider>
        {hasActiveMembership && (
          <AlertBanner
            type="info"
            title="Active Membership"
            message="You already have an active membership. To subscribe to a different plan, please cancel your current membership first."
          />
        )}

        {plans.length === 0 ? (
          <Card className="member-card">
            <CardContent className="member-card-content">
              <p className="text-sm text-slate-300">
                No membership plans are currently available. Please check back later or contact the gym.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                disabled={hasActiveMembership}
              />
            ))}
          </div>
        )}
      </MemberActionProvider>
    </main>
  )
}
