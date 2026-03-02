'use client'
export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { createMember } from '@/lib/actions/members'
import { getMembershipPlans } from '@/lib/actions/plans'
import { toast } from 'sonner'

const memberSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.preprocess((v) => (v === '' ? undefined : v), z.string().email('Invalid email address').optional()),
  phone: z.string().min(7, 'Phone number is required'),
  dateOfBirth: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  planId: z.string().optional(),
  startDate: z.string().optional(),
})

type MemberFormData = z.infer<typeof memberSchema>

export default function NewMemberPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [loading, setLoading] = useState(false)
  const [plans, setPlans] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema) as any,
  })

  const selectedPlanId = watch('planId')
  const startDateStr = watch('startDate')
  const selectedPlan = plans.find((p) => p.id === selectedPlanId)

  const calculatedEndDate = (() => {
    if (!selectedPlan || !startDateStr) return null
    const start = new Date(startDateStr)
    if (isNaN(start.getTime())) return null
    const end = new Date(start)
    if (selectedPlan.durationType === 'DAYS') end.setDate(end.getDate() + selectedPlan.durationValue)
    else if (selectedPlan.durationType === 'MONTHS') end.setMonth(end.getMonth() + selectedPlan.durationValue)
    else end.setFullYear(end.getFullYear() + selectedPlan.durationValue)
    return end
  })()

  useEffect(() => {
    async function fetchPlans() {
      if (!session?.user?.gymId) return

      try {
        const result = await getMembershipPlans(session.user.gymId, false)
        setPlans(result)
      } catch (error) {
        // Plans fetch failed silently
      }
    }

    fetchPlans()
  }, [session])

  const onSubmit = async (data: MemberFormData) => {
    if (!session?.user?.gymId) return

    setLoading(true)
    try {
      await createMember({
        ...data,
        gymId: session.user.gymId,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
      })

      toast.success('Member created successfully')
      router.push('/admin/members')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create member')
    } finally {
      setLoading(false)
    }
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/members')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-800">Add New Member</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    placeholder="John"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    placeholder="Doe"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  placeholder="+234 800 000 0000"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    style={{ colorScheme: 'light' }}
                    {...register('dateOfBirth')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue('gender', value as 'MALE' | 'FEMALE' | 'OTHER')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  {...register('address')}
                  placeholder="123 Main St, City, Country"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contact Name</Label>
                  <Input
                    id="emergencyContact"
                    {...register('emergencyContact')}
                    placeholder="Jane Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">Contact Phone</Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    {...register('emergencyPhone')}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account & Membership</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-red-500">*</span>
                  </Label>
                  <PasswordInput
                    id="password"
                    {...register('password')}
                    placeholder="Min. 8 characters"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planId">Membership Plan (Optional)</Label>
                  <Select
                    value={selectedPlanId ?? 'none'}
                    onValueChange={(value) => {
                      setValue('planId', value === 'none' ? undefined : value)
                      if (value === 'none') setValue('startDate', undefined)
                      else if (!startDateStr) setValue('startDate', new Date().toISOString().split('T')[0])
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No plan</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {plan.currency} {plan.price}/
                          {plan.billingCycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-gray-500">
                    You can assign a membership plan later if needed
                  </p>
                </div>

                {selectedPlanId && selectedPlanId !== 'none' && (
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Payment Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                    />
                    <p className="text-sm text-gray-500">
                      Date the member originally paid — used to calculate membership expiry
                    </p>
                    {calculatedEndDate && (
                      <p className="text-sm text-gray-600">
                        Expires: <span className="font-medium">{calculatedEndDate.toLocaleDateString()}</span>
                      </p>
                    )}
                    {calculatedEndDate && calculatedEndDate < new Date() && (
                      <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-700">
                          This membership will be saved as <strong>Expired</strong> because the end date is in the past.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/members')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Member'}
          </Button>
        </div>
      </form>
    </div>
  )
}
