'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import {
  initializePayment,
  verifyPayment,
  generatePaymentReference,
} from '@/lib/paystack'
import { requireGymAdminAuth, requireGymOwnerOrAdmin, requireAuth, verifyGymAccess } from '@/lib/auth-helpers'

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
  await requireGymAdminAuth(gymId)
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
  await requireGymAdminAuth(gymId)

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
  await requireGymAdminAuth(gymId)

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

/**
 * Initialize a membership payment via Paystack
 *
 * @param gymId - Gym ID
 * @param userId - User ID
 * @param membershipId - Membership ID
 * @param callbackUrl - URL to redirect after payment
 * @returns Payment initialization data
 */
export async function initializeMembershipPayment(
  gymId: string,
  userId: string,
  membershipId: string,
  callbackUrl: string
) {
  await requireGymOwnerOrAdmin(gymId, userId)

  // Validate callback URL is on our domain
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL
  if (appUrl) {
    try {
      const parsed = new URL(callbackUrl)
      const allowed = new URL(appUrl)
      if (parsed.origin !== allowed.origin) {
        throw new Error('Invalid callback URL')
      }
    } catch {
      throw new Error('Invalid callback URL')
    }
  }

  const membership = await prisma.membership.findUnique({
    where: { id: membershipId, gymId },
    include: {
      plan: true,
      user: true,
    },
  })

  if (!membership) {
    throw new Error('Membership not found')
  }

  if (membership.userId !== userId) {
    throw new Error('Unauthorized: Membership does not belong to this user')
  }

  const reference = generatePaymentReference('MEM')

  const payment = await prisma.payment.create({
    data: {
      gymId,
      userId,
      membershipId,
      amount: membership.plan.price,
      currency: membership.plan.currency,
      status: 'PENDING',
      paymentProvider: 'PAYSTACK',
      providerRef: reference,
      paymentMethod: 'ONLINE',
      description: `Payment for ${membership.plan.name} membership`,
    },
  })

  const paystackResponse = await initializePayment({
    email: membership.user.email,
    amount: Number(membership.plan.price),
    reference,
    currency: membership.plan.currency,
    callback_url: callbackUrl,
    metadata: {
      gymId,
      userId,
      membershipId,
      paymentId: payment.id,
      planName: membership.plan.name,
    },
  })

  return {
    paymentId: payment.id,
    authorizationUrl: paystackResponse.data.authorization_url,
    reference: paystackResponse.data.reference,
  }
}

/**
 * Verify and complete a membership payment
 *
 * @param gymId - Gym ID
 * @param reference - Paystack payment reference
 * @returns Updated payment data
 */
export async function verifyMembershipPayment(gymId: string, reference: string) {
  const user = await requireAuth()
  verifyGymAccess(user, gymId)

  const payment = await prisma.payment.findFirst({
    where: {
      gymId,
      providerRef: reference,
      status: 'PENDING',
    },
    include: {
      membership: true,
    },
  })

  if (!payment) {
    throw new Error('Payment not found or already processed')
  }

  if (payment.userId !== user.id && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Can only verify your own payments or require admin access')
  }

  const verification = await verifyPayment(reference)

  if (verification.data.status !== 'success') {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'FAILED',
          description: `${payment.description} · ${verification.data.gateway_response}`,
        },
      }),
      ...(payment.membership
        ? [
            prisma.membership.update({
              where: { id: payment.membershipId! },
              data: { status: 'EXPIRED' },
            }),
          ]
        : []),
    ])

    throw new Error('Payment verification failed')
  }

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: 'COMPLETED',
      paymentMethod: verification.data.channel.toUpperCase(),
    },
  })

  if (payment.membership && payment.membership.status !== 'ACTIVE') {
    await prisma.membership.update({
      where: { id: payment.membershipId! },
      data: { status: 'ACTIVE' },
    })
  }

  revalidatePath('/admin/payments')
  revalidatePath(`/admin/payments/${payment.id}`)
  revalidatePath('/admin/dashboard')

  return {
    id: updated.id,
    status: updated.status,
    amount: Number(updated.amount),
    currency: updated.currency,
  }
}

/**
 * Handle Paystack webhook events
 *
 * @param event - Webhook event type
 * @param data - Webhook event data
 * @returns Processing result
 */
export async function handlePaystackWebhook(
  event: string,
  data: {
    reference: string
    status: string
    amount: number
    gateway_response?: string
    metadata: any
  }
) {
  const HANDLED_EVENTS = ['charge.success', 'charge.failed']
  if (!HANDLED_EVENTS.includes(event)) {
    return { message: 'Event ignored' }
  }

  const { gymId, paymentId } = data.metadata

  if (!gymId || !paymentId) {
    throw new Error('Invalid webhook metadata: missing gymId or paymentId')
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId, gymId },
    include: { membership: true },
  })

  if (!payment) {
    throw new Error('Payment not found')
  }

  if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
    return { message: 'Payment already processed' }
  }

  // Verify webhook data matches payment record
  if (payment.providerRef !== data.reference) {
    throw new Error('Payment reference mismatch')
  }

  if (event === 'charge.failed') {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'FAILED',
          description: `${payment.description} · ${data.gateway_response || 'Payment failed'}`,
        },
      }),
      ...(payment.membership
        ? [
            prisma.membership.update({
              where: { id: payment.membershipId! },
              data: { status: 'EXPIRED' },
            }),
          ]
        : []),
    ])

    revalidatePath('/admin/payments')
    revalidatePath(`/admin/payments/${paymentId}`)
    revalidatePath('/admin/dashboard')

    return {
      message: 'Payment failure recorded',
      paymentId: payment.id,
    }
  }

  // charge.success handling
  // Verify amount matches (convert from kobo to naira for comparison)
  const expectedAmountInKobo = Math.round(Number(payment.amount) * 100)
  if (data.amount !== expectedAmountInKobo) {
    throw new Error(
      `Payment amount mismatch: expected ${expectedAmountInKobo} kobo, got ${data.amount} kobo`
    )
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'COMPLETED' },
  })

  if (payment.membership && payment.membership.status !== 'ACTIVE') {
    await prisma.membership.update({
      where: { id: payment.membershipId! },
      data: { status: 'ACTIVE' },
    })
  }

  revalidatePath('/admin/payments')
  revalidatePath(`/admin/payments/${paymentId}`)
  revalidatePath('/admin/dashboard')

  return {
    message: 'Payment processed successfully',
    paymentId: updated.id,
  }
}
