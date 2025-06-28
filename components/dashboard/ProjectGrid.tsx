'use client';

import { motion } from 'framer-motion';
import { ProjectCard } from './ProjectCard';
import { ProjectCardSkeleton } from './ProjectCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { type Project } from '@/lib/supabase';
import { Rocket } from 'lucide-react';

interface ProjectGridProps {
  projects: Project[];
  loading: boolean;
  onEdit: (project: Project) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onOpen: (project: Project) => void;
}

export function ProjectGrid({ projects, loading, onEdit, onDelete, onArchive, onOpen }: ProjectGridProps) {
  if (loading) {
    return (
      <div className="space-y-8">
        <LoadingSpinner 
          variant="gradient" 
          size="lg" 
          text="Loading your projects..." 
          className="py-16"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={Rocket}
        title="Ready to Build Something Amazing?"
        description="Your project dashboard is empty. Create your first AI-powered project and start building the future."
        action={{
          label: "Create Your First Project",
          onClick: () => {
            // This will be handled by the parent component
            const event = new CustomEvent('create-project');
            window.dispatchEvent(event);
          }
        }}
      />
    );
  }

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onOpen={onOpen}
          index={index}
        />
      ))}
    </motion.div>
  );
}