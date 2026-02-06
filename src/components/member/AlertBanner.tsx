import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertBannerProps {
  type?: AlertType;
  title: string;
  message?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  className?: string;
}

const alertConfig: Record<AlertType, { icon: typeof Info; bgColor: string; iconColor: string; textColor: string }> = {
  info: {
    icon: Info,
    bgColor: 'bg-blue-50',
    iconColor: 'text-blue-600',
    textColor: 'text-blue-900',
  },
  success: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    iconColor: 'text-green-600',
    textColor: 'text-green-900',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-50',
    iconColor: 'text-yellow-600',
    textColor: 'text-yellow-900',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-50',
    iconColor: 'text-red-600',
    textColor: 'text-red-900',
  },
};

export function AlertBanner({
  type = 'info',
  title,
  message,
  action,
  onDismiss,
  className,
}: AlertBannerProps) {
  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn('rounded-lg border p-4', config.bgColor, className)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', config.iconColor)} />
        <div className="flex-1">
          <h3 className={cn('font-semibold', config.textColor)}>{title}</h3>
          {message && (
            <p className={cn('mt-1 text-sm', config.textColor)}>{message}</p>
          )}
          {action && (
            <div className="mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={action.onClick}
                className={cn('border-current', config.textColor)}
              >
                {action.label}
              </Button>
            </div>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className={cn('flex-shrink-0', config.iconColor, 'hover:opacity-70')}
          >
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}
