'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createOnboardingPlan } from '@/lib/actions/onboarding'
import { onboardingPlanSchema, type OnboardingPlanInput } from '@/lib/validations/onboarding'

interface Step1AddPlanProps {
  onComplete: () => void
}

export function Step1AddPlan({ onComplete }: Step1AddPlanProps) {
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<OnboardingPlanInput>({
    resolver: zodResolver(onboardingPlanSchema),
    defaultValues: {
      name: '',
      price: 0,
      durationValue: 1,
      durationType: 'MONTHS',
    },
  })

  const durationType = watch('durationType')

  const onSubmit = async (data: OnboardingPlanInput) => {
    setLoading(true)
    try {
      const result = await createOnboardingPlan(data)
      if (result.success) {
        toast.success('Membership plan created successfully!')
        onComplete()
      } else {
        toast.error(result.error || 'Failed to create plan')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card className="border-border/70 shadow-none">
        <CardHeader className="space-y-2">
          <CardTitle>Create your first membership plan</CardTitle>
          <CardDescription>
            Set the plan details members will see when they sign up.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Plan Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Monthly Membership"
              aria-describedby="plan-name-help"
              {...register('name')}
              disabled={loading}
            />
            {errors.name && (
              <p className="text-sm text-destructive" role="alert">
                {errors.name.message}
              </p>
            )}
            <p id="plan-name-help" className="text-sm text-muted-foreground">
              Keep it clear so members know what they&apos;re buying.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              type="number"
              placeholder="0"
              step="0.01"
              aria-describedby="plan-price-help"
              {...register('price', { valueAsNumber: true })}
              disabled={loading}
            />
            {errors.price && (
              <p className="text-sm text-destructive" role="alert">
                {errors.price.message}
              </p>
            )}
            <p id="plan-price-help" className="text-sm text-muted-foreground">
              Enter the price in your local currency.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="durationValue">Duration *</Label>
              <Input
                id="durationValue"
                type="number"
                placeholder="1"
                min="1"
                aria-describedby="plan-duration-help"
                {...register('durationValue', { valueAsNumber: true })}
                disabled={loading}
              />
              {errors.durationValue && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.durationValue.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationType">Duration Type *</Label>
              <Select
                value={durationType}
                onValueChange={(value: 'DAYS' | 'MONTHS' | 'YEARS') =>
                  setValue('durationType', value)
                }
                disabled={loading}
              >
                <SelectTrigger
                  id="durationType"
                  aria-describedby="plan-duration-help"
                  className="bg-background text-foreground border-border"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background text-foreground">
                  <SelectItem value="DAYS">Days</SelectItem>
                  <SelectItem value="MONTHS">Months</SelectItem>
                  <SelectItem value="YEARS">Years</SelectItem>
                </SelectContent>
              </Select>
              {errors.durationType && (
                <p className="text-sm text-destructive" role="alert">
                  {errors.durationType.message}
                </p>
              )}
            </div>
          </div>
          <p id="plan-duration-help" className="text-sm text-muted-foreground">
            Most gyms start with a monthly plan and expand later.
          </p>

          <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-sm font-semibold text-foreground">Quick tips</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Keep the name simple and descriptive.</li>
              <li>Start with one plan and add more after launch.</li>
              <li>You can edit pricing anytime in the admin panel.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
