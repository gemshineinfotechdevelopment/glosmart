import winston from 'winston';
import 'winston-daily-rotate-file';

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message, ...meta }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

// Configure Winston to redact sensitive info
const redactSensitive = winston.format((info) => {
  if (info.meta && typeof info.meta === 'object') {
    const redactedMeta = { ...info.meta };
    const sensitiveKeys = ['password', 'token', 'cardNumber', 'session', 'jwt', 'apiKey'];
    
    // Deep clone and redact
    const redact = (obj) => {
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          obj[key] = redact(obj[key]);
        } else if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[REDACTED]';
        }
      }
      return obj;
    };
    
    info.meta = redact(redactedMeta);
  }
  return info;
});

// Create rotating file transport for all logs (info and above)
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/access-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  level: 'info'
});

// Create rotating file transport specifically for errors
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'logs/error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  level: 'error'
});

// Configure base logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    redactSensitive(),
    process.env.NODE_ENV === 'production' 
      ? winston.format.json() // Structured JSON logs for Render
      : logFormat
  ),
  defaultMeta: { service: 'glosmart-backend' },
  transports: [
    fileRotateTransport,
    errorRotateTransport
  ]
});

// If not in production, also log to console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    )
  }));
}

export default logger;
