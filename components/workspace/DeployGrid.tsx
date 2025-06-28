'use client';

import { motion } from 'framer-motion';
import { Cloud, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const deployProviders = [
  {
    id: 'aws',
    name: 'AWS',
    description: 'Deploy to Amazon Web Services with EC2, ECS, or Lambda',
    icon: Cloud,
    color: 'from-orange-500 to-yellow-500',
    comingSoon: true,
  },
  {
    id: 'vercel',
    name: 'Vercel',
    description: 'Deploy to Vercel for seamless frontend hosting',
    icon: Zap,
    color: 'from-black to-gray-800',
    comingSoon: true,
  },
  {
    id: 'netlify',
    name: 'Netlify',
    description: 'Deploy to Netlify for modern web applications',
    icon: Globe,
    color: 'from-teal-500 to-cyan-500',
    comingSoon: true,
  },
];

export function DeployGrid() {
  const handleDeploy = (provider: string) => {
    toast.info(`${provider} deployment coming soon!`, {
      description: 'This feature is currently in development.',
    });
  };

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Deploy Your Project</h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Choose your preferred deployment platform to launch your application
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {deployProviders.map((provider, index) => {
          const Icon = provider.icon;
          
          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.02 }}
              className="glass-morphism p-4 sm:p-6 rounded-xl border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300"
            >
              <div className="flex items-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-r ${provider.color} p-2 sm:p-3 flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-white truncate">{provider.name}</h3>
                  {provider.comingSoon && (
                    <span className="text-xs text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full inline-block mt-1">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              
              <p className="text-slate-400 text-xs sm:text-sm mb-4 sm:mb-6 leading-relaxed">
                {provider.description}
              </p>
              
              <Button
                onClick={() => handleDeploy(provider.name)}
                disabled={provider.comingSoon}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {provider.comingSoon ? 'Coming Soon' : `Deploy to ${provider.name}`}
              </Button>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 sm:mt-8 p-4 sm:p-6 glass-morphism rounded-xl border border-slate-700/50">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-2">Custom Deployment</h3>
        <p className="text-slate-400 text-xs sm:text-sm mb-3 sm:mb-4">
          Need a custom deployment solution? Our AI can generate deployment scripts for any platform.
        </p>
        <Button
          variant="outline"
          onClick={() => toast.info('Custom deployment wizard coming soon!')}
          className="border-slate-600 text-slate-300 hover:text-white text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Request Custom Deployment</span>
          <span className="sm:hidden">Custom Deployment</span>
        </Button>
      </div>
    </div>
  );
}