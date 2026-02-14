import { Wifi, WifiOff, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ConnectionBadgeProps {
  status: 'connected' | 'disconnected' | 'reconnecting';
  className?: string;
}

export function ConnectionBadge({ status, className }: ConnectionBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          label: 'Connected',
        };
      case 'reconnecting':
        return {
          icon: Loader2,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          label: 'Reconnecting...',
          animate: true,
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          label: 'Offline',
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
      role="status"
      aria-label={`Connection status: ${config.label}`}
      title={config.label}
    >
      <Icon className={cn('h-3 w-3', config.animate && 'animate-spin')} aria-hidden="true" />
      <span>{config.label}</span>
    </div>
  );
}
