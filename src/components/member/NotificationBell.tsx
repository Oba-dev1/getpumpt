'use client';

import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getMemberUnreadCount } from '@/lib/actions/notifications';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  userId: string;
  className?: string;
}

export function NotificationBell({ userId, className }: NotificationBellProps) {
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const count = await getMemberUnreadCount(userId);
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [userId]);

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => router.push('/member/notifications')}
      className={cn('relative', className)}
      aria-label="Open notifications"
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Button>
  );
}
