import { Badge } from '@/components/ui/badge'

type StatusType =
  | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  | 'EXPIRED' | 'CANCELLED' | 'PAUSED'
  | 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
  | 'CONFIRMED' | 'NO_SHOW'
  | 'NEW' | 'CONTACTED' | 'RESOLVED' | 'CLOSED'

const statusConfig: Record<StatusType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline' }> = {
  ACTIVE: { label: 'Active', variant: 'success' },
  INACTIVE: { label: 'Inactive', variant: 'secondary' },
  SUSPENDED: { label: 'Suspended', variant: 'destructive' },
  EXPIRED: { label: 'Expired', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'secondary' },
  PAUSED: { label: 'Paused', variant: 'warning' },
  PENDING: { label: 'Pending', variant: 'warning' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'destructive' },
  REFUNDED: { label: 'Refunded', variant: 'outline' },
  CONFIRMED: { label: 'Confirmed', variant: 'success' },
  NO_SHOW: { label: 'No Show', variant: 'destructive' },
  NEW: { label: 'New', variant: 'default' },
  CONTACTED: { label: 'Contacted', variant: 'warning' },
  RESOLVED: { label: 'Resolved', variant: 'success' },
  CLOSED: { label: 'Closed', variant: 'secondary' },
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status as StatusType] ?? {
    label: status,
    variant: 'secondary' as const,
  }

  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  )
}
