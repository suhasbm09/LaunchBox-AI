import { supabase, executeQuery, type Project, type CreateProjectData, type UpdateProjectData } from './supabase';
import { logger } from './logger';
import { ValidationError, NotFoundError, AuthenticationError } from './error-handler';
import { validateProjectName, projectTypeSchema, projectDescriptionSchema } from './validation';

// Re-export types
export type { Project, CreateProjectData, UpdateProjectData };

export class ProjectsService {
  static async getProjects(): Promise<Project[]> {
    logger.debug('Fetching user projects');
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new AuthenticationError('User must be authenticated to fetch projects');
    }

    const result = await executeQuery(() =>
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
    );

    if (result.error) {
      logger.error('Failed to fetch projects', new Error(result.error.message), {
        userId: user.id,
        errorCode: result.error.code
      });
      throw new Error(`Failed to fetch projects: ${result.error.message}`);
    }

    logger.info('Projects fetched successfully', { 
      userId: user.id, 
      projectCount: result.data?.length || 0 
    });

    return result.data || [];
  }

  static async getProject(id: string): Promise<Project | null> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Project ID is required and must be a string');
    }

    logger.debug('Fetching project', { projectId: id });
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new AuthenticationError('User must be authenticated to fetch project');
    }

    const result = await executeQuery(() =>
      supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()
    );

    if (result.error) {
      if (result.error.code === 'PGRST116') {
        logger.warn('Project not found', { projectId: id, userId: user.id });
        return null;
      }
      
      logger.error('Failed to fetch project', new Error(result.error.message), {
        projectId: id,
        userId: user.id,
        errorCode: result.error.code
      });
      throw new Error(`Failed to fetch project: ${result.error.message}`);
    }

    logger.info('Project fetched successfully', { 
      projectId: id, 
      userId: user.id,
      projectName: result.data?.name 
    });

    return result.data;
  }

  static async createProject(projectData: CreateProjectData): Promise<Project> {
    logger.debug('Creating new project', { projectName: projectData.name });
    
    // Validate input data
    const nameValidation = validateProjectName(projectData.name);
    if (nameValidation) {
      throw new ValidationError(nameValidation);
    }

    try {
      projectTypeSchema.parse(projectData.type);
    } catch (error) {
      throw new ValidationError('Invalid project type');
    }

    if (projectData.description) {
      try {
        projectDescriptionSchema.parse(projectData.description);
      } catch (error) {
        throw new ValidationError('Description is too long (max 500 characters)');
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new AuthenticationError('User must be authenticated to create projects');
    }

    // Check if user has reached project limit (optional business logic)
    const existingProjects = await this.getProjects();
    const PROJECT_LIMIT = 50; // Configurable limit
    
    if (existingProjects.length >= PROJECT_LIMIT) {
      throw new ValidationError(`Project limit reached (${PROJECT_LIMIT} projects maximum)`);
    }

    // Prepare project data with metadata
    const projectToCreate = {
      ...projectData,
      user_id: user.id,
      metadata: {
        ...projectData.metadata,
        fileCount: 0,
        totalSize: 0,
        created: new Date().toISOString(),
      },
    };

    const result = await executeQuery(() =>
      supabase
        .from('projects')
        .insert(projectToCreate)
        .select()
        .single()
    );

    if (result.error) {
      logger.error('Failed to create project', new Error(result.error.message), {
        projectName: projectData.name,
        userId: user.id,
        errorCode: result.error.code
      });
      
      // Handle specific database errors
      if (result.error.code === '23505') { // Unique constraint violation
        throw new ValidationError('A project with this name already exists');
      }
      
      throw new Error(`Failed to create project: ${result.error.message}`);
    }

    logger.info('Project created successfully', { 
      projectId: result.data.id,
      projectName: result.data.name,
      userId: user.id 
    });

    return result.data;
  }

  static async updateProject(id: string, updates: UpdateProjectData): Promise<Project> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Project ID is required and must be a string');
    }

    logger.debug('Updating project', { projectId: id, updates });

    // Validate update data
    if (updates.name) {
      const nameValidation = validateProjectName(updates.name);
      if (nameValidation) {
        throw new ValidationError(nameValidation);
      }
    }

    if (updates.type) {
      try {
        projectTypeSchema.parse(updates.type);
      } catch (error) {
        throw new ValidationError('Invalid project type');
      }
    }

    if (updates.description !== undefined) {
      try {
        projectDescriptionSchema.parse(updates.description);
      } catch (error) {
        throw new ValidationError('Description is too long (max 500 characters)');
      }
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new AuthenticationError('User must be authenticated to update projects');
    }

    // Check if project exists and belongs to user
    const existingProject = await this.getProject(id);
    if (!existingProject) {
      throw new NotFoundError('Project not found or access denied');
    }

    // Prepare update data with metadata
    const updateData = {
      ...updates,
      metadata: {
        ...existingProject.metadata,
        ...updates.metadata,
        lastModified: new Date().toISOString(),
      },
    };

    const result = await executeQuery(() =>
      supabase
        .from('projects')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()
    );

    if (result.error) {
      logger.error('Failed to update project', new Error(result.error.message), {
        projectId: id,
        userId: user.id,
        errorCode: result.error.code
      });
      
      if (result.error.code === '23505') {
        throw new ValidationError('A project with this name already exists');
      }
      
      throw new Error(`Failed to update project: ${result.error.message}`);
    }

    logger.info('Project updated successfully', { 
      projectId: id,
      userId: user.id,
      updatedFields: Object.keys(updates)
    });

    return result.data;
  }

  static async deleteProject(id: string): Promise<void> {
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Project ID is required and must be a string');
    }

    logger.debug('Deleting project', { projectId: id });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new AuthenticationError('User must be authenticated to delete projects');
    }

    // Check if project exists and belongs to user
    const existingProject = await this.getProject(id);
    if (!existingProject) {
      throw new NotFoundError('Project not found or access denied');
    }

    // Soft delete by updating status
    const result = await executeQuery(() =>
      supabase
        .from('projects')
        .update({ 
          status: 'deleted',
          metadata: {
            ...existingProject.metadata,
            deletedAt: new Date().toISOString(),
          }
        })
        .eq('id', id)
        .eq('user_id', user.id)
    );

    if (result.error) {
      logger.error('Failed to delete project', new Error(result.error.message), {
        projectId: id,
        userId: user.id,
        errorCode: result.error.code
      });
      throw new Error(`Failed to delete project: ${result.error.message}`);
    }

    logger.info('Project deleted successfully', { 
      projectId: id,
      userId: user.id,
      projectName: existingProject.name
    });
  }

  static async archiveProject(id: string): Promise<Project> {
    logger.debug('Archiving project', { projectId: id });
    return this.updateProject(id, { status: 'archived' });
  }

  static async restoreProject(id: string): Promise<Project> {
    logger.debug('Restoring project', { projectId: id });
    return this.updateProject(id, { status: 'active' });
  }

  static async getProjectStats(id: string): Promise<{
    fileCount: number;
    totalSize: number;
    lastModified: string;
    languages: string[];
  }> {
    const project = await this.getProject(id);
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    // Return stats from metadata or defaults
    return {
      fileCount: project.metadata?.fileCount || 0,
      totalSize: project.metadata?.totalSize || 0,
      lastModified: project.updated_at,
      languages: project.metadata?.language ? [project.metadata.language] : [],
    };
  }

  static async searchProjects(query: string): Promise<Project[]> {
    if (!query || query.trim().length < 2) {
      throw new ValidationError('Search query must be at least 2 characters');
    }

    logger.debug('Searching projects', { query });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new AuthenticationError('User must be authenticated to search projects');
    }

    const result = await executeQuery(() =>
      supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .order('created_at', { ascending: false })
    );

    if (result.error) {
      logger.error('Failed to search projects', new Error(result.error.message), {
        query,
        userId: user.id,
        errorCode: result.error.code
      });
      throw new Error(`Failed to search projects: ${result.error.message}`);
    }

    logger.info('Project search completed', { 
      query,
      userId: user.id,
      resultCount: result.data?.length || 0
    });

    return result.data || [];
  }
}