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
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import { getTrainerById, updateTrainer } from '@/lib/actions/trainers'
import { toast } from 'sonner'

const trainerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  bio: z.string().optional(),
  specialties: z.string().optional(),
  certifications: z.string().optional(),
  yearsExperience: z.string().optional(),
  imageUrl: z.string().optional(),
  isActive: z.boolean(),
})

type TrainerFormData = z.infer<typeof trainerSchema>

const parseList = (value?: string) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : []

export default function EditTrainerPage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const trainerId = params.id as string

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TrainerFormData>({
    resolver: zodResolver(trainerSchema),
  })

  const isActive = watch('isActive')

  useEffect(() => {
    async function fetchTrainer() {
      if (!session?.user?.gymId || !trainerId) return

      setLoading(true)
      try {
        const trainer = await getTrainerById(session.user.gymId, trainerId)
        reset({
          firstName: trainer.firstName,
          lastName: trainer.lastName,
          email: trainer.email,
          phone: trainer.phone || '',
          bio: trainer.bio || '',
          specialties: trainer.specialties.join(', '),
          certifications: trainer.certifications.join(', '),
          yearsExperience: trainer.yearsExperience ? String(trainer.yearsExperience) : '',
          imageUrl: trainer.imageUrl || '',
          isActive: trainer.isActive,
        })
      } catch (error: any) {
        toast.error(error.message || 'Failed to load trainer')
        router.push('/admin/trainers')
      } finally {
        setLoading(false)
      }
    }

    fetchTrainer()
  }, [session, trainerId, reset, router])

  const onSubmit = async (data: TrainerFormData) => {
    if (!session?.user?.gymId || !trainerId) return

    setSaving(true)
    try {
      await updateTrainer(session.user.gymId, trainerId, {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone?.trim() || undefined,
        bio: data.bio?.trim() || undefined,
        specialties: parseList(data.specialties),
        certifications: parseList(data.certifications),
        yearsExperience: data.yearsExperience ? Number(data.yearsExperience) : undefined,
        imageUrl: data.imageUrl?.trim() || undefined,
        isActive: data.isActive,
      })
      toast.success('Trainer updated successfully')
      router.push('/admin/trainers')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update trainer')
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
    <main className="space-y-6" aria-labelledby="edit-trainer-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/trainers')}>
            <ArrowLeft className="h-4 w-4" />
            Back to trainers
          </Button>
          <h1 id="edit-trainer-title" className="mt-4 text-3xl font-semibold text-gray-900">
            Edit Trainer
          </h1>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Trainer details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input id="firstName" {...register('firstName')} />
                  {errors.firstName && (
                    <p className="text-sm text-red-600">{errors.firstName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input id="lastName" {...register('lastName')} />
                  {errors.lastName && (
                    <p className="text-sm text-red-600">{errors.lastName.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" {...register('phone')} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="bio">Bio (optional)</Label>
                  <Textarea id="bio" rows={4} {...register('bio')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties (comma-separated)</Label>
                  <Input id="specialties" {...register('specialties')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certifications (comma-separated)</Label>
                  <Input id="certifications" {...register('certifications')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of experience</Label>
                  <Input id="yearsExperience" type="number" min="0" {...register('yearsExperience')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Photo URL (optional)</Label>
                  <Input id="imageUrl" {...register('imageUrl')} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 md:col-span-2">
                  <div>
                    <Label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                      Active status
                    </Label>
                    <p className="text-xs text-gray-500">
                      Inactive trainers won’t appear in scheduling.
                    </p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={(value) => setValue('isActive', value)}
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/trainers')}>
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
