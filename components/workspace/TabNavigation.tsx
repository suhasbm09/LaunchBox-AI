'use client';

import { motion } from 'framer-motion';
import { 
  Code, 
  FileText, 
  Settings, 
  BookOpen, 
  Rocket 
} from 'lucide-react';

export type TabType = 'editor' | 'dockerfile' | 'jenkinsfile' | 'guide' | 'deploy';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: Tab[] = [
  { id: 'editor', label: 'Editor', icon: Code },
  { id: 'dockerfile', label: 'Dockerfile', icon: FileText },
  { id: 'jenkinsfile', label: 'Jenkinsfile', icon: Settings },
  { id: 'guide', label: 'DevOps Guide', icon: BookOpen },
  { id: 'deploy', label: 'Deploy', icon: Rocket },
];

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  availableTabs?: TabType[];
}

export function TabNavigation({ activeTab, onTabChange, availableTabs }: TabNavigationProps) {
  return (
    <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-xl">
      <div className="flex items-center overflow-x-auto scrollbar-hide px-4 sm:px-6">
        <div className="flex items-center space-x-1 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isEnabled = !availableTabs || availableTabs.includes(tab.id);
            
            return (
              <button
                key={tab.id}
                onClick={() => isEnabled && onTabChange(tab.id)}
                disabled={!isEnabled}
                className={`relative flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  isActive
                    ? 'text-white'
                    : isEnabled
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}