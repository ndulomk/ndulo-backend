import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

// Create custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta,
    });
  })
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.simple(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length
      ? JSON.stringify(meta, null, 2)
      : "";
    return `${timestamp} [${level}]: ${message} ${metaStr}`;
  })
);

// HTTP Requests transport
const httpTransport = new DailyRotateFile({
  filename: path.join(logDir, "http", "http-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || "20m",
  maxFiles: process.env.LOG_MAX_FILES || "14d",
  format: logFormat,
  level: "info",
});

// Error transport
const errorTransport = new DailyRotateFile({
  filename: path.join(logDir, "errors", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || "20m",
  maxFiles: process.env.LOG_MAX_FILES || "14d",
  format: logFormat,
  level: "error",
});

// General application transport
const appTransport = new DailyRotateFile({
  filename: path.join(logDir, "app", "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || "20m",
  maxFiles: process.env.LOG_MAX_FILES || "14d",
  format: logFormat,
});

// Database transport
const dbTransport = new DailyRotateFile({
  filename: path.join(logDir, "database", "db-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: process.env.LOG_MAX_SIZE || "20m",
  maxFiles: process.env.LOG_MAX_FILES || "14d",
  format: logFormat,
});

// Main logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    appTransport,
    ...(process.env.NODE_ENV === "development"
      ? [
          new winston.transports.Console({
            format: consoleFormat,
          }),
        ]
      : []),
  ],
});

// HTTP Logger
export const httpLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [httpTransport],
});

// Error Logger
export const errorLogger = winston.createLogger({
  level: "error",
  format: logFormat,
  transports: [errorTransport],
});

// Database Logger
export const dbLogger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [dbTransport],
});

// Log HTTP requests
export const logHttpRequest = (
  request: any,
  reply: any,
  responseTime: number
) => {
  const logData = {
    method: request.method,
    url: request.url,
    statusCode: reply.statusCode,
    responseTime: `${responseTime}ms`,
    userAgent: request.headers["user-agent"],
    ip: request.ip,
    timestamp: new Date().toISOString(),
  };

  httpLogger.info("HTTP Request", logData);
};

// Log errors with context
export const logError = (error: Error, context?: Record<string, any>) => {
  errorLogger.error("Application Error", {
    message: error.message,
    stack: error.stack,
    name: error.name,
    context,
    timestamp: new Date().toISOString(),
  });
};

// Log database operations
export const logDbOperation = (
  operation: string,
  query: string,
  duration?: number,
  error?: Error
) => {
  const logData = {
    operation,
    query: query.substring(0, 500), // Truncate long queries
    duration: duration ? `${duration}ms` : undefined,
    error: error ? { message: error.message, stack: error.stack } : undefined,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    dbLogger.error(`Database Error on ${operation}`, logData);
  } else {
    dbLogger.info(`Database Operation: ${operation}`, logData);
  }
};
