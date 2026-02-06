'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
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
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import { getGymClassById, updateGymClass } from '@/lib/actions/classes'
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

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const classId = params.id as string

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ClassFormData>({
    resolver: zodResolver(classSchema),
  })

  const isActive = watch('isActive')

  useEffect(() => {
    async function fetchClass() {
      if (!session?.user?.gymId || !classId) return

      setLoading(true)
      try {
        const gymClass = await getGymClassById(session.user.gymId, classId)
        reset({
          name: gymClass.name,
          description: gymClass.description || '',
          category: gymClass.category,
          duration: String(gymClass.duration),
          capacity: String(gymClass.capacity),
          imageUrl: gymClass.imageUrl || '',
          isActive: gymClass.isActive,
        })
      } catch (error: any) {
        toast.error(error.message || 'Failed to load class')
        router.push('/admin/classes')
      } finally {
        setLoading(false)
      }
    }

    fetchClass()
  }, [session, classId, reset, router])

  const onSubmit = async (data: ClassFormData) => {
    if (!session?.user?.gymId || !classId) return

    setSaving(true)
    try {
      await updateGymClass(session.user.gymId, classId, {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        category: data.category,
        duration: Number(data.duration),
        capacity: Number(data.capacity),
        imageUrl: data.imageUrl?.trim() || undefined,
        isActive: data.isActive,
      })
      toast.success('Class updated successfully')
      router.push('/admin/classes')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update class')
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
    <main className="space-y-4" aria-labelledby="edit-class-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/classes')}>
            <ArrowLeft className="h-4 w-4" />
            Back to classes
          </Button>
          <h1 id="edit-class-title" className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            Edit Class
          </h1>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Class details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
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
                  Save changes
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
