'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Status = 'online' | 'offline' | 'syncing' | 'error' | 'idle';

interface PulseIndicatorProps {
  /** Current status */
  status?: Status;
  /** Custom color class (overrides status color) */
  colorClass?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show pulse animation */
  pulse?: boolean;
  /** Additional class names */
  className?: string;
  /** Label text */
  label?: string;
  /** Show label */
  showLabel?: boolean;
}

const statusColors: Record<Status, string> = {
  online: 'bg-green-500',
  offline: 'bg-slate-500',
  syncing: 'bg-blue-500',
  error: 'bg-red-500',
  idle: 'bg-amber-500',
};

const statusLabels: Record<Status, string> = {
  online: 'Connected',
  offline: 'Disconnected',
  syncing: 'Syncing...',
  error: 'Error',
  idle: 'Idle',
};

const sizes = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

export function PulseIndicator({
  status = 'online',
  colorClass,
  size = 'md',
  pulse = true,
  className,
  label,
  showLabel = false,
}: PulseIndicatorProps) {
  const color = colorClass || statusColors[status];
  const displayLabel = label || statusLabels[status];
  const shouldPulse = pulse && (status === 'online' || status === 'syncing');

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        {/* Pulse ring */}
        {shouldPulse && (
          <motion.div
            className={cn('absolute inset-0 rounded-full', color)}
            animate={{
              scale: [1, 2, 2],
              opacity: [0.5, 0.2, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        )}
        {/* Main dot */}
        <motion.div
          className={cn('rounded-full', color, sizes[size])}
          animate={
            status === 'syncing'
              ? {
                  scale: [1, 1.2, 1],
                  transition: { duration: 0.8, repeat: Infinity },
                }
              : {}
          }
        />
      </div>
      {showLabel && (
        <span className="text-sm text-slate-400">{displayLabel}</span>
      )}
    </div>
  );
}

// Connection status indicator for the header
interface ConnectionStatusProps {
  isConnected: boolean;
  isSyncing?: boolean;
  className?: string;
}

export function ConnectionStatus({
  isConnected,
  isSyncing = false,
  className,
}: ConnectionStatusProps) {
  const status: Status = isSyncing ? 'syncing' : isConnected ? 'online' : 'offline';

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700',
        className
      )}
    >
      <PulseIndicator status={status} size="sm" />
      <span className="text-xs text-slate-400">
        {isSyncing ? 'Syncing' : isConnected ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}

// Real-time update flash
interface UpdateFlashProps {
  /** Trigger flash when this changes */
  trigger: unknown;
  /** Flash color */
  color?: string;
  className?: string;
  children: React.ReactNode;
}

export function UpdateFlash({
  trigger,
  color = 'blue',
  className,
  children,
}: UpdateFlashProps) {
  return (
    <motion.div
      key={JSON.stringify(trigger)}
      className={cn('relative', className)}
      initial={{ backgroundColor: `rgb(var(--${color}-500) / 0.2)` }}
      animate={{ backgroundColor: 'transparent' }}
      transition={{ duration: 1 }}
    >
      {children}
    </motion.div>
  );
}
