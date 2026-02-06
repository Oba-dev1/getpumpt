'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useMemo, useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft } from 'lucide-react'
import { getBookingFormOptions } from '@/lib/actions/bookings-form'
import { getScheduleOptionsByClass } from '@/lib/actions/schedules'
import { createBooking } from '@/lib/actions/bookings'
import { toast } from 'sonner'

const bookingSchema = z.object({
  memberId: z.string().min(1, 'Member is required'),
  classId: z.string().min(1, 'Class is required'),
  scheduleId: z.string().min(1, 'Schedule is required'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW']),
})

type BookingFormData = z.infer<typeof bookingSchema>

export default function NewBookingPage() {
  const router = useRouter()
  const sessionData = useSession()
  const session = sessionData?.data
  const sessionStatus = sessionData?.status || 'loading'
  const [saving, setSaving] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [options, setOptions] = useState<{
    members: any[]
    classes: any[]
    trainers: any[]
  }>({ members: [], classes: [], trainers: [] })
  const [scheduleOptions, setScheduleOptions] = useState<any[]>([])
  const [scheduleDays, setScheduleDays] = useState<Record<string, string>>({})

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      status: 'CONFIRMED',
      date: new Date().toISOString().split('T')[0],
    },
  })

  const selectedClass = watch('classId')
  const selectedSchedule = watch('scheduleId')
  const selectedDate = watch('date')

  useEffect(() => {
    async function fetchOptions() {
      if (!session?.user?.gymId) return

      setLoadingOptions(true)
      try {
        const result = await getBookingFormOptions(session.user.gymId)
        setOptions(result)
        if (result.members[0]) {
          setValue('memberId', result.members[0].id)
        }
        if (result.classes[0]) {
          setValue('classId', result.classes[0].id)
        }
      } catch (error) {
        toast.error('Failed to load booking options')
      } finally {
        setLoadingOptions(false)
      }
    }

    fetchOptions()
  }, [session, setValue])

  useEffect(() => {
    async function fetchSchedules() {
      if (!session?.user?.gymId || !selectedClass) return
      try {
        const schedules = await getScheduleOptionsByClass(session.user.gymId, selectedClass)
        setScheduleOptions(schedules)
        const dayMap: Record<string, string> = {}
        schedules.forEach((schedule) => {
          dayMap[schedule.id] = schedule.dayOfWeek
        })
        setScheduleDays(dayMap)
        if (schedules[0]) {
          setValue('scheduleId', schedules[0].id)
        }
      } catch (error) {
        toast.error('Failed to load schedules')
      }
    }

    fetchSchedules()
  }, [session, selectedClass, setValue])

  const dayWarning = useMemo(() => {
    if (!selectedSchedule || !selectedDate) return null
    const scheduleDay = scheduleDays[selectedSchedule]
    if (!scheduleDay) return null
    const date = new Date(selectedDate)
    const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY']
    const selectedDay = dayMap[date.getDay()]
    if (selectedDay !== scheduleDay) {
      return `Selected date is a ${selectedDay.toLowerCase()}, but this schedule runs on ${scheduleDay.toLowerCase()}.`
    }
    return null
  }, [selectedSchedule, selectedDate, scheduleDays])

  const onSubmit = async (data: BookingFormData) => {
    if (!session?.user?.gymId) return

    setSaving(true)
    try {
      await createBooking({
        gymId: session.user.gymId,
        userId: data.memberId,
        scheduleId: data.scheduleId,
        date: new Date(data.date),
        status: data.status,
      })
      toast.success('Booking created successfully')
      router.push('/admin/bookings')
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking')
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
    <main className="space-y-4" aria-labelledby="new-booking-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.push('/admin/bookings')}>
            <ArrowLeft className="h-4 w-4" />
            Back to bookings
          </Button>
          <h1 id="new-booking-title" className="mt-3 text-2xl font-semibold tracking-tight text-gray-900">
            Create Booking
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Assign a member to a schedule.
          </p>
        </div>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="rounded-t-xl border-b border-gray-200 bg-slate-50">
          <CardTitle className="text-lg text-gray-900">Booking details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {loadingOptions ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10" />
              ))}
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="memberId">Member</Label>
                  <Select
                    value={watch('memberId')}
                    onValueChange={(value) => setValue('memberId', value)}
                  >
                    <SelectTrigger id="memberId">
                      <SelectValue placeholder="Select member" />
                    </SelectTrigger>
                    <SelectContent>
                      {options.members.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name} ({member.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.memberId && (
                    <p className="text-sm text-red-600">{errors.memberId.message}</p>
                  )}
                </div>
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
                  <Label htmlFor="scheduleId">Schedule</Label>
                  <Select
                    value={watch('scheduleId')}
                    onValueChange={(value) => setValue('scheduleId', value)}
                  >
                    <SelectTrigger id="scheduleId">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      {scheduleOptions.map((schedule) => (
                        <SelectItem key={schedule.id} value={schedule.id}>
                          {schedule.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.scheduleId && (
                    <p className="text-sm text-red-600">{errors.scheduleId.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Booking date</Label>
                  <Input
                    id="date"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    {...register('date')}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-600">{errors.date.message}</p>
                  )}
                  {dayWarning && (
                    <p className="text-sm text-amber-700">{dayWarning}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value as BookingFormData['status'])}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      <SelectItem value="NO_SHOW">No-show</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.status && (
                    <p className="text-sm text-red-600">{errors.status.message}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => router.push('/admin/bookings')}>
                  Cancel
                </Button>
                <Button type="submit" loading={saving} disabled={!!dayWarning}>
                  Create booking
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  )
}
