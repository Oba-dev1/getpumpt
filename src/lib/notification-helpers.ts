/**
 * Server-side only notification helper.
 * Not a 'use server' file — cannot be invoked as a Server Action from client components.
 * Import this only from other server-side modules (server actions, API routes).
 */

import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@prisma/client'

/**
 * Fire-and-forget: creates a single notification without blocking the caller.
 * Errors are silently swallowed so they never interrupt the main action.
 */
export function sendNotification(
  gymId: string,
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string
): void {
  prisma.notification
    .create({ data: { gymId, userId, type, title, message, link } })
    .catch(() => {})
}
