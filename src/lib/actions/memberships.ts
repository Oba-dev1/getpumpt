'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { assignMembershipSchema, type AssignMembershipInput } from '@/lib/validations'

export async function assignMembershipToPlan(
  gymId: string,
  memberId: string,
  input: AssignMembershipInput
) {
  const validated = assignMembershipSchema.parse(input)

  const member = await prisma.user.findUnique({
    where: { id: memberId, gymId, role: 'MEMBER' },
  })

  if (!member) {
    throw new Error('Member not found')
  }

  const plan = await prisma.membershipPlan.findUnique({
    where: { id: validated.planId, gymId },
  })

  if (!plan) {
    throw new Error('Plan not found')
  }

  if (!plan.isActive) {
    throw new Error('Cannot assign an inactive plan')
  }

  const existingMembership = await prisma.membership.findFirst({
    where: {
      userId: memberId,
      gymId,
      status: 'ACTIVE',
    },
  })

  if (existingMembership) {
    throw new Error('Member already has an active membership. Cancel or expire it first.')
  }

  const startDate = new Date(validated.startDate)
  const endDate = new Date(startDate)
  switch (plan.durationType) {
    case 'DAYS':
      endDate.setDate(endDate.getDate() + plan.durationValue)
      break
    case 'MONTHS':
      endDate.setMonth(endDate.getMonth() + plan.durationValue)
      break
    case 'YEARS':
      endDate.setFullYear(endDate.getFullYear() + plan.durationValue)
      break
  }

  const membership = await prisma.membership.create({
    data: {
      userId: memberId,
      gymId,
      planId: validated.planId,
      startDate,
      endDate,
      autoRenew: validated.autoRenew,
      status: 'ACTIVE',
    },
    include: {
      plan: { select: { name: true, price: true, currency: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${memberId}`)
  revalidatePath('/admin/dashboard')

  return {
    id: membership.id,
    planName: membership.plan.name,
    memberName: `${membership.user.firstName} ${membership.user.lastName}`,
    startDate: membership.startDate,
    endDate: membership.endDate,
  }
}

export async function cancelMembership(
  gymId: string,
  membershipId: string,
  reason?: string
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId, gymId },
  })

  if (!membership) {
    throw new Error('Membership not found')
  }

  if (membership.status !== 'ACTIVE') {
    throw new Error('Only active memberships can be cancelled')
  }

  const updated = await prisma.membership.update({
    where: { id: membershipId, gymId },
    data: {
      status: 'CANCELLED',
      endDate: new Date(),
      autoRenew: false,
    },
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${membership.userId}`)
  revalidatePath('/admin/dashboard')

  return { id: updated.id, status: updated.status }
}

export async function renewMembership(
  gymId: string,
  membershipId: string,
  autoRenew?: boolean
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId, gymId },
    include: { plan: true },
  })

  if (!membership) {
    throw new Error('Membership not found')
  }

  if (membership.status !== 'ACTIVE' && membership.status !== 'EXPIRED') {
    throw new Error('Only active or expired memberships can be renewed')
  }

  const startDate = new Date()
  const endDate = new Date(startDate)
  switch (membership.plan.durationType) {
    case 'DAYS':
      endDate.setDate(endDate.getDate() + membership.plan.durationValue)
      break
    case 'MONTHS':
      endDate.setMonth(endDate.getMonth() + membership.plan.durationValue)
      break
    case 'YEARS':
      endDate.setFullYear(endDate.getFullYear() + membership.plan.durationValue)
      break
  }

  const updated = await prisma.membership.update({
    where: { id: membershipId, gymId },
    data: {
      startDate,
      endDate,
      status: 'ACTIVE',
      autoRenew: autoRenew ?? membership.autoRenew,
    },
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${membership.userId}`)
  revalidatePath('/admin/dashboard')

  return { id: updated.id, status: updated.status, endDate: updated.endDate }
}

export async function updateMembershipAutoRenew(
  gymId: string,
  membershipId: string,
  autoRenew: boolean
) {
  const membership = await prisma.membership.findUnique({
    where: { id: membershipId, gymId },
  })

  if (!membership) {
    throw new Error('Membership not found')
  }

  const updated = await prisma.membership.update({
    where: { id: membershipId, gymId },
    data: { autoRenew },
  })

  revalidatePath('/admin/members')
  revalidatePath(`/admin/members/${membership.userId}`)

  return { id: updated.id, autoRenew: updated.autoRenew }
}
