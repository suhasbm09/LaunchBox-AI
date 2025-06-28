// Security utilities and helpers
import { logger } from './logger';

// Content Security Policy
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://cdn.jsdelivr.net'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com', 'https://cdn.jsdelivr.net'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'connect-src': [
    "'self'",
    'https://api.openrouter.ai',
    'wss:',
    'https://bdbtfxstbpzkwrarxlqr.supabase.co',
    'https://bdbtfxstbpzkwrarxlqr.supabase.co/auth/v1',
    'https://bdbtfxstbpzkwrarxlqr.supabase.co/rest/v1'
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': []
};

// Input sanitization
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid protocol');
    }
    return parsed.toString();
  } catch {
    return '';
  }
};

// XSS prevention
export const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

// CSRF token generation
export const generateCSRFToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

// Rate limiting
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  isAllowed(identifier: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    
    // Remove old requests
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      logger.warn('Rate limit exceeded', { identifier, requests: validRequests.length });
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    
    return true;
  }

  reset(identifier: string): void {
    this.requests.delete(identifier);
  }

  clear(): void {
    this.requests.clear();
  }
}

export const rateLimiter = new RateLimiter();

// Password strength validation
export const validatePasswordStrength = (password: string): {
  score: number;
  feedback: string[];
  isStrong: boolean;
} => {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push('Use at least 8 characters');

  if (password.length >= 12) score += 1;

  // Character variety
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Include lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Include uppercase letters');

  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('Include numbers');

  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  else feedback.push('Include special characters');

  // Common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1;
  else feedback.push('Avoid repeated characters');

  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
  else feedback.push('Avoid common patterns');

  return {
    score,
    feedback,
    isStrong: score >= 6
  };
};

// Secure random string generation
export const generateSecureRandomString = (length: number = 32): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => chars[byte % chars.length]).join('');
};

// Session management
export class SessionManager {
  private static readonly SESSION_KEY = 'app_session';
  private static readonly CSRF_KEY = 'csrf_token';

  static setSession(data: Record<string, any>): void {
    try {
      const sessionData = {
        ...data,
        timestamp: Date.now(),
        csrfToken: generateCSRFToken()
      };
      
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        sessionStorage.setItem(this.CSRF_KEY, sessionData.csrfToken);
      }
    } catch (error) {
      logger.error('Failed to set session', error as Error);
    }
  }

  static getSession(): Record<string, any> | null {
    try {
      if (typeof window !== 'undefined') {
        const data = sessionStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : null;
      }
    } catch (error) {
      logger.error('Failed to get session', error as Error);
    }
    return null;
  }

  static clearSession(): void {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(this.SESSION_KEY);
        sessionStorage.removeItem(this.CSRF_KEY);
      }
    } catch (error) {
      logger.error('Failed to clear session', error as Error);
    }
  }

  static getCSRFToken(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem(this.CSRF_KEY);
      }
    } catch (error) {
      logger.error('Failed to get CSRF token', error as Error);
    }
    return null;
  }

  static validateSession(): boolean {
    const session = this.getSession();
    if (!session) return false;

    // Check if session is expired (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    const isExpired = Date.now() - session.timestamp > maxAge;
    
    if (isExpired) {
      this.clearSession();
      return false;
    }

    return true;
  }
}

// Environment variable validation
export const validateEnvironmentVariables = (): void => {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    const error = new Error(`Missing required environment variables: ${missing.join(', ')}`);
    logger.error('Environment validation failed', error);
    throw error;
  }

  // Validate URL format
  try {
    new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
  } catch {
    const error = new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format');
    logger.error('Environment validation failed', error);
    throw error;
  }
};

// Security headers for API routes
export const getSecurityHeaders = (): Record<string, string> => {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': Object.entries(CSP_DIRECTIVES)
      .map(([key, values]) => `${key} ${values.join(' ')}`)
      .join('; ')
  };
};