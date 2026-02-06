import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const dayMap = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'] as const

function getNextDateForDay(dayOfWeek: string) {
  const today = new Date()
  const targetIndex = dayMap.indexOf(dayOfWeek as typeof dayMap[number])
  if (targetIndex === -1) return null
  const todayIndex = today.getDay()
  const diff = targetIndex >= todayIndex ? targetIndex - todayIndex : 7 - (todayIndex - targetIndex)
  const nextDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + diff)
  return nextDate
}

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.gymId || !session.user.id) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const scheduleId = searchParams.get('scheduleId') || ''
  const dateValue = searchParams.get('date') || ''

  if (!scheduleId || !dateValue) {
    return NextResponse.json({ message: 'Schedule and date are required.' }, { status: 400 })
  }

  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId },
    select: { id: true, gymId: true, dayOfWeek: true, maxCapacity: true },
  })

  if (!schedule || schedule.gymId !== session.user.gymId) {
    return NextResponse.json({ message: 'Schedule not found.' }, { status: 404 })
  }

  const bookingDate = new Date(`${dateValue}T00:00:00`)
  if (Number.isNaN(bookingDate.getTime())) {
    return NextResponse.json({ message: 'Invalid date.' }, { status: 400 })
  }

  const bookingDay = dayMap[bookingDate.getDay()]
  if (bookingDay !== schedule.dayOfWeek) {
    return NextResponse.json(
      { message: `Selected date must be on ${schedule.dayOfWeek.toLowerCase()}.` },
      { status: 400 }
    )
  }

  const bookedCount = await prisma.classBooking.count({
    where: {
      scheduleId,
      date: bookingDate,
      status: { not: 'CANCELLED' },
    },
  })

  const remaining = Math.max(schedule.maxCapacity - bookedCount, 0)
  const nextDate = getNextDateForDay(schedule.dayOfWeek)

  return NextResponse.json({
    remaining,
    capacity: schedule.maxCapacity,
    booked: bookedCount,
    nextDate: nextDate ? nextDate.toISOString() : null,
  })
}
