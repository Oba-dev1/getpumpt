'use client'
export const dynamic = 'force-dynamic'


import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { getPlanById, updateMembershipPlan } from '@/lib/actions/plans'
import { toast } from 'sonner'

const planSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  price: z.string().min(1, 'Price is required'),
  currency: z.string().min(1, 'Currency is required'),
  billingCycle: z.enum(['MONTHLY', 'QUARTERLY', 'YEARLY']),
  durationValue: z.string().min(1, 'Duration is required'),
  durationType: z.enum(['DAYS', 'MONTHS', 'YEARS']),
  classCredits: z.string().optional(),
  isFeatured: z.boolean(),
  isActive: z.boolean(),
})

type PlanFormData = z.infer<typeof planSchema>

export default function EditPlanPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [features, setFeatures] = useState<string[]>([])
  const [currentFeature, setCurrentFeature] = useState('')

  const planId = params.id as string

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
  })

  const isFeatured = watch('isFeatured')
  const isActive = watch('isActive')

  useEffect(() => {
    async function fetchPlan() {
      if (!session?.user?.gymId || !planId) return

      setLoading(true)
      try {
        const plan = await getPlanById(session.user.gymId, planId)

        reset({
          name: plan.name,
          description: plan.description || '',
          price: plan.price.toString(),
          currency: plan.currency,
          billingCycle: plan.billingCycle,
          durationValue: plan.durationValue.toString(),
          durationType: plan.durationType,
          classCredits: plan.classCredits?.toString() || '',
          isFeatured: plan.isFeatured,
          isActive: plan.isActive,
        })

        if (plan.features) {
          setFeatures(plan.features)
        }
      } catch (error) {
        console.error('Failed to fetch plan:', error)
        toast.error('Failed to load plan')
        router.push('/admin/plans')
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [session, planId, router, reset])

  const addFeature = () => {
    if (currentFeature.trim()) {
      setFeatures([...features, currentFeature.trim()])
      setCurrentFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: PlanFormData) => {
    if (!session?.user?.gymId) return

    setSaving(true)
    try {
      await updateMembershipPlan(session.user.gymId, planId, {
        ...data,
        price: parseFloat(data.price),
        durationValue: parseInt(data.durationValue),
        classCredits: data.classCredits ? parseInt(data.classCredits) : undefined,
        features: features.length > 0 ? features : undefined,
      })

      toast.success('Plan updated successfully')
      router.push('/admin/plans')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update plan')
    } finally {
      setSaving(false)
    }
  }

  if (!session?.user?.gymId) {
    return null
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/admin/plans')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-semibold text-gray-800">Edit Plan</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update membership plan details
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Plan Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="e.g., Premium Membership"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Brief description of what this plan includes"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">
                    Currency <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch('currency')}
                    onValueChange={(value) => setValue('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NGN">NGN (₦)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register('price')}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingCycle">
                  Billing Cycle <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={watch('billingCycle')}
                  onValueChange={(value) =>
                    setValue('billingCycle', value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="durationValue">
                    Duration <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="durationValue"
                    type="number"
                    {...register('durationValue')}
                    placeholder="1"
                  />
                  {errors.durationValue && (
                    <p className="text-sm text-red-600">
                      {errors.durationValue.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="durationType">
                    Duration Type <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={watch('durationType')}
                    onValueChange={(value) =>
                      setValue('durationType', value as any)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DAYS">Days</SelectItem>
                      <SelectItem value="MONTHS">Months</SelectItem>
                      <SelectItem value="YEARS">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classCredits">Class Credits (Optional)</Label>
                <Input
                  id="classCredits"
                  type="number"
                  {...register('classCredits')}
                  placeholder="Unlimited or leave empty"
                />
                <p className="text-sm text-gray-500">
                  Number of classes members can book per billing cycle
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="feature">Add Feature</Label>
                  <div className="flex gap-2">
                    <Input
                      id="feature"
                      value={currentFeature}
                      onChange={(e) => setCurrentFeature(e.target.value)}
                      placeholder="e.g., Access to all equipment"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addFeature()
                        }
                      }}
                    />
                    <Button type="button" onClick={addFeature}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {features.length > 0 && (
                  <div className="space-y-2">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                      >
                        <span className="text-sm text-gray-700">{feature}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFeature(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="isFeatured">Featured Plan</Label>
                    <p className="text-sm text-gray-500">
                      Highlight this plan as recommended
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={isFeatured ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValue('isFeatured', !isFeatured)}
                  >
                    {isFeatured ? 'Featured' : 'Not Featured'}
                  </Button>
                </div>

                <div className="flex items-center justify-between border-t pt-4">
                  <div>
                    <Label htmlFor="isActive">Active Status</Label>
                    <p className="text-sm text-gray-500">
                      Make this plan available for purchase
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setValue('isActive', !isActive)}
                  >
                    {isActive ? 'Active' : 'Inactive'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/plans')}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  )
}
