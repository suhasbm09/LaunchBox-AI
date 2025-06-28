// Comprehensive type definitions
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  type: ProjectType;
  status: ProjectStatus;
  description?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  metadata?: ProjectMetadata;
}

export type ProjectType = 'web-app' | 'mobile-app' | 'api' | 'microservice' | 'ai-model' | 'other';
export type ProjectStatus = 'active' | 'archived' | 'deleted';

export interface ProjectMetadata {
  language?: string;
  framework?: string;
  version?: string;
  dependencies?: string[];
  lastAnalyzed?: string;
}

export interface CreateProjectData {
  name: string;
  type: ProjectType;
  description?: string;
  metadata?: Partial<ProjectMetadata>;
}

export interface UpdateProjectData {
  name?: string;
  type?: ProjectType;
  status?: ProjectStatus;
  description?: string;
  metadata?: Partial<ProjectMetadata>;
}

export interface FileNode {
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
  size?: number;
  lastModified?: string;
}

export interface OpenFile {
  path: string;
  name: string;
  content: string;
  isDirty?: boolean;
  language?: string;
}

export interface AnalysisResult {
  dockerfile: string;
  jenkinsfile: string;
  guide: string;
  metadata?: {
    language: string;
    framework?: string;
    dependencies: string[];
    recommendations: string[];
  };
}

export interface LoadingState {
  isLoading: boolean;
  error?: string;
  progress?: number;
}

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
  duration?: number;
}

// Form validation types
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select';
  rules?: ValidationRule;
  options?: { value: string; label: string }[];
}

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export interface ModalProps extends BaseComponentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}