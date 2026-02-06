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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft } from 'lucide-react'
import {
  getGymScheduleById,
  getScheduleFormOptions,
  updateGymSchedule,
} from '@/lib/actions/schedules'
import { toast } from 'sonner'

const scheduleSchema = z.object({
  classId: z.string().min(1, 'Class is required'),
  trainerId: z.string().min(1, 'Trainer is required'),
  dayOfWeek: z.enum([
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ]),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  maxCapacity: z.string().min(1, 'Capacity is required'),
  location: z.string().optional(),
  isActive: z.boolean(),
})

type ScheduleFormData = z.infer<typeof scheduleSchema>

const days = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
]

export default function EditSchedulePage() {
  const router = useRouter()
  const params = useParams()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [options, setOptions] = useState<{ classes: any[]; trainers: any[] }>({
    classes: [],
    trainers: [],
  })

  const scheduleId = params.id as string

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
  })

  const isActive = watch('isActive')

  useEffect(() => {
    async function fetchSchedule() {
      if (!session?.user?.gymId || !scheduleId) return

      setLoading(true)
      try {
        const [schedule, formOptions] = await Promise.all([
          getGymScheduleById(session.user.gymId, scheduleId),
          getScheduleFormOptions(session.user.gymId),
        ])
        setOptions(formOptions)
        reset({
          classId: schedule.classId,
          trainerId: schedule.trainerId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          maxCapacity: String(schedule.maxCapacity),
          location: schedule.location || '',
          isActive: schedule.isActive,
        })
      } catch (error: any) {
        toast.error(error.message || 'Failed to load schedule')
        router.push('/admin/schedules')
      } finally {
        setLoading(false)
      }
    }

    fetchSchedule()
  }, [session, scheduleId, reset, router])

  const onSubmit = async (data: ScheduleFormData) => {
    if (!session?.user?.gymId || !scheduleId) return

    setSaving(true)
    try {
      await updateGymSchedule(session.user.gymId, scheduleId, {
        classId: data.classId,
        trainerId: data.trainerId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        maxCapacity: Number(data.maxCapacity),
        location: data.location?.trim() || undefined,
        isActive: data.isActive,
      })
      toast.success('Schedule updated successfully')
      router.push('/admin/schedules')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update schedule')
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
    <main className="space-y-4" aria-labelledby="edit-schedule-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/schedules')}>
            <ArrowLeft className="h-4 w-4" />
            Back to schedules
          </Button>
          <h1 id="edit-schedule-title" className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            Edit Schedule
          </h1>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Schedule details</CardTitle>
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
                  <Label htmlFor="classId">Class</Label>
                  <Select
                    value={watch('classId')}
                    onValueChange={(value) => setValue('classId', value)}
                  >
                    <SelectTrigger id="classId">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.classes.map((gymClass) => (
                        <SelectItem key={gymClass.id} value={gymClass.id}>
                          {gymClass.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.classId && (
                    <p className="text-sm text-red-600">{errors.classId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainerId">Trainer</Label>
                  <Select
                    value={watch('trainerId')}
                    onValueChange={(value) => setValue('trainerId', value)}
                  >
                    <SelectTrigger id="trainerId">
                      <SelectValue placeholder="Select trainer" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.trainers.map((trainer) => (
                        <SelectItem key={trainer.id} value={trainer.id}>
                          {trainer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.trainerId && (
                    <p className="text-sm text-red-600">{errors.trainerId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dayOfWeek">Day of week</Label>
                  <Select
                    value={watch('dayOfWeek')}
                    onValueChange={(value) => setValue('dayOfWeek', value as ScheduleFormData['dayOfWeek'])}
                  >
                    <SelectTrigger id="dayOfWeek">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day}>
                          {day.charAt(0) + day.slice(1).toLowerCase()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.dayOfWeek && (
                    <p className="text-sm text-red-600">{errors.dayOfWeek.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxCapacity">Max capacity</Label>
                  <Input id="maxCapacity" type="number" min="1" {...register('maxCapacity')} />
                  {errors.maxCapacity && (
                    <p className="text-sm text-red-600">{errors.maxCapacity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start time</Label>
                  <Input id="startTime" type="time" {...register('startTime')} />
                  {errors.startTime && (
                    <p className="text-sm text-red-600">{errors.startTime.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End time</Label>
                  <Input id="endTime" type="time" {...register('endTime')} />
                  {errors.endTime && (
                    <p className="text-sm text-red-600">{errors.endTime.message}</p>
                  )}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="location">Location (optional)</Label>
                  <Input id="location" placeholder="Studio A" {...register('location')} />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 md:col-span-2">
                  <div>
                    <Label htmlFor="isActive" className="text-sm font-medium text-gray-900">
                      Active status
                    </Label>
                    <p className="text-xs text-gray-500">
                      Inactive schedules do not appear in class booking.
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
                <Button type="button" variant="outline" onClick={() => router.push('/admin/schedules')}>
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
