'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

export async function getTrainers(
  gymId: string,
  options?: {
    search?: string
    status?: 'ACTIVE' | 'INACTIVE'
    sortBy?: 'NAME' | 'CREATED'
    sortDir?: 'asc' | 'desc'
    page?: number
    limit?: number
  }
) {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit
  const sortBy = options?.sortBy ?? 'CREATED'
  const sortDir = options?.sortDir ?? 'desc'

  const where: Prisma.TrainerWhereInput = {
    gymId,
    ...(options?.search && {
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ],
    }),
    ...(options?.status && { isActive: options.status === 'ACTIVE' }),
  }

  const orderBy: Prisma.TrainerOrderByWithRelationInput[] =
    sortBy === 'NAME'
      ? [{ firstName: sortDir }, { lastName: sortDir }]
      : [{ createdAt: sortDir }]

  const [trainers, total] = await Promise.all([
    prisma.trainer.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: { select: { schedules: true } },
      },
    }),
    prisma.trainer.count({ where }),
  ])

  return {
    trainers: trainers.map((trainer) => ({
      id: trainer.id,
      firstName: trainer.firstName,
      lastName: trainer.lastName,
      email: trainer.email,
      phone: trainer.phone,
      specialties: trainer.specialties,
      certifications: trainer.certifications,
      yearsExperience: trainer.yearsExperience,
      isActive: trainer.isActive,
      schedules: trainer._count.schedules,
      createdAt: trainer.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getTrainerById(gymId: string, trainerId: string) {
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId, gymId },
    include: {
      _count: { select: { schedules: true } },
      schedules: {
        include: {
          gymClass: { select: { name: true } },
        },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        take: 5,
      },
    },
  })

  if (!trainer) {
    throw new Error('Trainer not found')
  }

  return {
    id: trainer.id,
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    email: trainer.email,
    phone: trainer.phone,
    bio: trainer.bio,
    specialties: trainer.specialties,
    certifications: trainer.certifications,
    yearsExperience: trainer.yearsExperience,
    imageUrl: trainer.imageUrl,
    isActive: trainer.isActive,
    schedulesCount: trainer._count.schedules,
    schedulesPreview: trainer.schedules.map((schedule) => ({
      id: schedule.id,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      className: schedule.gymClass.name,
    })),
  }
}

export async function createTrainer(input: {
  gymId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  bio?: string
  specialties?: string[]
  certifications?: string[]
  yearsExperience?: number
  imageUrl?: string
  isActive?: boolean
}) {
  const trainer = await prisma.trainer.create({
    data: {
      gymId: input.gymId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      bio: input.bio,
      specialties: input.specialties ?? [],
      certifications: input.certifications ?? [],
      yearsExperience: input.yearsExperience,
      imageUrl: input.imageUrl,
      isActive: input.isActive ?? true,
    },
  })

  revalidatePath('/admin/trainers')
  return { id: trainer.id }
}

export async function updateTrainer(
  gymId: string,
  trainerId: string,
  input: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    bio?: string
    specialties?: string[]
    certifications?: string[]
    yearsExperience?: number
    imageUrl?: string
    isActive?: boolean
  }
) {
  const updated = await prisma.trainer.update({
    where: { id: trainerId, gymId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      bio: input.bio,
      specialties: input.specialties,
      certifications: input.certifications,
      yearsExperience: input.yearsExperience,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
    },
  })

  revalidatePath('/admin/trainers')
  revalidatePath(`/admin/trainers/${trainerId}/edit`)
  return { id: updated.id }
}

export async function deleteTrainer(gymId: string, trainerId: string) {
  const schedulesCount = await prisma.classSchedule.count({
    where: { gymId, trainerId },
  })

  if (schedulesCount > 0) {
    throw new Error('Cannot delete trainer with scheduled classes')
  }

  await prisma.trainer.delete({
    where: { id: trainerId, gymId },
  })

  revalidatePath('/admin/trainers')
}

export async function toggleTrainerStatus(gymId: string, trainerId: string) {
  const trainer = await prisma.trainer.findUnique({
    where: { id: trainerId, gymId },
  })

  if (!trainer) {
    throw new Error('Trainer not found')
  }

  const updated = await prisma.trainer.update({
    where: { id: trainerId, gymId },
    data: { isActive: !trainer.isActive },
  })

  revalidatePath('/admin/trainers')
  return { id: updated.id, isActive: updated.isActive }
}
