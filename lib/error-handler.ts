// Centralized error handling system
import { logger } from './logger';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from './constants';
import type { ApiError } from './types';

export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    status: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 'VALIDATION_ERROR', 400, true, context);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.UNAUTHORIZED) {
    super(message, 'AUTHENTICATION_ERROR', 401, true);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = ERROR_MESSAGES.FORBIDDEN) {
    super(message, 'AUTHORIZATION_ERROR', 403, true);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NOT_FOUND) {
    super(message, 'NOT_FOUND_ERROR', 404, true);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = ERROR_MESSAGES.RATE_LIMIT) {
    super(message, 'RATE_LIMIT_ERROR', 429, true);
    this.name = 'RateLimitError';
  }
}

export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES.NETWORK_ERROR) {
    super(message, 'NETWORK_ERROR', 0, true);
    this.name = 'NetworkError';
  }
}

// Error handler class
class ErrorHandler {
  private static instance: ErrorHandler;

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  handleError(error: Error | AppError, showToast: boolean = true): void {
    // Log the error
    if (error instanceof AppError) {
      logger.error(error.message, error, {
        code: error.code,
        status: error.status,
        context: error.context,
        isOperational: error.isOperational
      });
    } else {
      logger.error('Unexpected error occurred', error);
    }

    // Show user-friendly message
    if (showToast) {
      this.showUserMessage(error);
    }

    // Report to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error);
    }
  }

  private showUserMessage(error: Error | AppError): void {
    let message: string = ERROR_MESSAGES.SERVER_ERROR;
    let variant: 'default' | 'destructive' = 'destructive';

    if (error instanceof AppError && error.isOperational) {
      message = error.message;
      
      // Use different toast variants based on error type
      if (error instanceof ValidationError) {
        variant = 'default';
      }
    }

    toast.error(message, {
      description: this.getErrorDescription(error),
      duration: 5000,
    });
  }

  private getErrorDescription(error: Error | AppError): string {
    if (error instanceof AppError) {
      switch (error.code) {
        case 'AUTHENTICATION_ERROR':
          return 'Please log in to continue.';
        case 'AUTHORIZATION_ERROR':
          return 'Contact support if you believe this is an error.';
        case 'VALIDATION_ERROR':
          return 'Please check your input and try again.';
        case 'RATE_LIMIT_ERROR':
          return 'Please wait a moment before trying again.';
        case 'NETWORK_ERROR':
          return 'Check your internet connection and try again.';
        default:
          return 'If the problem persists, please contact support.';
      }
    }
    return 'An unexpected error occurred. Please try again.';
  }

  private async reportError(error: Error | AppError): Promise<void> {
    try {
      // Report to external error tracking service
      // Example: Sentry, Bugsnag, or custom endpoint
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Sentry integration would go here
      }
    } catch (reportingError) {
      logger.error('Failed to report error to external service', reportingError);
    }
  }

  // Convert API errors to AppErrors
  fromApiError(apiError: ApiError): AppError {
    const { message, code, status = 500, details } = apiError;

    switch (status) {
      case 400:
        return new ValidationError(message, details);
      case 401:
        return new AuthenticationError(message);
      case 403:
        return new AuthorizationError(message);
      case 404:
        return new NotFoundError(message);
      case 429:
        return new RateLimitError(message);
      default:
        return new AppError(message, code, status, true, details);
    }
  }

  // Async error boundary
  async handleAsyncError<T>(
    operation: () => Promise<T>,
    fallback?: T,
    showToast: boolean = true
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error as Error, showToast);
      return fallback;
    }
  }

  // Sync error boundary
  handleSyncError<T>(
    operation: () => T,
    fallback?: T,
    showToast: boolean = true
  ): T | undefined {
    try {
      return operation();
    } catch (error) {
      this.handleError(error as Error, showToast);
      return fallback;
    }
  }
}

export const errorHandler = ErrorHandler.getInstance();

// React error boundary hook
export const useErrorHandler = () => {
  return {
    handleError: errorHandler.handleError.bind(errorHandler),
    handleAsyncError: errorHandler.handleAsyncError.bind(errorHandler),
    handleSyncError: errorHandler.handleSyncError.bind(errorHandler),
  };
};

// Global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleError(new Error(event.reason), false);
    event.preventDefault();
  });

  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    errorHandler.handleError(event.error, false);
  });
}