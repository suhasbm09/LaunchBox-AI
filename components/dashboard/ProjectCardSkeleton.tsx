'use client';

import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export function ProjectCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Skeleton className="w-9 h-9 rounded-lg bg-slate-700/50" />
          <div>
            <Skeleton className="h-5 w-32 mb-2 bg-slate-700/50" />
            <Skeleton className="h-4 w-20 bg-slate-700/50" />
          </div>
        </div>
        <Skeleton className="w-8 h-8 rounded bg-slate-700/50" />
      </div>

      {/* Description */}
      <div className="mb-4">
        <Skeleton className="h-4 w-full mb-2 bg-slate-700/50" />
        <Skeleton className="h-4 w-3/4 bg-slate-700/50" />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Skeleton className="w-2 h-2 rounded-full bg-slate-700/50" />
          <Skeleton className="h-3 w-12 bg-slate-700/50" />
        </div>
        <Skeleton className="h-3 w-16 bg-slate-700/50" />
      </div>
    </motion.div>
  );
}