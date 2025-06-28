'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ProjectsService } from './projects';
import type { CreateProjectData, UpdateProjectData } from './supabase';

export async function createProjectAction(data: CreateProjectData) {
  try {
    const project = await ProjectsService.createProject(data);
    revalidatePath('/dashboard');
    return { success: true, project };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create project' };
  }
}

export async function updateProjectAction(id: string, data: UpdateProjectData) {
  try {
    const project = await ProjectsService.updateProject(id, data);
    revalidatePath('/dashboard');
    revalidatePath(`/project/${id}`);
    return { success: true, project };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to update project' };
  }
}

export async function deleteProjectAction(id: string) {
  try {
    await ProjectsService.deleteProject(id);
    revalidatePath('/dashboard');
    redirect('/dashboard');
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to delete project' };
  }
}

export async function archiveProjectAction(id: string) {
  try {
    const project = await ProjectsService.archiveProject(id);
    revalidatePath('/dashboard');
    return { success: true, project };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Failed to archive project' };
  }
}

export async function subscribeNewsletter(formData: FormData) {
  try {
    const email = formData.get('email') as string;
    
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Invalid email address' };
    }

    // Here you would typically save to your database or mailing service
    console.log('Newsletter subscription:', { email });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return { success: true, data: { email } };
  } catch (error) {
    return { success: false, error: 'Failed to subscribe to newsletter' };
  }
}