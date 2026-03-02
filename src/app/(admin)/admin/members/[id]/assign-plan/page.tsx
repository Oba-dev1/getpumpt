'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, CreditCard, AlertTriangle } from 'lucide-react'
import { assignMembershipSchema, type AssignMembershipInput } from '@/lib/validations'
import { assignMembershipToPlan } from '@/lib/actions/memberships'
import { getMembershipPlans } from '@/lib/actions/plans'
import { getMemberById } from '@/lib/actions/members'
import { toast } from 'sonner'

export default function AssignPlanPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const [member, setMember] = useState<any>(null)
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [calculatedEndDate, setCalculatedEndDate] = useState<Date | null>(null)

  const memberId = params.id as string

  const form = useForm<AssignMembershipInput>({
    resolver: zodResolver(assignMembershipSchema),
    defaultValues: {
      planId: '',
      startDate: new Date().toISOString().split('T')[0],
      autoRenew: false,
    },
  })

  useEffect(() => {
    async function fetchData() {
      if (!session?.user?.gymId || !memberId) return

      setLoading(true)
      try {
        const [memberData, plansData] = await Promise.all([
          getMemberById(session.user.gymId, memberId),
          getMembershipPlans(session.user.gymId, false),
        ])

        setMember(memberData)
        setPlans(plansData)
      } catch (error) {
        toast.error('Failed to load data')
        router.push(`/admin/members/${memberId}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session, memberId, router])

  const onSubmit = async (data: AssignMembershipInput) => {
    if (!session?.user?.gymId) return

    setSubmitting(true)
    try {
      const result = await assignMembershipToPlan(
        session.user.gymId,
        memberId,
        data
      )

      toast.success('Membership assigned successfully')
      router.push(`/admin/members/${memberId}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to assign membership')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    const planId = form.watch('planId')
    const startDateStr = form.watch('startDate')
    const plan = plans.find((p) => p.id === planId)
    setSelectedPlan(plan ?? null)

    if (plan && startDateStr) {
      const start = new Date(startDateStr)
      if (!isNaN(start.getTime())) {
        const end = new Date(start)
        if (plan.durationType === 'DAYS') end.setDate(end.getDate() + plan.durationValue)
        else if (plan.durationType === 'MONTHS') end.setMonth(end.getMonth() + plan.durationValue)
        else end.setFullYear(end.getFullYear() + plan.durationValue)
        setCalculatedEndDate(end)
      } else {
        setCalculatedEndDate(null)
      }
    } else {
      setCalculatedEndDate(null)
    }
  }, [form.watch('planId'), form.watch('startDate'), plans])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!member) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/members/${memberId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-800">
            Assign Membership Plan
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Assign a plan to {member.firstName} {member.lastName}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Plan Details</CardTitle>
            <CardDescription>
              Select a plan and configure the membership settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="planId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Membership Plan</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a plan" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {plans.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500">
                              No active plans available
                            </div>
                          ) : (
                            plans.map((plan) => (
                              <SelectItem key={plan.id} value={plan.id}>
                                <div className="flex items-center justify-between">
                                  <span>{plan.name}</span>
                                  <span className="ml-4 text-sm text-gray-500">
                                    {plan.currency} {plan.price.toLocaleString()}
                                  </span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>
                        When should this membership start?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="autoRenew"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Enable auto-renewal
                        </FormLabel>
                        <FormDescription>
                          Automatically renew this membership when it expires
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    variant="gym"
                    disabled={submitting || plans.length === 0}
                  >
                    <CreditCard className="mr-2 h-4 w-4" />
                    {submitting ? 'Assigning...' : 'Assign Plan'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/admin/members/${memberId}`)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Member Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-sm text-gray-900">
                  {member.firstName} {member.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{member.email}</p>
              </div>
              {member.phone && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm text-gray-900">{member.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedPlan && (
            <Card>
              <CardHeader>
                <CardTitle>Plan Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Plan Name</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedPlan.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price</p>
                  <p className="text-sm text-gray-900">
                    {selectedPlan.currency} {selectedPlan.price.toLocaleString()} /{' '}
                    {selectedPlan.billingCycle.toLowerCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Duration</p>
                  <p className="text-sm text-gray-900">
                    {selectedPlan.durationValue}{' '}
                    {selectedPlan.durationType.toLowerCase()}
                  </p>
                </div>
                {selectedPlan.classCredits && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Class Credits
                    </p>
                    <p className="text-sm text-gray-900">
                      {selectedPlan.classCredits} classes
                    </p>
                  </div>
                )}
                {calculatedEndDate && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Calculated End Date</p>
                    <p className="text-sm text-gray-900">
                      {calculatedEndDate.toLocaleDateString()}
                    </p>
                  </div>
                )}

                {calculatedEndDate && calculatedEndDate < new Date() && (
                  <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">
                      This membership will be saved as <strong>Expired</strong> because the end date is in the past.
                    </p>
                  </div>
                )}

                {selectedPlan.features && selectedPlan.features.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Features</p>
                    <ul className="mt-2 space-y-1">
                      {selectedPlan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-900">
                          • {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
