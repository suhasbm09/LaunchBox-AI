'use client';

import { useState, useEffect } from 'react';
import { ProjectsService, type Project } from '@/lib/projects';
import { toast } from 'sonner';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ProjectsService.getProjects();
      setProjects(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch projects';
      setError(errorMessage);
      toast.error('Failed to load projects', {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData: { name: string; type: Project['type']; description?: string }) => {
    try {
      const newProject = await ProjectsService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      toast.success('Project created successfully!', {
        description: `${newProject.name} is ready to go.`,
      });
      return newProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create project';
      toast.error('Failed to create project', {
        description: errorMessage,
      });
      throw err;
    }
  };

  const updateProject = async (id: string, updates: { name?: string; type?: Project['type']; description?: string }) => {
    try {
      const updatedProject = await ProjectsService.updateProject(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      toast.success('Project updated successfully!');
      return updatedProject;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update project';
      toast.error('Failed to update project', {
        description: errorMessage,
      });
      throw err;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      await ProjectsService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project deleted successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete project';
      toast.error('Failed to delete project', {
        description: errorMessage,
      });
      throw err;
    }
  };

  const archiveProject = async (id: string) => {
    try {
      await ProjectsService.archiveProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      toast.success('Project archived successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to archive project';
      toast.error('Failed to archive project', {
        description: errorMessage,
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    archiveProject,
  };
}