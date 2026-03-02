'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAuth } from '@/lib/auth-helpers'
import { sendNotification } from '@/lib/notification-helpers'
import { ptBookingSchema, ptSessionIdSchema } from '@/lib/validations'
import type { MemberActionState } from '@/components/member/MemberActionForm'

export async function getAvailablePTTrainers() {
  const user = await requireAuth()

  const trainers = await prisma.trainer.findMany({
    where: {
      gymId: user.gymId,
      isAvailableForPT: true,
      isActive: true,
    },
    orderBy: [{ sortOrder: 'asc' }, { firstName: 'asc' }],
    select: {
      id: true,
      firstName: true,
      lastName: true,
      bio: true,
      specialties: true,
      imageUrl: true,
      yearsExperience: true,
      ptPrice: true,
      ptDaysPerWeek: true,
    },
  })

  return trainers.map((trainer) => ({
    id: trainer.id,
    firstName: trainer.firstName,
    lastName: trainer.lastName,
    bio: trainer.bio,
    specialties: trainer.specialties,
    imageUrl: trainer.imageUrl,
    yearsExperience: trainer.yearsExperience,
    ptPrice: trainer.ptPrice ? Number(trainer.ptPrice) : null,
    ptDaysPerWeek: trainer.ptDaysPerWeek,
  }))
}

export async function requestPTSession(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = ptBookingSchema.safeParse({
    trainerId: formData.get('trainerId'),
    date: formData.get('date'),
    sessionsPerWeek: formData.get('sessionsPerWeek'),
    notes: formData.get('notes'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  const trainer = await prisma.trainer.findUnique({
    where: { id: parsed.data.trainerId, gymId: user.gymId, isAvailableForPT: true, isActive: true },
    select: { id: true, firstName: true, lastName: true, ptPrice: true },
  })

  if (!trainer) {
    return { status: 'error' as const, message: 'Trainer not found or not available for PT.' }
  }

  const sessionDate = new Date(`${parsed.data.date}T00:00:00`)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (sessionDate < today) {
    return { status: 'error' as const, message: 'Please select a future date.' }
  }

  await prisma.trainingSession.create({
    data: {
      gymId: user.gymId,
      userId: user.id,
      trainerId: trainer.id,
      date: sessionDate,
      notes: parsed.data.notes || null,
      status: 'SCHEDULED',
      amount: trainer.ptPrice,
      sessionsPerWeek: parsed.data.sessionsPerWeek,
    },
  })

  sendNotification(
    user.gymId,
    user.id,
    'BOOKING',
    'PT Session Requested',
    `Your PT session request with ${trainer.firstName} ${trainer.lastName} has been submitted. The gym will confirm shortly.`,
    '/member/bookings'
  )

  revalidatePath('/member/trainers')
  revalidatePath('/member/bookings')
  revalidatePath('/member')
  return { status: 'success' as const, message: `PT session request sent to ${trainer.firstName} ${trainer.lastName}.` }
}

export async function getMemberPTSessions() {
  const user = await requireAuth()

  const sessions = await prisma.trainingSession.findMany({
    where: { userId: user.id, gymId: user.gymId },
    orderBy: { date: 'desc' },
    include: {
      trainer: {
        select: { firstName: true, lastName: true, imageUrl: true },
      },
    },
    take: 30,
  })

  return sessions.map((session) => ({
    id: session.id,
    date: session.date,
    duration: session.duration,
    sessionsPerWeek: session.sessionsPerWeek,
    notes: session.notes,
    status: session.status,
    amount: session.amount ? Number(session.amount) : null,
    trainer: {
      firstName: session.trainer.firstName,
      lastName: session.trainer.lastName,
      imageUrl: session.trainer.imageUrl,
    },
    createdAt: session.createdAt,
  }))
}

export async function cancelPTSession(
  _prevState: MemberActionState,
  formData: FormData
) {
  const user = await requireAuth()

  const parsed = ptSessionIdSchema.safeParse({
    sessionId: formData.get('sessionId'),
  })

  if (!parsed.success) {
    const error = parsed.error.issues[0]
    return { status: 'error' as const, message: error?.message || 'Invalid input' }
  }

  const session = await prisma.trainingSession.findFirst({
    where: { id: parsed.data.sessionId, gymId: user.gymId, userId: user.id },
  })

  if (!session) {
    return { status: 'error' as const, message: 'Session not found.' }
  }

  if (session.status !== 'SCHEDULED') {
    return { status: 'error' as const, message: 'Only scheduled sessions can be cancelled.' }
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (session.date < today) {
    return { status: 'error' as const, message: 'Past sessions cannot be cancelled.' }
  }

  await prisma.trainingSession.update({
    where: { id: parsed.data.sessionId },
    data: { status: 'CANCELLED' },
  })

  revalidatePath('/member/bookings')
  revalidatePath('/member')
  return { status: 'success' as const, message: 'PT session cancelled.' }
}
