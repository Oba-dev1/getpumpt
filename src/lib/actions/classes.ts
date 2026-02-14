'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { requireGymPermission } from '@/lib/auth-helpers'
import { logActivity } from '@/lib/audit'
import {
  createGymClassSchema,
  updateGymClassSchema,
  type CreateGymClassInput,
  type UpdateGymClassInput,
} from '@/lib/validations'

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
  await requireGymPermission(gymId, 'classes:view')

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
  await requireGymPermission(gymId, 'classes:view')

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

export async function createGymClass(input: CreateGymClassInput) {
  const validated = createGymClassSchema.parse(input)
  const user = await requireGymPermission(validated.gymId, 'classes:manage')

  const gymClass = await prisma.gymClass.create({
    data: {
      gymId: validated.gymId,
      name: validated.name,
      description: validated.description,
      category: validated.category,
      duration: validated.duration,
      capacity: validated.capacity,
      imageUrl: validated.imageUrl,
      isActive: validated.isActive,
    },
  })

  logActivity({
    gymId: validated.gymId,
    userId: user.id,
    action: 'CREATE',
    resourceType: 'CLASS',
    resourceId: gymClass.id,
    description: `Created class ${validated.name}`,
  })

  revalidatePath('/admin/classes')
  return { id: gymClass.id }
}

export async function updateGymClass(
  gymId: string,
  classId: string,
  input: UpdateGymClassInput
) {
  const validated = updateGymClassSchema.parse(input)
  const user = await requireGymPermission(gymId, 'classes:manage')

  const updated = await prisma.gymClass.update({
    where: { id: classId, gymId },
    data: validated,
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'CLASS',
    resourceId: classId,
    description: `Updated class ${classId}`,
  })

  revalidatePath('/admin/classes')
  revalidatePath(`/admin/classes/${classId}/edit`)
  return { id: updated.id }
}

export async function deleteGymClass(gymId: string, classId: string) {
  const user = await requireGymPermission(gymId, 'classes:manage')

  const schedulesCount = await prisma.classSchedule.count({
    where: { gymId, classId },
  })

  if (schedulesCount > 0) {
    throw new Error('Cannot delete class with scheduled sessions')
  }

  await prisma.gymClass.delete({
    where: { id: classId, gymId },
  })

  logActivity({
    gymId,
    userId: user.id,
    action: 'DELETE',
    resourceType: 'CLASS',
    resourceId: classId,
    description: `Deleted class ${classId}`,
  })

  revalidatePath('/admin/classes')
}

export async function toggleGymClassStatus(gymId: string, classId: string) {
  const user = await requireGymPermission(gymId, 'classes:manage')

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

  logActivity({
    gymId,
    userId: user.id,
    action: 'UPDATE',
    resourceType: 'CLASS',
    resourceId: classId,
    description: `${updated.isActive ? 'Activated' : 'Deactivated'} class ${classId}`,
  })

  revalidatePath('/admin/classes')
  return { id: updated.id, isActive: updated.isActive }
}
