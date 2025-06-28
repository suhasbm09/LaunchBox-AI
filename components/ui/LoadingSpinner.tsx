'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2, Zap, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'gradient' | 'pulse' | 'dots';
  text?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
};

const textSizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

export function LoadingSpinner({ 
  size = 'md', 
  variant = 'default', 
  text, 
  className 
}: LoadingSpinnerProps) {
  const renderSpinner = () => {
    switch (variant) {
      case 'gradient':
        return (
          <div className="relative">
            <div className={cn(
              'animate-spin rounded-full border-2 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500',
              sizeClasses[size]
            )}>
              <div className="absolute inset-1 rounded-full bg-slate-900" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className={cn('text-indigo-400', {
                'w-2 h-2': size === 'sm',
                'w-3 h-3': size === 'md',
                'w-4 h-4': size === 'lg',
                'w-6 h-6': size === 'xl',
              })} />
            </div>
          </div>
        );

      case 'pulse':
        return (
          <div className="relative">
            <div className={cn(
              'animate-pulse rounded-full bg-gradient-to-r from-indigo-500 to-purple-500',
              sizeClasses[size]
            )} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className={cn('text-white animate-pulse', {
                'w-2 h-2': size === 'sm',
                'w-3 h-3': size === 'md',
                'w-4 h-4': size === 'lg',
                'w-6 h-6': size === 'xl',
              })} />
            </div>
          </div>
        );

      case 'dots':
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'rounded-full bg-indigo-500 animate-bounce',
                  {
                    'w-1 h-1': size === 'sm',
                    'w-2 h-2': size === 'md',
                    'w-3 h-3': size === 'lg',
                    'w-4 h-4': size === 'xl',
                  }
                )}
                style={{
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        );

      default:
        return (
          <Loader2 className={cn(
            'animate-spin text-indigo-500',
            sizeClasses[size]
          )} />
        );
    }
  };

  return (
    <div className={cn(
      'flex flex-col items-center justify-center space-y-2',
      className
    )}>
      {renderSpinner()}
      {text && (
        <p className={cn(
          'text-slate-400 font-medium animate-pulse',
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}