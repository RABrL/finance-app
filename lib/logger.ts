interface LogPayload {
  message: string;
  data?: unknown;
  error?: Error;
}

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const COLORS = {
  info: '\x1b[36m',    // Cyan
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[90m',   // Gray
  reset: '\x1b[0m',    // Reset
} as const;

export class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV !== 'production';
  private logToFile = process.env.LOG_TO_FILE === 'true';
  private logFilePath = process.env.LOG_FILE_PATH || 'app.log';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatMessage(level: LogLevel, { message, data, error }: LogPayload): string {
    const timestamp = new Date().toISOString();
    const color = COLORS[level];
    const reset = COLORS.reset;

    let logMessage = `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}`;

    if (data) {
      logMessage += `\nData: ${JSON.stringify(data, null, 2)}`;
    }

    if (error) {
      logMessage += `\nError: ${error.message}`;
      if (this.isDevelopment && error.stack) {
        logMessage += `\nStack: ${error.stack}`;
      }
    }

    return logMessage;
  }

  private log(level: LogLevel, payload: LogPayload): void {
    const formattedMessage = this.formatMessage(level, payload);
    
    // Console output
    console[level](formattedMessage);
    
    // File output if enabled
    // this.writeToFile(formattedMessage);
  }

  info(message: string, data?: unknown): void {
    this.log('info', { message, data });
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', { message, data });
  }

  error(message: string, error?: Error, data?: unknown): void {
    this.log('error', { message, error, data });
  }

  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      this.log('debug', { message, data });
    }
  }
}

// Exportar una instancia única del logger
export const logger = Logger.getInstance();