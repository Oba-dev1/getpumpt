'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { MemberActionForm } from '@/components/member/MemberActionForm'
import { MemberActionButton } from '@/components/member/MemberActionButton'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatDate, formatTime } from '@/lib/utils'

type ScheduleItem = {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
  maxCapacity: number
  remainingSpots?: number
  nextDate?: string | Date | null
  gymClass: {
    name: string
  }
}

interface MemberBookingFormProps {
  schedules: ScheduleItem[]
  action: (prevState: any, formData: FormData) => Promise<any>
}

type AvailabilityState = {
  status: 'idle' | 'loading' | 'ready' | 'error'
  remaining?: number
  capacity?: number
  message?: string
  nextDate?: string
}

export function MemberBookingForm({ schedules, action }: MemberBookingFormProps) {
  const [scheduleId, setScheduleId] = useState('')
  const [date, setDate] = useState('')
  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'idle' })

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => schedule.id === scheduleId),
    [schedules, scheduleId]
  )

  useEffect(() => {
    if (!scheduleId || !date) {
      setAvailability({ status: 'idle' })
      return
    }

    let active = true
    setAvailability({ status: 'loading' })

    const params = new URLSearchParams({ scheduleId, date })
    fetch(`/api/member/bookings/availability?${params.toString()}`)
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data?.message || 'Unable to check availability.')
        }
        return data
      })
      .then((data) => {
        if (!active) return
        setAvailability({
          status: 'ready',
          remaining: data.remaining,
          capacity: data.capacity,
          message: data.message,
          nextDate: data.nextDate,
        })
      })
      .catch((error: any) => {
        if (!active) return
        setAvailability({
          status: 'error',
          message: error?.message || 'Unable to check availability.',
        })
      })

    return () => {
      active = false
    }
  }, [scheduleId, date])

  return (
    <MemberActionForm action={action} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="scheduleId" className="text-slate-200">
          Class schedule
        </Label>
        <select
          id="scheduleId"
          name="scheduleId"
          value={scheduleId}
          onChange={(event) => setScheduleId(event.target.value)}
          className="w-full rounded-md border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
          required
        >
          <option value="">Select a class schedule</option>
          {schedules.map((schedule) => {
            const remaining = typeof schedule.remainingSpots === 'number'
              ? schedule.remainingSpots
              : schedule.maxCapacity
            const isFull = remaining <= 0
            return (
              <option key={schedule.id} value={schedule.id} disabled={isFull}>
                {schedule.gymClass.name} - {schedule.dayOfWeek.toLowerCase()} -{' '}
                {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)} -{' '}
                {isFull ? 'Full' : `${remaining} spots`}
              </option>
            )
          })}
        </select>
        <p className="text-xs text-slate-400">
          Fully booked schedules are disabled based on the next occurrence.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="date" className="text-slate-200">
          Date
        </Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="border-white/10 bg-slate-900 text-slate-100"
          required
        />
        {availability.status === 'loading' ? (
          <p className="text-xs text-slate-400">Checking availability...</p>
        ) : availability.status === 'ready' ? (
          <p className="text-xs text-emerald-300">
            {availability.remaining} of {availability.capacity} spots remaining
            {availability.nextDate ? ` (next: ${formatDate(availability.nextDate)})` : ''}
          </p>
        ) : availability.status === 'error' ? (
          <p className="text-xs text-rose-400">{availability.message}</p>
        ) : selectedSchedule ? (
          <p className="text-xs text-slate-400">
            Choose a date that matches {selectedSchedule.dayOfWeek.toLowerCase()}.
          </p>
        ) : (
          <p className="text-xs text-slate-400">
            The date must match the schedule day of week. Availability is checked on submit.
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <MemberActionButton variant="gym" className="h-9 px-4 text-sm" pendingText="Booking...">
          Confirm booking
        </MemberActionButton>
        <p className="text-xs text-slate-400">Bookings are confirmed immediately.</p>
      </div>
    </MemberActionForm>
  )
}
