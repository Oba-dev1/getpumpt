'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import { createGymClass } from '@/lib/actions/classes'
import { toast } from 'sonner'

const classSchema = z.object({
  name: z.string().min(2, 'Class name must be at least 2 characters'),
  description: z.string().optional(),
  category: z.enum([
    'HIIT',
    'YOGA',
    'STRENGTH',
    'CARDIO',
    'SPIN',
    'CROSSFIT',
    'PILATES',
    'BOXING',
    'DANCE',
    'OTHER',
  ]),
  duration: z.string().min(1, 'Duration is required'),
  capacity: z.string().min(1, 'Capacity is required'),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
})

type ClassFormData = z.infer<typeof classSchema>

const categories = [
  'HIIT',
  'YOGA',
  'STRENGTH',
  'CARDIO',
  'SPIN',
  'CROSSFIT',
  'PILATES',
  'BOXING',
  'DANCE',
  'OTHER',
]

export default function NewClassPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
    defaultValues: {
      category: 'HIIT',
      isActive: true,
    },
  })

  const isActive = watch('isActive')

  const onSubmit = async (data: ClassFormData) => {
    if (!session?.user?.gymId) return

    setSaving(true)
    try {
      await createGymClass({
        gymId: session.user.gymId,
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        category: data.category,
        duration: Number(data.duration),
        capacity: Number(data.capacity),
        imageUrl: data.imageUrl?.trim() || undefined,
        isActive: data.isActive,
      })
      toast.success('Class created successfully')
      router.push('/admin/classes')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create class')
    } finally {
      setSaving(false)
    }
  }

  if (sessionStatus === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!session?.user?.gymId) {
    return null
  }

  return (
    <main className="space-y-6" aria-labelledby="new-class-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/classes')}>
            <ArrowLeft className="h-4 w-4" />
            Back to classes
          </Button>
          <h1 id="new-class-title" className="mt-4 text-3xl font-semibold text-gray-900">
            Create Class
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Define a class type and set its default capacity and duration.
          </p>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Class details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Class name</Label>
                <Input id="name" placeholder="e.g. Power HIIT" {...register('name')} />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(value) => setValue('category', value as ClassFormData['category'])}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0) + cat.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input id="duration" type="number" min="10" {...register('duration')} />
                {errors.duration && (
                  <p className="text-sm text-red-600">{errors.duration.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" type="number" min="1" {...register('capacity')} />
                {errors.capacity && (
                  <p className="text-sm text-red-600">{errors.capacity.message}</p>
                )}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="imageUrl">Image URL (optional)</Label>
                <Input id="imageUrl" placeholder="https://..." {...register('imageUrl')} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 md:col-span-2">
                <div>
                  <Label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                    Active status
                  </Label>
                  <p className="text-xs text-gray-500">Inactive classes are hidden from schedules.</p>
                </div>
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={(value) => setValue('isActive', value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Short summary of the class."
                  rows={4}
                  {...register('description')}
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/admin/classes')}>
                Cancel
              </Button>
              <Button type="submit" loading={saving}>
                Create class
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  )
}
