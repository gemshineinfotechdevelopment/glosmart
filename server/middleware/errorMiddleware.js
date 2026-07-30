import logger from '../utils/logger.js';

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  // If the status code is 200, it's an unexpected error, so set it to 500
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode);
  
  // Log the error using Winston
  logger.error(`${statusCode} - ${err.message}`, {
    originalUrl: req.originalUrl,
    method: req.method,
    ip: req.ip,
    requestId: req.id,
    stack: err.stack
  });

  res.json({
    message: err.message,
    // Only send the stack trace in development
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};
