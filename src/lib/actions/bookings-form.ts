'use server'

import { prisma } from '@/lib/prisma'

export async function getBookingFormOptions(gymId: string) {
  const [members, classes, trainers] = await Promise.all([
    prisma.user.findMany({
      where: { gymId, role: 'MEMBER', status: 'ACTIVE' },
      orderBy: { firstName: 'asc' },
      select: { id: true, firstName: true, lastName: true, email: true },
    }),
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
    members: members.map((member) => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
    })),
    classes,
    trainers: trainers.map((trainer) => ({
      id: trainer.id,
      name: `${trainer.firstName} ${trainer.lastName}`,
    })),
  }
}
