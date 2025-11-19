/**
 * Production-ready logging utility
 * Removes console.logs in production build
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: unknown;
  timestamp: string;
  error?: Error;
}

class Logger {
  private isProduction: boolean;
  private isDevelopment: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.isDevelopment = import.meta.env.DEV;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown, error?: Error): LogEntry {
    return {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date().toISOString(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined,
      } as Error : undefined,
    };
  }

  private sanitizeData(data: unknown): unknown {
    if (!data) return data;
    
    // Remove sensitive information
    const dataStr = JSON.stringify(data);
    const sensitiveKeys = ['password', 'token', 'auth', 'authorization', 'secret', 'key'];
    
    let sanitized = dataStr;
    sensitiveKeys.forEach(key => {
      const regex = new RegExp(`"${key}":\\s*"[^"]*"`, 'gi');
      sanitized = sanitized.replace(regex, `"${key}": "***"`);
    });
    
    try {
      return JSON.parse(sanitized);
    } catch {
      return data;
    }
  }

  private logToExternalService(entry: LogEntry): void {
    // In production, send errors to external logging service
    if (this.isProduction && entry.level === 'error') {
      // TODO: Integrate with error logging service (e.g., Sentry, LogRocket, etc.)
      // Example:
      // if (window.Sentry) {
      //   window.Sentry.captureException(entry.error || new Error(entry.message), {
      //     extra: entry.data,
      //   });
      // }
    }
  }

  debug(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    this.formatMessage('debug', message, data);
    console.debug(`[DEBUG] ${message}`, data || '');
  }

  info(message: string, data?: unknown): void {
    if (!this.isDevelopment) return;
    this.formatMessage('info', message, data);
    console.info(`[INFO] ${message}`, data || '');
  }

  warn(message: string, data?: unknown): void {
    const entry = this.formatMessage('warn', message, data);
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '');
    }
    this.logToExternalService(entry);
  }

  error(message: string, error?: Error | unknown, data?: unknown): void {
    const err = error instanceof Error ? error : new Error(String(error));
    const entry = this.formatMessage('error', message, data, err);
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, err, data || '');
    } else {
      // In production, only log to external service
      this.logToExternalService(entry);
    }
  }
}

export const logger = new Logger();










