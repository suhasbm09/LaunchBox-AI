import { createClient } from '@supabase/supabase-js';
import { logger } from './logger';
import { validateEnvironmentVariables } from './security';

// Only validate environment variables on the server
if (typeof window === 'undefined') {
  try {
    validateEnvironmentVariables();
  } catch (error) {
    logger.error('Supabase configuration validation failed', error as Error);
    throw error;
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
  global: {
    headers: {
      'X-Client-Info': 'launchbox-ai@1.0.0',
    },
  },
});

// Database types with enhanced validation
export interface Project {
  id: string;
  name: string;
  type: 'web-app' | 'mobile-app' | 'api' | 'microservice' | 'ai-model' | 'other';
  status: 'active' | 'archived' | 'deleted';
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  metadata?: ProjectMetadata;
}

export interface ProjectMetadata {
  language?: string;
  framework?: string;
  version?: string;
  dependencies?: string[];
  lastAnalyzed?: string;
  fileCount?: number;
  totalSize?: number;
}

export interface CreateProjectData {
  name: string;
  type: Project['type'];
  description?: string;
  metadata?: Partial<ProjectMetadata>;
}

export interface UpdateProjectData {
  name?: string;
  type?: Project['type'];
  status?: Project['status'];
  description?: string;
  metadata?: Partial<ProjectMetadata>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Enhanced authentication functions with error handling
export const getCurrentUser = async () => {
  try {
    logger.debug('Getting current user');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      logger.warn('Failed to get current user', { error: error.message });
      return { user: null, error };
    }
    
    logger.debug('Current user retrieved', { userId: user?.id });
    return { user, error: null };
  } catch (error) {
    logger.error('Unexpected error getting current user', error as Error);
    return { user: null, error };
  }
};

export const signOut = async () => {
  try {
    logger.info('User signing out');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      logger.error('Sign out failed', new Error(error.message));
      return { error };
    }
    
    logger.info('User signed out successfully');
    return { error: null };
  } catch (error) {
    logger.error('Unexpected error during sign out', error as Error);
    return { error };
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    logger.info('User attempting to sign in', { email });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    
    if (error) {
      logger.warn('Sign in failed', { email, error: error.message });
      return { data: null, error };
    }
    
    logger.info('User signed in successfully', { 
      userId: data.user?.id,
      email: data.user?.email 
    });
    
    return { data, error: null };
  } catch (error) {
    logger.error('Unexpected error during sign in', error as Error, { email });
    return { data: null, error };
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    logger.info('User attempting to sign up', { email });
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) {
      logger.warn('Sign up failed', { email, error: error.message });
      return { data: null, error };
    }
    
    logger.info('User signed up successfully', { 
      userId: data.user?.id,
      email: data.user?.email,
      needsConfirmation: !data.session 
    });
    
    return { data, error: null };
  } catch (error) {
    logger.error('Unexpected error during sign up', error as Error, { email });
    return { data: null, error };
  }
};

export const resetPassword = async (email: string) => {
  try {
    logger.info('Password reset requested', { email });
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    
    if (error) {
      logger.warn('Password reset failed', { email, error: error.message });
      return { error };
    }
    
    logger.info('Password reset email sent', { email });
    return { error: null };
  } catch (error) {
    logger.error('Unexpected error during password reset', error as Error, { email });
    return { error };
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    logger.info('Password update requested');
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    
    if (error) {
      logger.warn('Password update failed', { error: error.message });
      return { error };
    }
    
    logger.info('Password updated successfully');
    return { error: null };
  } catch (error) {
    logger.error('Unexpected error during password update', error as Error);
    return { error };
  }
};

// Enhanced session management
export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      logger.warn('Failed to get session', { error: error.message });
      return { session: null, error };
    }
    
    return { session, error: null };
  } catch (error) {
    logger.error('Unexpected error getting session', error as Error);
    return { session: null, error };
  }
};

// Auth state change listener with enhanced logging
export const onAuthStateChange = (callback: (event: string, session: any) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    logger.info('Auth state changed', { 
      event, 
      userId: session?.user?.id,
      email: session?.user?.email 
    });
    callback(event, session);
  });
};

// Database helper functions with error handling
export const executeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> => {
  try {
    const result = await queryFn();
    
    if (result.error) {
      logger.error('Database query failed', new Error(result.error.message), {
        code: result.error.code,
        details: result.error.details,
      });
    }
    
    return result;
  } catch (error) {
    logger.error('Unexpected database error', error as Error);
    return { data: null, error };
  }
};

// Connection health check
export const checkConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('projects').select('id').limit(1);
    
    if (error) {
      logger.error('Supabase connection check failed', new Error(error.message));
      return false;
    }
    
    logger.debug('Supabase connection healthy');
    return true;
  } catch (error) {
    logger.error('Supabase connection check error', error as Error);
    return false;
  }
};

// Initialize connection check on module load
if (typeof window !== 'undefined') {
  checkConnection().catch(() => {
    // Connection check failed, but don't throw to avoid breaking the app
    logger.warn('Initial Supabase connection check failed');
  });
}