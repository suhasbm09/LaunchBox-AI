'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: typeof LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'secondary';
  };
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 px-4',
        className
      )}
    >
      {Icon && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative mb-6"
        >
          {/* Background decoration */}
          <div className="absolute -top-2 -left-2 w-16 h-16 bg-indigo-500/10 rounded-full blur-xl" />
          <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-purple-500/10 rounded-full blur-xl" />
          
          {/* Main icon container */}
          <div className="relative p-4 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
            <Icon className="w-12 h-12 text-slate-400" />
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="max-w-md"
      >
        <h3 className="text-xl font-semibold text-white mb-3">
          {title}
        </h3>
        
        <p className="text-slate-400 leading-relaxed mb-6">
          {description}
        </p>

        {action && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
              className={cn(
                'transition-all duration-300 transform hover:scale-105',
                action.variant === 'default' && 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-indigo-500/25'
              )}
            >
              {action.label}
            </Button>
          </motion.div>
        )}

        {children && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-6"
          >
            {children}
          </motion.div>
        )}
      </motion.div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/5 rounded-full blur-3xl" />
      </div>
    </motion.div>
  );
}