'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'
import { MemberActionForm } from '@/components/member/MemberActionForm'
import { MemberActionButton } from '@/components/member/MemberActionButton'
import { subscribeToPlan } from '@/lib/actions/member-subscriptions'
import { formatCurrency } from '@/lib/utils'

interface PlanCardPlan {
  id: string
  name: string
  description: string | null
  price: number
  currency: string
  billingCycle: string
  durationValue: number
  durationType: string
  classCredits: number | null
  features: string[]
  isFeatured: boolean
}

interface PlanCardProps {
  plan: PlanCardPlan
  disabled?: boolean
}

export function PlanCard({ plan, disabled = false }: PlanCardProps) {
  const formatDuration = (value: number, type: string) => {
    const unit = type.toLowerCase()
    return `${value} ${value === 1 ? unit.slice(0, -1) : unit}`
  }

  return (
    <Card
      className={`member-card relative flex flex-col ${
        plan.isFeatured
          ? 'border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20'
          : 'border-white/10'
      }`}
    >
      {plan.isFeatured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-cyan-500 text-white">Most Popular</Badge>
        </div>
      )}

      <CardHeader className="member-card-header">
        <CardTitle className="text-xl text-white">{plan.name}</CardTitle>
        {plan.description && (
          <p className="mt-2 text-sm text-slate-400">{plan.description}</p>
        )}
      </CardHeader>

      <CardContent className="member-card-content flex flex-1 flex-col space-y-4">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-white">
            {formatCurrency(Number(plan.price), plan.currency)}
          </span>
          <span className="text-sm text-slate-400">
            / {plan.billingCycle.toLowerCase()}
          </span>
        </div>

        <div className="text-sm text-slate-300">
          <span className="font-medium">Duration:</span>{' '}
          {formatDuration(plan.durationValue, plan.durationType)}
        </div>

        <ul className="flex-1 space-y-2">
          {plan.features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
              <span>{feature}</span>
            </li>
          ))}
          {plan.classCredits && (
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-400" />
              <span>{plan.classCredits} class credits per month</span>
            </li>
          )}
        </ul>

        <MemberActionForm action={subscribeToPlan}>
          <input type="hidden" name="planId" value={plan.id} />
          <MemberActionButton
            variant={plan.isFeatured ? 'gym' : 'outline'}
            className="w-full"
            disabled={disabled}
            pendingText="Processing..."
          >
            {disabled ? 'Already Subscribed' : 'Subscribe Now'}
          </MemberActionButton>
        </MemberActionForm>
      </CardContent>
    </Card>
  )
}
