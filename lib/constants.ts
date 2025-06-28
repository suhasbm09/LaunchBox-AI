// Application constants and configuration
export const APP_CONFIG = {
  name: 'LaunchBox.AI',
  version: '1.0.0',
  description: 'AI-powered DevOps platform',
  author: 'Suhas B M',
  repository: 'https://github.com/suhasbm09/launchbox-ai',
} as const;

export const API_CONFIG = {
  timeout: 30000,
  retries: 3,
  rateLimit: {
    requests: 100,
    window: 60000, // 1 minute
  },
} as const;

export const UI_CONFIG = {
  animations: {
    duration: 300,
    easing: 'ease-out',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: [
    '.js', '.ts', '.jsx', '.tsx', '.py', '.html', '.css', '.json', '.md',
    '.yml', '.yaml', '.dockerfile', '.env', '.gitignore'
  ],
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error occurred. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'An unexpected error occurred. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please wait before trying again.',
} as const;

export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: 'Project created successfully!',
  PROJECT_UPDATED: 'Project updated successfully!',
  PROJECT_DELETED: 'Project deleted successfully!',
  FILE_SAVED: 'File saved successfully!',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
} as const;