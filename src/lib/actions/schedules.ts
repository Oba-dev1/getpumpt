'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { requireGymPermission } from '@/lib/auth-helpers'
import { logActivity } from '@/lib/audit'
import {
  createClassScheduleSchema,
  updateClassScheduleSchema,
  type CreateClassScheduleInput,
  type UpdateClassScheduleInput,
} from '@/lib/validations'

export async function getGymSchedules(
  gymId: string,
  options?: {
    classId?: string
    trainerId?: string
    dayOfWeek?: string
    status?: 'ACTIVE' | 'INACTIVE'
    page?: number
    limit?: number
  }
) {
  await requireGymPermission(gymId, 'schedules:view')

  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit

  const where: Prisma.ClassScheduleWhereInput = {
    gymId,
    ...(options?.classId && { classId: options.classId }),
    ...(options?.trainerId && { trainerId: options.trainerId }),
    ...(options?.dayOfWeek && { dayOfWeek: options.dayOfWeek as any }),
    ...(options?.status && { isActive: options.status === 'ACTIVE' }),
  }

  const [schedules, total] = await Promise.all([
    prisma.classSchedule.findMany({
      where,
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      skip,
      take: limit,
      include: {
        gymClass: { select: { name: true } },
        trainer: { select: { firstName: true, lastName: true } },
        _count: { select: { bookings: true } },
      },
    }),
    prisma.classSchedule.count({ where }),
  ])

  return {
    schedules: schedules.map((schedule) => ({
      id: schedule.id,
      classId: schedule.classId,
      trainerId: schedule.trainerId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      maxCapacity: schedule.maxCapacity,
      location: schedule.location,
      isActive: schedule.isActive,
      className: schedule.gymClass.name,
      trainerName: `${schedule.trainer.firstName} ${schedule.trainer.lastName}`,
      bookingCount: schedule._count.bookings,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getScheduleFormOptions(gymId: string) {
  await requireGymPermission(gymId, 'schedules:view')

  const [classes, trainers] = await Promise.all([
    prisma.gymClass.findMany({
      where: { gymId, isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    }),
    prisma.trainer.findMany({
      where: { gymId, isActive: true },
      orderBy: { firstName: 'asc' },
      select: { id: true, firstName: true, lastName: true },
    }),
  ])

  return {
    classes,
    trainers: trainers.map((trainer) => ({
      id: trainer.id,
      name: `${trainer.firstName} ${trainer.lastName}`,
    })),
  }
}

export async function getScheduleOptionsByClass(
  gymId: string,
  classId?: string
) {
  await requireGymPermission(gymId, 'schedules:view')

  const schedules = await prisma.classSchedule.findMany({
    where: {
      gymId,
      isActive: true,
      ...(classId ? { classId } : {}),
    },
    orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    include: {
      gymClass: { select: { name: true } },
      trainer: { select: { firstName: true, lastName: true } },
    },
  })

  return schedules.map((schedule) => ({
    id: schedule.id,
    dayOfWeek: schedule.dayOfWeek,
    label: `${schedule.gymClass.name} · ${schedule.dayOfWeek.charAt(0) + schedule.dayOfWeek.slice(1).toLowerCase()} ${schedule.startTime}-${schedule.endTime} · ${schedule.trainer.firstName} ${schedule.trainer.lastName}`,
  }))
}

export async function getGymScheduleById(gymId: string, scheduleId: string) {
  await requireGymPermission(gymId, 'schedules:view')

  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId, gymId },
    include: {
      gymClass: { select: { name: true, description: true, category: true, duration: true } },
      trainer: { select: { firstName: true, lastName: true, email: true } },
      _count: { select: { bookings: true } },
    },
  })

  if (!schedule) {
    throw new Error('Schedule not found')
  }

  return {
    id: schedule.id,
    classId: schedule.classId,
    trainerId: schedule.trainerId,
    dayOfWeek: schedule.dayOfWeek,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
    maxCapacity: schedule.maxCapacity,
    location: schedule.location,
    isActive: schedule.isActive,
    className: schedule.gymClass.name,
    classDescription: schedule.gymClass.description,
    classCategory: schedule.gymClass.category,
    classDuration: schedule.gymClass.duration,
    trainerName: `${schedule.trainer.firstName} ${schedule.trainer.lastName}`,
    trainerEmail: schedule.trainer.email,
    bookingCount: schedule._count.bookings,
  }
}

export async function createGymSchedule(input: CreateClassScheduleInput) {
  const validated = createClassScheduleSchema.parse(input)
  const user = await requireGymPermission(validated.gymId, 'schedules:manage')

  const schedule = await prisma.classSchedule.create({
    data: {
      gymId: validated.gymId,
      classId: validated.classId,
      trainerId: validated.trainerId,
      dayOfWeek: validated.dayOfWeek,
      startTime: validated.startTime,
      endTime: validated.endTime,
      maxCapacity: validated.maxCapacity,
      location: validated.location,
      isActive: validated.isActive,
    },
  })

  logActivity({
    gymId: validated.gymId,
    userId: user.id,
    action: 'CREATE',
    resourceType: 'SCHEDULE',
    resourceId: schedule.id,
    description: `Created schedule for ${validated.dayOfWeek}`,
  })

  revalidatePath('/admin/schedules')
  return { id: schedule.id }
}

export async function updateGymSchedule(
  gymId: string,
  scheduleId: string,
  input: UpdateClassScheduleInput
) {
  const validated = updateClassScheduleSchema.parse(input)
  const user = await requireGymPermission(gymId, 'schedules:manage')

  const updated = await prisma.classSchedule.update({
    where: { id: scheduleId, gymId },
    data: validated,
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'SCHEDULE',
    resourceId: scheduleId,
    description: `Updated schedule ${scheduleId}`,
  })

  revalidatePath('/admin/schedules')
  revalidatePath(`/admin/schedules/${scheduleId}/edit`)
  return { id: updated.id }
}

export async function deleteGymSchedule(gymId: string, scheduleId: string) {
  const user = await requireGymPermission(gymId, 'schedules:manage')

  const bookingsCount = await prisma.classBooking.count({
    where: { gymId, scheduleId },
  })

  if (bookingsCount > 0) {
    throw new Error('Cannot delete schedule with existing bookings')
  }

  await prisma.classSchedule.delete({
    where: { id: scheduleId, gymId },
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'DELETE',
    resourceType: 'SCHEDULE',
    resourceId: scheduleId,
    description: `Deleted schedule ${scheduleId}`,
  })

  revalidatePath('/admin/schedules')
}

export async function toggleGymScheduleStatus(gymId: string, scheduleId: string) {
  const user = await requireGymPermission(gymId, 'schedules:manage')

  const schedule = await prisma.classSchedule.findUnique({
    where: { id: scheduleId, gymId },
  })

  if (!schedule) {
    throw new Error('Schedule not found')
  }

  const updated = await prisma.classSchedule.update({
    where: { id: scheduleId, gymId },
    data: { isActive: !schedule.isActive },
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'SCHEDULE',
    resourceId: scheduleId,
    description: `${updated.isActive ? 'Activated' : 'Deactivated'} schedule ${scheduleId}`,
  })

  revalidatePath('/admin/schedules')
  return { id: updated.id, isActive: updated.isActive }
}
