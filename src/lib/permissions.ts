export type Permission =
  | 'dashboard:view'
  | 'members:view'
  | 'members:create'
  | 'members:edit'
  | 'members:delete'
  | 'members:checkin'
  | 'plans:view'
  | 'plans:create'
  | 'plans:edit'
  | 'plans:delete'
  | 'trainers:view'
  | 'trainers:manage'
  | 'classes:view'
  | 'classes:manage'
  | 'schedules:view'
  | 'schedules:manage'
  | 'bookings:view'
  | 'bookings:manage'
  | 'staff:view'
  | 'staff:manage'
  | 'payments:view'
  | 'payments:manage'
  | 'notifications:manage'
  | 'settings:manage'

const ALL_PERMISSIONS: readonly Permission[] = [
  'dashboard:view',
  'members:view',
  'members:create',
  'members:edit',
  'members:delete',
  'members:checkin',
  'plans:view',
  'plans:create',
  'plans:edit',
  'plans:delete',
  'trainers:view',
  'trainers:manage',
  'classes:view',
  'classes:manage',
  'schedules:view',
  'schedules:manage',
  'bookings:view',
  'bookings:manage',
  'staff:view',
  'staff:manage',
  'payments:view',
  'payments:manage',
  'notifications:manage',
  'settings:manage',
] as const

const ROLE_PERMISSIONS: Record<string, readonly Permission[]> = {
  STAFF: [
    'dashboard:view',
    'members:view',
    'members:create',
    'members:checkin',
    'plans:view',
    'plans:create',
    'plans:edit',
    'trainers:view',
    'trainers:manage',
    'classes:view',
    'classes:manage',
    'schedules:view',
    'schedules:manage',
    'bookings:view',
    'payments:view',
  ] as const,
  ADMIN: ALL_PERMISSIONS,
  SUPER_ADMIN: ALL_PERMISSIONS,
}

export function hasPermission(role: string, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role]
  if (!permissions) return false
  return permissions.includes(permission)
}

export function getPermissions(role: string): readonly Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export interface NavItem {
  href: string
  label: string
  iconKey: string
  requiredPermission: Permission
}

export const ADMIN_NAV_ITEMS: readonly NavItem[] = [
  { href: '/admin', label: 'Dashboard', iconKey: 'dashboard', requiredPermission: 'dashboard:view' },
  { href: '/admin/members', label: 'Members', iconKey: 'members', requiredPermission: 'members:view' },
  { href: '/admin/check-in', label: 'Check In', iconKey: 'checkin', requiredPermission: 'members:checkin' },
  { href: '/admin/staff', label: 'Staff', iconKey: 'staff', requiredPermission: 'staff:view' },
  { href: '/admin/membership-plans', label: 'Membership Plans', iconKey: 'plans', requiredPermission: 'plans:view' },
  { href: '/admin/plans', label: 'Plans', iconKey: 'plans2', requiredPermission: 'plans:view' },
  { href: '/admin/classes', label: 'Classes', iconKey: 'classes', requiredPermission: 'classes:view' },
  { href: '/admin/schedules', label: 'Schedules', iconKey: 'schedules', requiredPermission: 'schedules:view' },
  { href: '/admin/bookings', label: 'Bookings', iconKey: 'bookings', requiredPermission: 'bookings:view' },
  { href: '/admin/trainers', label: 'Trainers', iconKey: 'trainers', requiredPermission: 'trainers:view' },
  { href: '/admin/payments', label: 'Payments', iconKey: 'payments', requiredPermission: 'payments:view' },
  { href: '/admin/notifications', label: 'Notifications', iconKey: 'notifications', requiredPermission: 'notifications:manage' },
  { href: '/admin/settings', label: 'Settings', iconKey: 'settings', requiredPermission: 'settings:manage' },
] as const
