'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'

export async function getPayments(
  gymId: string,
  options?: {
    search?: string
    status?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
    method?: string
    dateFrom?: Date
    dateTo?: Date
    page?: number
    limit?: number
  }
) {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit

  const where: Prisma.PaymentWhereInput = {
    gymId,
    ...(options?.status && { status: options.status }),
    ...(options?.method && { paymentMethod: options.method }),
    ...(options?.dateFrom || options?.dateTo
      ? {
          createdAt: {
            ...(options?.dateFrom && { gte: options.dateFrom }),
            ...(options?.dateTo && { lte: options.dateTo }),
          },
        }
      : {}),
  }

  if (options?.search) {
    const term = options.search
    where.OR = [
      { user: { firstName: { contains: term, mode: 'insensitive' } } },
      { user: { lastName: { contains: term, mode: 'insensitive' } } },
      { user: { email: { contains: term, mode: 'insensitive' } } },
      { description: { contains: term, mode: 'insensitive' } },
    ]
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
      },
    }),
    prisma.payment.count({ where }),
  ])

  return {
    payments: payments.map((payment) => ({
      id: payment.id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      description: payment.description,
      createdAt: payment.createdAt,
      memberName: `${payment.user.firstName} ${payment.user.lastName}`,
      memberEmail: payment.user.email,
    })),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function getPaymentById(gymId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId, gymId },
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      membership: {
        include: {
          plan: { select: { name: true } },
        },
      },
    },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  return {
    id: payment.id,
    amount: Number(payment.amount),
    currency: payment.currency,
    status: payment.status,
    paymentMethod: payment.paymentMethod,
    paymentProvider: payment.paymentProvider,
    providerRef: payment.providerRef,
    description: payment.description,
    createdAt: payment.createdAt,
    memberName: `${payment.user.firstName} ${payment.user.lastName}`,
    memberEmail: payment.user.email,
    planName: payment.membership?.plan?.name ?? null,
  }
}

export async function refundPayment(
  gymId: string,
  paymentId: string,
  input?: { amount?: number; reason?: string }
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId, gymId },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  if (payment.status !== 'COMPLETED') {
    throw new Error('Only completed payments can be refunded')
  }

  const refundAmount =
    typeof input?.amount === 'number' ? input.amount : Number(payment.amount)

  if (refundAmount <= 0 || refundAmount > Number(payment.amount)) {
    throw new Error('Refund amount must be greater than 0 and not exceed payment amount')
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId, gymId },
    data: {
      status: 'REFUNDED',
      description: input?.reason
        ? `${payment.description ?? 'Refunded payment'} · ${input.reason}`
        : payment.description ?? 'Refunded payment',
    },
  })

  revalidatePath('/admin/payments')
  revalidatePath(`/admin/payments/${paymentId}`)
  return { id: updated.id, status: updated.status }
}
