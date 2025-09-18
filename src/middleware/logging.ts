import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { logHttpRequest, logError } from '../utils/logger';
import { DomainException } from '../utils/domain';

export const httpLoggingHook = (
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
) => {
  const start = Date.now();
  
  request.log.info({
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
  }, 'Request started');

  reply.raw.on('finish', () => {
    const responseTime = Date.now() - start;
    logHttpRequest(request, reply, responseTime);
    
    request.log.info({
      statusCode: reply.statusCode,
      responseTime: `${responseTime}ms`,
    }, 'Request completed');
  });

  done();
};

export const errorLoggingHook = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const context = {
    method: request.method,
    url: request.url,
    ip: request.ip,
    userAgent: request.headers['user-agent'],
    body: request.body,
    params: request.params,
    query: request.query,
  };

  logError(error, context);
  
  // Log to request logger as well
  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      name: error.name,
    },
    context,
  }, 'Request error occurred');

  // Determine status code based on error type
  let statusCode = 500;
  let errorMessage = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : error.message;

  if (error instanceof DomainException) {
    statusCode = error.getStatusCode();
    errorMessage = error.message;
    reply.status(statusCode).send({
      error: {
        message: errorMessage,
        statusCode,
        code: error.code,
        component: error.component,
        timestamp: error.timestamp
      },
    });
    return;
  }

  if (error.name === 'ValidationError' || error.name === 'ZodError') statusCode = 422;
  if (error.name === 'UnauthorizedError') statusCode = 401;
  if (error.name === 'ForbiddenError') statusCode = 403;
  if (error.name === 'NotFoundError') statusCode = 404;

  reply.status(statusCode).send({
    error: {
      message: errorMessage,
      statusCode,
    },
  });
};