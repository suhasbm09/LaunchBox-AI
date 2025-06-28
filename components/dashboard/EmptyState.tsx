'use client';

import { motion } from 'framer-motion';
import { Plus, Rocket, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onCreateProject?: () => void;
}

export function EmptyState({ onCreateProject }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      <div className="relative mb-8">
        {/* Floating elements */}
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-indigo-500/20 rounded-full blur-xl float-animation" />
        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-500/20 rounded-full blur-xl float-animation" />
        
        {/* Main icon */}
        <div className="relative p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50">
          <Rocket className="w-16 h-16 text-indigo-400" />
          <div className="absolute -top-2 -right-2 p-2 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
        </div>
      </div>

      <div className="text-center max-w-md">
        <h3 className="text-2xl font-bold text-white mb-4">
          Ready to Build Something Amazing?
        </h3>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your project dashboard is empty. Create your first AI-powered project and start building the future.
        </p>
        
        <Button
          onClick={onCreateProject}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Your First Project
        </Button>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
    </motion.div>
  );
}