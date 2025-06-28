// Comprehensive validation utilities
import { z } from 'zod';
import type { ValidationRule } from './types';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

export const projectNameSchema = z
  .string()
  .min(2, 'Project name must be at least 2 characters')
  .max(50, 'Project name must be less than 50 characters')
  .regex(/^[a-zA-Z0-9\s\-_]+$/, 'Project name can only contain letters, numbers, spaces, hyphens, and underscores');

export const projectTypeSchema = z.enum(['web-app', 'mobile-app', 'api', 'microservice', 'ai-model', 'other']);

export const projectDescriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters')
  .optional();

// Form validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const createProjectSchema = z.object({
  name: projectNameSchema,
  type: projectTypeSchema,
  description: projectDescriptionSchema,
});

export const updateProjectSchema = z.object({
  name: projectNameSchema.optional(),
  type: projectTypeSchema.optional(),
  description: projectDescriptionSchema,
});

export const newsletterSchema = z.object({
  email: emailSchema,
});

// File validation
export const validateFileSize = (file: File, maxSize: number = 10 * 1024 * 1024): boolean => {
  return file.size <= maxSize;
};

export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(extension);
};

// Custom validation functions
export const validateProjectName = (name: string): string | null => {
  try {
    projectNameSchema.parse(name);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid project name';
    }
    return 'Invalid project name';
  }
};

export const validateEmail = (email: string): string | null => {
  try {
    emailSchema.parse(email);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.errors[0]?.message || 'Invalid email';
    }
    return 'Invalid email';
  }
};

// Generic validation helper
export const validateField = (value: any, rules: ValidationRule): string | null => {
  if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
    return 'This field is required';
  }

  if (value && typeof value === 'string') {
    if (rules.minLength && value.length < rules.minLength) {
      return `Must be at least ${rules.minLength} characters`;
    }

    if (rules.maxLength && value.length > rules.maxLength) {
      return `Must be less than ${rules.maxLength} characters`;
    }

    if (rules.pattern && !rules.pattern.test(value)) {
      return 'Invalid format';
    }
  }

  if (rules.custom) {
    return rules.custom(value);
  }

  return null;
};

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9\-_.]/g, '_') // Replace invalid characters
    .replace(/_{2,}/g, '_') // Replace multiple underscores
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
};

// Rate limiting validation
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, number[]>();

  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    requests.set(identifier, validRequests);
    
    return true; // Request allowed
  };
};