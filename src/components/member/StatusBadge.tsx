import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MembershipStatus, BookingStatus, PaymentStatus } from '@prisma/client';

type StatusType = MembershipStatus | BookingStatus | PaymentStatus | string;

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  ACTIVE: {
    label: 'Active',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  EXPIRED: {
    label: 'Expired',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  PAUSED: {
    label: 'Paused',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  CANCELLED: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  },
  CONFIRMED: {
    label: 'Confirmed',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
  },
  COMPLETED: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
  },
  NO_SHOW: {
    label: 'No Show',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
  },
  PENDING: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100',
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
  },
  REFUNDED: {
    label: 'Refunded',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-100',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  };

  return (
    <Badge className={cn(config.className, className)} variant="secondary">
      {config.label}
    </Badge>
  );
}
