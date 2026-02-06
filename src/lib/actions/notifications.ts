'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/auth-helpers'

export async function getNotifications(
  gymId: string,
  options?: {
    search?: string
    type?: string
    status?: 'READ' | 'UNREAD'
    page?: number
    limit?: number
  }
) {
  const page = options?.page ?? 1
  const limit = options?.limit ?? 20
  const skip = (page - 1) * limit

  const where: Prisma.NotificationWhereInput = {
    gymId,
    ...(options?.type && { type: options.type as any }),
    ...(options?.status && { isRead: options.status === 'READ' }),
  }

  if (options?.search) {
    const term = options.search
    where.OR = [
      { title: { contains: term, mode: 'insensitive' } },
      { message: { contains: term, mode: 'insensitive' } },
    ]
  }

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { gymId, isRead: false } }),
  ])

  return {
    notifications: notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      isRead: notification.isRead,
      link: notification.link,
      createdAt: notification.createdAt,
    })),
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export async function markNotificationRead(gymId: string, notificationId: string) {
  const updated = await prisma.notification.update({
    where: { id: notificationId, gymId },
    data: { isRead: true },
  })

  revalidatePath('/admin/notifications')
  return { id: updated.id }
}

export async function markAllNotificationsRead(gymId: string) {
  await prisma.notification.updateMany({
    where: { gymId, isRead: false },
    data: { isRead: true },
  })

  revalidatePath('/admin/notifications')
}

export async function getNotificationById(
  gymId: string,
  notificationId: string
) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId, gymId },
  })

  if (!notification) {
    throw new Error('Notification not found')
  }

  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    link: notification.link,
    createdAt: notification.createdAt,
  }
}

export async function getMemberNotifications(
  userId: string,
  unreadOnly = false
) {
  const user = await requireAuth()

  if (user.id !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Can only query your own notifications')
  }

  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(unreadOnly && { isRead: false }),
    },
    orderBy: [{ isRead: 'asc' }, { createdAt: 'desc' }],
    take: 50,
  })

  return notifications
}

export async function getMemberUnreadCount(userId: string): Promise<number> {
  const user = await requireAuth()

  if (user.id !== userId && !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Can only query your own notifications')
  }

  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  })

  return count
}

export async function markMemberNotificationRead(
  userId: string,
  notificationId: string
) {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification || notification.userId !== userId) {
    throw new Error('Notification not found or unauthorized')
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  })

  revalidatePath('/member/notifications')
  return { success: true, id: updated.id }
}

export async function markAllMemberNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  })

  revalidatePath('/member/notifications')
  return { success: true }
}
