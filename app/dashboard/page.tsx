'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectGrid } from '@/components/dashboard/ProjectGrid';
import { CreateProjectDialog } from '@/components/dashboard/CreateProjectDialog';
import { useProjects } from '@/hooks/useProjects';
import { type Project } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { projects, loading, createProject, updateProject, deleteProject, archiveProject } = useProjects();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async (data: { name: string; type: Project['type']; description?: string }) => {
    await createProject(data);
    setShowCreateDialog(false);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    // TODO: Implement edit dialog
  };

  const handleOpenProject = (project: Project) => {
    router.push(`/project/${project.id}`);
  };

  // Listen for create project event from EmptyState
  useEffect(() => {
    const handleCreateProjectEvent = () => {
      setShowCreateDialog(true);
    };

    window.addEventListener('create-project', handleCreateProjectEvent);
    return () => window.removeEventListener('create-project', handleCreateProjectEvent);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Project Dashboard
              </h1>
              <p className="text-slate-400">
                Manage your AI-powered projects and track their progress
              </p>
            </div>
            
            <CreateProjectDialog 
              onCreateProject={handleCreateProject}
              trigger={
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 transition-all duration-300">
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              }
            />
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-morphism border-slate-600 focus:border-indigo-500 text-white placeholder:text-slate-400 transition-all duration-300"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white transition-colors duration-300"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              
              <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="text-slate-400 hover:text-white transition-colors duration-300"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="text-slate-400 hover:text-white transition-colors duration-300"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
        >
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-4 border border-slate-700/50 hover:border-indigo-500/30 transition-all duration-300">
            <div className="text-2xl font-bold text-white">{projects.length}</div>
            <div className="text-slate-400 text-sm">Total Projects</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-4 border border-slate-700/50 hover:border-green-500/30 transition-all duration-300">
            <div className="text-2xl font-bold text-green-400">
              {projects.filter(p => p.status === 'active').length}
            </div>
            <div className="text-slate-400 text-sm">Active Projects</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-lg p-4 border border-slate-700/50 hover:border-purple-500/30 transition-all duration-300">
            <div className="text-2xl font-bold text-indigo-400">
              {new Set(projects.map(p => p.type)).size}
            </div>
            <div className="text-slate-400 text-sm">Project Types</div>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ProjectGrid
            projects={filteredProjects}
            loading={loading}
            onEdit={handleEditProject}
            onDelete={deleteProject}
            onArchive={archiveProject}
            onOpen={handleOpenProject}
          />
        </motion.div>
      </div>
    </div>
  );
}