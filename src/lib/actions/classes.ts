'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

export async function getGymClasses(
  gymId: string,
  options?: {
    search?: string
    status?: 'ACTIVE' | 'INACTIVE'
    category?: string
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

  const where: Prisma.GymClassWhereInput = {
    gymId,
    ...(options?.search && {
      OR: [
        { name: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ],
    }),
    ...(options?.status && { isActive: options.status === 'ACTIVE' }),
    ...(options?.category && { category: options.category as any }),
  }

  const orderBy: Prisma.GymClassOrderByWithRelationInput[] =
    sortBy === 'NAME' ? [{ name: sortDir }] : [{ createdAt: sortDir }]

  const [classes, total] = await Promise.all([
    prisma.gymClass.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: { select: { schedules: true } },
      },
    }),
    prisma.gymClass.count({ where }),
  ])

  return {
    classes: classes.map((gymClass) => ({
      id: gymClass.id,
      name: gymClass.name,
      description: gymClass.description,
      category: gymClass.category,
      duration: gymClass.duration,
      capacity: gymClass.capacity,
      isActive: gymClass.isActive,
      schedules: gymClass._count.schedules,
      createdAt: gymClass.createdAt,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getGymClassById(gymId: string, classId: string) {
  const gymClass = await prisma.gymClass.findUnique({
    where: { id: classId, gymId },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      duration: true,
      capacity: true,
      imageUrl: true,
      isActive: true,
    },
  })

  if (!gymClass) {
    throw new Error('Class not found')
  }

  return gymClass
}

export async function createGymClass(input: {
  gymId: string
  name: string
  description?: string
  category: string
  duration: number
  capacity: number
  imageUrl?: string
  isActive?: boolean
}) {
  const gymClass = await prisma.gymClass.create({
    data: {
      gymId: input.gymId,
      name: input.name,
      description: input.description,
      category: input.category as any,
      duration: input.duration,
      capacity: input.capacity,
      imageUrl: input.imageUrl,
      isActive: input.isActive ?? true,
    },
  })

  revalidatePath('/admin/classes')
  return { id: gymClass.id }
}

export async function updateGymClass(
  gymId: string,
  classId: string,
  input: {
    name?: string
    description?: string
    category?: string
    duration?: number
    capacity?: number
    imageUrl?: string
    isActive?: boolean
  }
) {
  const updated = await prisma.gymClass.update({
    where: { id: classId, gymId },
    data: {
      name: input.name,
      description: input.description,
      category: input.category as any,
      duration: input.duration,
      capacity: input.capacity,
      imageUrl: input.imageUrl,
      isActive: input.isActive,
    },
  })

  revalidatePath('/admin/classes')
  revalidatePath(`/admin/classes/${classId}/edit`)
  return { id: updated.id }
}

export async function deleteGymClass(gymId: string, classId: string) {
  const schedulesCount = await prisma.classSchedule.count({
    where: { gymId, classId },
  })

  if (schedulesCount > 0) {
    throw new Error('Cannot delete class with scheduled sessions')
  }

  await prisma.gymClass.delete({
    where: { id: classId, gymId },
  })

  revalidatePath('/admin/classes')
}

export async function toggleGymClassStatus(gymId: string, classId: string) {
  const gymClass = await prisma.gymClass.findUnique({
    where: { id: classId, gymId },
  })

  if (!gymClass) {
    throw new Error('Class not found')
  }

  const updated = await prisma.gymClass.update({
    where: { id: classId, gymId },
    data: { isActive: !gymClass.isActive },
  })

  revalidatePath('/admin/classes')
  return { id: updated.id, isActive: updated.isActive }
}
