'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { requireGymAdminAuth } from '@/lib/auth-helpers'
import {
  createStaffSchema,
  updateStaffRoleSchema,
  type CreateStaffInput,
  type UpdateStaffRoleInput,
} from '@/lib/validations'

interface GetStaffOptions {
  search?: string
  role?: 'STAFF' | 'ADMIN'
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  sortBy?: 'NAME' | 'JOINED' | 'ROLE' | 'STATUS'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export async function getStaff(gymId: string, options?: GetStaffOptions) {
  await requireGymAdminAuth(gymId)

  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit
  const sortBy = options?.sortBy ?? 'JOINED'
  const sortDir = options?.sortDir ?? 'desc'

  const where: Prisma.UserWhereInput = {
    gymId,
    role: options?.role ? options.role : { in: ['STAFF', 'ADMIN'] },
    ...(options?.search && {
      OR: [
        { firstName: { contains: options.search, mode: 'insensitive' } },
        { lastName: { contains: options.search, mode: 'insensitive' } },
        { email: { contains: options.search, mode: 'insensitive' } },
      ],
    }),
    ...(options?.status && { status: options.status }),
  }

  const orderBy: Prisma.UserOrderByWithRelationInput[] =
    sortBy === 'NAME'
      ? [{ firstName: sortDir }, { lastName: sortDir }]
      : sortBy === 'ROLE'
        ? [{ role: sortDir }, { createdAt: 'desc' }]
        : sortBy === 'STATUS'
          ? [{ status: sortDir }, { createdAt: 'desc' }]
          : [{ createdAt: sortDir }]

  const [staff, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatar: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ])

  return {
    staff,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getStaffById(gymId: string, staffId: string) {
  await requireGymAdminAuth(gymId)

  const staff = await prisma.user.findUnique({
    where: {
      id: staffId,
      gymId,
      role: { in: ['STAFF', 'ADMIN'] },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!staff) {
    throw new Error('Staff member not found')
  }

  return staff
}

export async function createStaff(gymId: string, input: CreateStaffInput) {
  await requireGymAdminAuth(gymId)

  const validated = createStaffSchema.parse(input)

  const existingUser = await prisma.user.findUnique({
    where: {
      gymId_email: {
        gymId,
        email: validated.email,
      },
    },
  })

  if (existingUser) {
    throw new Error('A user with this email already exists in your gym')
  }

  const hashedPassword = await bcrypt.hash(validated.password, 10)

  const staff = await prisma.user.create({
    data: {
      gymId,
      firstName: validated.firstName,
      lastName: validated.lastName,
      email: validated.email,
      phone: validated.phone,
      passwordHash: hashedPassword,
      role: validated.role,
      status: 'ACTIVE',
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
    },
  })

  revalidatePath('/admin/staff')
  return staff
}

export async function updateStaffRole(
  gymId: string,
  staffId: string,
  currentUserId: string,
  input: UpdateStaffRoleInput
) {
  await requireGymAdminAuth(gymId)

  const validated = updateStaffRoleSchema.parse(input)

  if (staffId === currentUserId) {
    throw new Error('You cannot change your own role')
  }

  const existingStaff = await prisma.user.findUnique({
    where: {
      id: staffId,
      gymId,
      role: { in: ['STAFF', 'ADMIN'] },
    },
  })

  if (!existingStaff) {
    throw new Error('Staff member not found')
  }

  const updated = await prisma.user.update({
    where: { id: staffId, gymId },
    data: { role: validated.role },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  })

  revalidatePath('/admin/staff')
  revalidatePath(`/admin/staff/${staffId}`)
  return updated
}

export async function deleteStaff(
  gymId: string,
  staffId: string,
  currentUserId: string
) {
  await requireGymAdminAuth(gymId)

  if (staffId === currentUserId) {
    throw new Error('You cannot delete your own account')
  }

  const existingStaff = await prisma.user.findUnique({
    where: {
      id: staffId,
      gymId,
      role: { in: ['STAFF', 'ADMIN'] },
    },
  })

  if (!existingStaff) {
    throw new Error('Staff member not found')
  }

  await prisma.user.delete({
    where: { id: staffId, gymId },
  })

  revalidatePath('/admin/staff')
}
