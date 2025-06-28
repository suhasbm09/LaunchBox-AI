'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
  label?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variantClasses = {
  default: 'bg-secondary',
  gradient: 'bg-gradient-to-r from-secondary via-accent to-secondary',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function ProgressBar({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showLabel = false,
  label,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-foreground">
            {label || 'Progress'}
          </span>
          <span className="text-sm text-muted-foreground">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={cn(
        'w-full bg-slate-800 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variantClasses[variant]
          )}
        />
      </div>
    </div>
  );
}