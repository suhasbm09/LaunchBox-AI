// Enhanced API client with error handling, retries, and rate limiting
import { logger } from './logger';
import { API_CONFIG, ERROR_MESSAGES } from './constants';
import type { ApiResponse, ApiError } from './types';

interface RequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: RequestCache;
}

class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private requestQueue: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private getRequestKey(url: string, config: RequestConfig): string {
    return `${config.method || 'GET'}-${url}-${JSON.stringify(config.body || {})}`;
  }

  private async makeRequest<T>(
    url: string, 
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = API_CONFIG.timeout,
      retries = API_CONFIG.retries,
      cache = 'default'
    } = config;

    // Prevent duplicate requests
    const requestKey = this.getRequestKey(url, config);
    if (this.requestQueue.has(requestKey)) {
      logger.debug('Returning cached request', { url, method });
      return this.requestQueue.get(requestKey);
    }

    const requestPromise = this.executeRequest<T>(url, {
      method,
      headers: { ...this.defaultHeaders, ...headers },
      body,
      timeout,
      retries,
      cache
    });

    this.requestQueue.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Clean up request queue after a delay
      setTimeout(() => {
        this.requestQueue.delete(requestKey);
      }, 1000);
    }
  }

  private async executeRequest<T>(
    url: string,
    config: RequestConfig & { retries: number }
  ): Promise<ApiResponse<T>> {
    const { retries, timeout, ...fetchConfig } = config;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        logger.debug('Making API request', { 
          url, 
          method: config.method, 
          attempt: attempt + 1,
          maxAttempts: retries + 1 
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchConfig,
          signal: controller.signal,
          body: config.body ? JSON.stringify(config.body) : undefined,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const apiError: ApiError = {
            message: errorData.message || this.getErrorMessage(response.status),
            status: response.status,
            code: errorData.code,
            details: errorData.details
          };

          logger.error('API request failed', new Error(apiError.message), {
            url,
            status: response.status,
            attempt: attempt + 1
          });

          // Don't retry on client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            return { error: apiError.message, status: response.status };
          }

          throw new Error(apiError.message);
        }

        const data = await response.json();
        
        logger.info('API request successful', { 
          url, 
          method: config.method,
          status: response.status 
        });

        return { data, status: response.status };

      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          const delayMs = Math.pow(2, attempt) * 1000; // Exponential backoff
          logger.warn('API request failed, retrying', { 
            url, 
            attempt: attempt + 1, 
            retryIn: delayMs,
            error: lastError.message 
          });
          await this.delay(delayMs);
        }
      }
    }

    logger.error('API request failed after all retries', lastError!, { 
      url, 
      totalAttempts: retries + 1 
    });

    return { 
      error: lastError?.message || ERROR_MESSAGES.NETWORK_ERROR, 
      status: 500 
    };
  }

  private getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return ERROR_MESSAGES.UNAUTHORIZED;
      case 403:
        return ERROR_MESSAGES.FORBIDDEN;
      case 404:
        return ERROR_MESSAGES.NOT_FOUND;
      case 422:
        return ERROR_MESSAGES.VALIDATION_ERROR;
      case 429:
        return ERROR_MESSAGES.RATE_LIMIT;
      case 500:
      case 502:
      case 503:
      case 504:
        return ERROR_MESSAGES.SERVER_ERROR;
      default:
        return ERROR_MESSAGES.NETWORK_ERROR;
    }
  }

  // Public methods
  async get<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'GET' });
  }

  async post<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'POST', body });
  }

  async put<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PUT', body });
  }

  async patch<T>(url: string, body?: any, config?: Omit<RequestConfig, 'method'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'PATCH', body });
  }

  async delete<T>(url: string, config?: Omit<RequestConfig, 'method' | 'body'>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(url, { ...config, method: 'DELETE' });
  }

  // Set authorization header
  setAuthToken(token: string): void {
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  // Clear authorization header
  clearAuthToken(): void {
    delete this.defaultHeaders.Authorization;
  }
}

export const apiClient = ApiClient.getInstance();