import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/admin/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getMemberMembership, startMembershipPayment } from '@/lib/actions/member-portal'
import { MemberActionForm } from '@/components/member/MemberActionForm'
import { MemberActionProvider } from '@/components/member/MemberActionContext'
import { MemberActionButton } from '@/components/member/MemberActionButton'

export const dynamic = 'force-dynamic'

export default async function MembershipPage() {
  const session = await auth()

  if (!session?.user?.gymId) {
    redirect('/login')
  }

  const membership = await getMemberMembership()

  return (
    <main className="member-stack" aria-labelledby="member-membership-title">
      <header>
        <h1
          id="member-membership-title"
          className="text-2xl font-semibold tracking-tight text-white sm:text-3xl"
        >
          My Membership
        </h1>
        <p className="mt-1 text-sm text-slate-300">
          Review your plan, renewal dates, and payment activity.
        </p>
      </header>

      <MemberActionProvider>
        {!membership ? (
          <Card className="member-card">
            <CardHeader className="member-card-header">
              <CardTitle className="text-base text-white">No Active Membership</CardTitle>
            </CardHeader>
            <CardContent className="member-card-content">
              <p className="text-sm text-slate-300">
                You do not have an active membership plan yet. Contact the front desk to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <Card className="member-card lg:col-span-2">
                <CardHeader className="member-card-header">
                  <CardTitle className="text-base text-white">Plan Overview</CardTitle>
                </CardHeader>
                <CardContent className="member-card-content space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-400">Plan</p>
                      <p className="text-lg font-semibold text-slate-100">{membership.plan.name}</p>
                    </div>
                    <StatusBadge status={membership.status} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                      <p className="text-xs text-slate-400">Start date</p>
                      <p className="text-sm text-slate-100">{formatDate(membership.startDate)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                      <p className="text-xs text-slate-400">Renewal date</p>
                      <p className="text-sm text-slate-100">{formatDate(membership.endDate)}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-slate-950/60 p-3">
                      <p className="text-xs text-slate-400">Auto-renew</p>
                      <p className="text-sm text-slate-100">
                        {membership.autoRenew ? 'Enabled' : 'Manual'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-sm text-slate-400">
                      Billing cycle: {membership.plan.billingCycle.toLowerCase()}
                    </div>
                    <div className="text-sm text-slate-100">
                      {formatCurrency(Number(membership.plan.price), membership.plan.currency)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="member-card">
                <CardHeader className="member-card-header">
                  <CardTitle className="text-base text-white">Payment Actions</CardTitle>
                </CardHeader>
                <CardContent className="member-card-content space-y-3">
                  <p className="text-sm text-slate-300">
                    Need to settle a membership payment? You can pay online here.
                  </p>
                  {membership.status !== 'ACTIVE' ? (
                    <MemberActionForm action={startMembershipPayment}>
                      <input type="hidden" name="membershipId" value={membership.id} />
                      <MemberActionButton variant="gym" className="h-9 px-4 text-sm" pendingText="Starting...">
                        Make Payment
                      </MemberActionButton>
                    </MemberActionForm>
                  ) : (
                    <Button variant="outline" disabled className="h-9 px-4 text-sm">
                      Membership Active
                    </Button>
                  )}
                </CardContent>
              </Card>
            </section>

            <Card className="member-card">
              <CardHeader className="member-card-header">
                <CardTitle className="text-base text-white">Recent Payments</CardTitle>
              </CardHeader>
              <CardContent className="member-card-content space-y-3">
                {membership.payments.length === 0 ? (
                  <p className="text-sm text-slate-400">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-3">
                    {membership.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-slate-950/60 p-3"
                      >
                        <div>
                          <p className="text-sm text-slate-100">
                            {formatCurrency(Number(payment.amount), payment.currency)}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(payment.createdAt)}</p>
                        </div>
                        <StatusBadge status={payment.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </MemberActionProvider>
    </main>
  )
}
