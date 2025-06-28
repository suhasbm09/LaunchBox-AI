// Performance monitoring and optimization utilities
import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  context?: Record<string, any>;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private observers: PerformanceObserver[] = [];

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeObservers();
    }
  }

  private initializeObservers(): void {
    try {
      // Observe navigation timing
      if ('PerformanceObserver' in window) {
        const navObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('navigation', entry.duration, {
              type: entry.entryType,
              name: entry.name
            });
          }
        });
        navObserver.observe({ entryTypes: ['navigation'] });
        this.observers.push(navObserver);

        // Observe resource loading
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('resource', entry.duration, {
              type: entry.entryType,
              name: entry.name,
              size: (entry as any).transferSize
            });
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.push(resourceObserver);

        // Observe largest contentful paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('lcp', entry.startTime, {
              element: (entry as any).element?.tagName
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);

        // Observe first input delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('fid', (entry as any).processingStart - entry.startTime);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.push(fidObserver);
      }
    } catch (error) {
      logger.warn('Failed to initialize performance observers', { error });
    }
  }

  recordMetric(name: string, value: number, context?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      context
    };

    this.metrics.push(metric);
    
    // Log significant performance issues
    if (this.isSignificantMetric(metric)) {
      logger.warn('Performance issue detected', { metric });
    }

    // Keep only recent metrics (last 100)
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  private isSignificantMetric(metric: PerformanceMetric): boolean {
    switch (metric.name) {
      case 'lcp':
        return metric.value > 2500; // LCP > 2.5s
      case 'fid':
        return metric.value > 100; // FID > 100ms
      case 'navigation':
        return metric.value > 3000; // Navigation > 3s
      case 'resource':
        return metric.value > 1000; // Resource load > 1s
      default:
        return false;
    }
  }

  // Measure function execution time
  measureFunction<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      const result = fn();
      const duration = performance.now() - start;
      this.recordMetric(`function:${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`function:${name}:error`, duration);
      throw error;
    }
  }

  // Measure async function execution time
  async measureAsyncFunction<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.recordMetric(`async:${name}`, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.recordMetric(`async:${name}:error`, duration);
      throw error;
    }
  }

  // Get performance summary
  getSummary(): Record<string, any> {
    const summary: Record<string, any> = {};
    
    for (const metric of this.metrics) {
      if (!summary[metric.name]) {
        summary[metric.name] = {
          count: 0,
          total: 0,
          min: Infinity,
          max: -Infinity,
          avg: 0
        };
      }
      
      const stats = summary[metric.name];
      stats.count++;
      stats.total += metric.value;
      stats.min = Math.min(stats.min, metric.value);
      stats.max = Math.max(stats.max, metric.value);
      stats.avg = stats.total / stats.count;
    }
    
    return summary;
  }

  // Clear metrics
  clear(): void {
    this.metrics = [];
  }

  // Cleanup observers
  destroy(): void {
    for (const observer of this.observers) {
      observer.disconnect();
    }
    this.observers = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Performance hooks for React components
export const usePerformanceMonitor = (componentName: string) => {
  const measureRender = () => {
    performanceMonitor.recordMetric(`render:${componentName}`, performance.now());
  };

  const measureFunction = <T>(name: string, fn: () => T): T => {
    return performanceMonitor.measureFunction(`${componentName}:${name}`, fn);
  };

  const measureAsyncFunction = <T>(name: string, fn: () => Promise<T>): Promise<T> => {
    return performanceMonitor.measureAsyncFunction(`${componentName}:${name}`, fn);
  };

  return {
    measureRender,
    measureFunction,
    measureAsyncFunction
  };
};

// Memory usage monitoring
export const getMemoryUsage = (): Record<string, number> | null => {
  if (typeof window !== 'undefined' && 'memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }
  return null;
};

// Bundle size analyzer
export const analyzeBundleSize = (): void => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
    
    logger.info('Bundle analysis', {
      scriptCount: scripts.length,
      styleCount: styles.length,
      scripts: scripts.map(s => (s as HTMLScriptElement).src),
      styles: styles.map(s => (s as HTMLLinkElement).href)
    });
  }
};