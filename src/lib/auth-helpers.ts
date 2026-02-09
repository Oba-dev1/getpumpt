/**
 * Authentication Helper Functions for Server Actions
 *
 * These functions provide consistent authentication and authorization
 * checks across all server actions to prevent security vulnerabilities.
 */

import { auth } from '@/lib/auth'
import { hasPermission, type Permission } from '@/lib/permissions'

export interface AuthUser {
  id: string
  email: string
  role: string
  gymId: string
}

/**
 * Require authentication - throws if user is not authenticated
 *
 * @returns Authenticated user session
 * @throws Error if not authenticated
 */
export async function requireAuth(): Promise<AuthUser> {
  const session = await auth()

  if (!session?.user) {
    throw new Error('Unauthorized: Authentication required')
  }

  return {
    id: session.user.id,
    email: session.user.email || '',
    role: session.user.role,
    gymId: session.user.gymId,
  }
}

/**
 * Require admin authentication - throws if user is not an admin
 *
 * @returns Authenticated admin user session
 * @throws Error if not authenticated or not an admin
 */
export async function requireAdminAuth(): Promise<AuthUser> {
  const user = await requireAuth()

  if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Admin access required')
  }

  return user
}

/**
 * Require super admin authentication - throws if user is not a super admin
 *
 * @returns Authenticated super admin user session
 * @throws Error if not authenticated or not a super admin
 */
export async function requireSuperAdminAuth(): Promise<AuthUser> {
  const user = await requireAuth()

  if (user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Super Admin access required')
  }

  return user
}

/**
 * Verify gym access - throws if user doesn't have access to the specified gym
 *
 * @param user - Authenticated user
 * @param gymId - Gym ID to verify access to
 * @throws Error if user doesn't have access to the gym
 */
export function verifyGymAccess(user: AuthUser, gymId: string): void {
  if (user.gymId !== gymId && user.role !== 'SUPER_ADMIN') {
    throw new Error('Unauthorized: Access denied to this gym')
  }
}

/**
 * Require gym admin access - throws if user is not authenticated as admin for the gym
 *
 * @param gymId - Gym ID to verify admin access to
 * @returns Authenticated admin user session
 * @throws Error if not authenticated, not an admin, or doesn't have access to gym
 */
export async function requireGymAdminAuth(gymId: string): Promise<AuthUser> {
  const user = await requireAdminAuth()
  verifyGymAccess(user, gymId)
  return user
}

/**
 * Require user owns resource or is admin
 *
 * @param userId - User ID that owns the resource
 * @returns Authenticated user session
 * @throws Error if user doesn't own resource and is not an admin
 */
export async function requireOwnerOrAdmin(userId: string): Promise<AuthUser> {
  const user = await requireAuth()

  if (user.id !== userId && !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Can only access your own resources or require admin access')
  }

  return user
}

/**
 * Require user owns resource in specific gym or is gym admin
 *
 * @param gymId - Gym ID
 * @param userId - User ID that owns the resource
 * @returns Authenticated user session
 * @throws Error if user doesn't own resource and is not a gym admin
 */
export async function requireGymOwnerOrAdmin(gymId: string, userId: string): Promise<AuthUser> {
  const user = await requireAuth()
  verifyGymAccess(user, gymId)

  if (user.id !== userId && !['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Can only access your own resources or require admin access')
  }

  return user
}

/**
 * Require staff-or-higher authentication
 * STAFF, ADMIN, and SUPER_ADMIN pass this check
 *
 * @returns Authenticated staff user session
 * @throws Error if not authenticated or not staff/admin
 */
export async function requireStaffAuth(): Promise<AuthUser> {
  const user = await requireAuth()

  if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    throw new Error('Unauthorized: Staff access required')
  }

  return user
}

/**
 * Require gym staff access - staff, admin, or super admin for the gym
 *
 * @param gymId - Gym ID to verify staff access to
 * @returns Authenticated staff user session
 * @throws Error if not authenticated, not staff/admin, or no gym access
 */
export async function requireGymStaffAuth(gymId: string): Promise<AuthUser> {
  const user = await requireStaffAuth()
  verifyGymAccess(user, gymId)
  return user
}

/**
 * Require specific permission for a gym action
 *
 * @param gymId - Gym ID to verify access to
 * @param permission - Required permission
 * @returns Authenticated user session
 * @throws Error if not authenticated, no gym access, or missing permission
 */
export async function requireGymPermission(
  gymId: string,
  permission: Permission
): Promise<AuthUser> {
  const user = await requireGymStaffAuth(gymId)
  if (!hasPermission(user.role, permission)) {
    throw new Error(`Unauthorized: Missing permission '${permission}'`)
  }
  return user
}
