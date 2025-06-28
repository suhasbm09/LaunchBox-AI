'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  Edit, 
  Archive, 
  Trash2, 
  ExternalLink,
  Globe,
  Smartphone,
  Server,
  Cpu,
  Brain,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type Project } from '@/lib/supabase';

const projectTypeIcons = {
  'web-app': Globe,
  'mobile-app': Smartphone,
  'api': Server,
  'microservice': Cpu,
  'ai-model': Brain,
  'other': Package,
};

const projectTypeColors = {
  'web-app': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'mobile-app': 'bg-green-500/10 text-green-400 border-green-500/20',
  'api': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'microservice': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  'ai-model': 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  'other': 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onOpen: (project: Project) => void;
  index: number;
}

export function ProjectCard({ project, onEdit, onDelete, onArchive, onOpen, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = projectTypeIcons[project.type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative"
    >
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
              <IconComponent className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-lg group-hover:text-indigo-300 transition-colors">
                {project.name}
              </h3>
              <Badge 
                variant="outline" 
                className={`text-xs mt-1 ${projectTypeColors[project.type]}`}
              >
                {project.type.replace('-', ' ')}
              </Badge>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-morphism border-slate-700">
              <DropdownMenuItem 
                onClick={() => onEdit(project)}
                className="text-slate-300 hover:text-white focus:text-white"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onOpen(project)}
                className="text-slate-300 hover:text-white focus:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-700" />
              <DropdownMenuItem 
                onClick={() => onArchive(project.id)}
                className="text-slate-300 hover:text-white focus:text-white"
              >
                <Archive className="w-4 h-4 mr-2" />
                Archive
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(project.id)}
                className="text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {project.description}
          </p>
        )}

        {/* Status and Timestamps */}
        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="capitalize">{project.status}</span>
          </div>
          <span>
            {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 rounded-xl pointer-events-none"
        />
      </div>
    </motion.div>
  );
}