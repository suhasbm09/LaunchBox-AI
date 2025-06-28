// Enhanced logging system with multiple levels and structured output
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    
    // Set log level based on environment
    if (typeof window !== 'undefined') {
      this.logLevel = process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.WARN;
    }
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatLog(entry: LogEntry): string {
    const { timestamp, level, message, context, error, userId } = entry;
    const levelName = LogLevel[level];
    
    let logString = `[${timestamp}] ${levelName}: ${message}`;
    
    if (userId) {
      logString += ` | User: ${userId}`;
    }
    
    if (context && Object.keys(context).length > 0) {
      logString += ` | Context: ${JSON.stringify(context)}`;
    }
    
    if (error) {
      logString += ` | Error: ${error.message}`;
      if (error.stack) {
        logString += ` | Stack: ${error.stack}`;
      }
    }
    
    return logString;
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
      sessionId: this.sessionId,
    };

    const formattedLog = this.formatLog(entry);

    // Console output with appropriate method
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedLog);
        break;
      case LogLevel.INFO:
        console.info(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
    }

    // Send to external logging service in production
    if (process.env.NODE_ENV === 'production' && level >= LogLevel.ERROR) {
      this.sendToExternalLogger(entry);
    }
  }

  private async sendToExternalLogger(entry: LogEntry): Promise<void> {
    try {
      // Implement external logging service integration
      // Example: Sentry, LogRocket, or custom endpoint
      if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
        // Sentry integration would go here
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  debug(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  info(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.INFO, message, context);
  }

  warn(message: string, context?: Record<string, any>): void {
    this.log(LogLevel.WARN, message, context);
  }

  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  // Performance logging
  time(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.time(label);
    }
  }

  timeEnd(label: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.timeEnd(label);
    }
  }
}

export const logger = Logger.getInstance();