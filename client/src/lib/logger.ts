/**
 * Logging utility for environment-specific logging
 * Automatically disables logs in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

const isDevelopment = import.meta.env.DEV;

class Logger {
  private module: string;

  constructor(module: string) {
    this.module = module;
  }

  private formatMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.module}] ${level.toUpperCase()}: ${message}`;
  }

  log(message: string, data?: unknown) {
    if (isDevelopment) {
      console.log(this.formatMessage('log', message), data !== undefined ? data : '');
    }
  }

  info(message: string, data?: unknown) {
    if (isDevelopment) {
      console.info(this.formatMessage('info', message), data !== undefined ? data : '');
    }
  }

  warn(message: string, data?: unknown) {
    if (isDevelopment) {
      console.warn(this.formatMessage('warn', message), data !== undefined ? data : '');
    }
  }

  error(message: string, error?: unknown) {
    // Always log errors, even in production
    console.error(this.formatMessage('error', message), error !== undefined ? error : '');
  }

  debug(message: string, data?: unknown) {
    if (isDevelopment) {
      console.debug(this.formatMessage('debug', message), data !== undefined ? data : '');
    }
  }
}

/**
 * Create a logger instance for a specific module
 * @param module - Module name (e.g., 'Firebase Auth', 'API', 'UI')
 */
export function createLogger(module: string): Logger {
  return new Logger(module);
}

// Pre-configured loggers for common modules
export const authLogger = createLogger('Auth');
export const apiLogger = createLogger('API');
export const uiLogger = createLogger('UI');
