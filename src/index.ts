import 'dotenv/config';
import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { env } from '@/config/env';
import { logger } from './utils/logger';
import { httpLoggingHook, errorLoggingHook } from './middleware/logging';

import healthRoutes from '@/modules/users/routes/health';
import authRoutes from './modules/users/routes/auth.routes';
import { UserRoutes } from './modules/users/routes/user.routes';
import { RoleRoutes } from './modules/roles/routes/role.routes';

const PORT = env.PORT;
const HOST = env.HOST;

const server: FastifyInstance = Fastify({
  logger: {
    transport: env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'HH:MM:ss Z', ignore: 'pid,hostname' },
        }
      : undefined,
    level: env.LOG_LEVEL,
  },
});

async function buildServer(): Promise<FastifyInstance> {
  await server.register(helmet);

  await server.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  await server.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute', 
    errorResponseBuilder: () => {
      return {
        error: {
          message: 'Too many requests, please try again later.',
          statusCode: 429,
        },
      };
    },
  });

  server.addHook('preHandler', httpLoggingHook);
  server.setErrorHandler(errorLoggingHook);

  const API_PREFIX = "/api/v1";

  await server.register(healthRoutes, { prefix: `${API_PREFIX}/health` });
  await server.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
  await server.register(UserRoutes, { prefix: `${API_PREFIX}/users` });
  await server.register(RoleRoutes, { prefix: `${API_PREFIX}/roles` });

  server.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: {
        message: 'Route not found',
        statusCode: 404,
        path: request.url,
        method: request.method,
      },
    });
  });

  return server;
}

async function start() {
  try {
    const app = await buildServer();
    await app.listen({ port: PORT, host: HOST });
    logger.info(`Server listening on http://${HOST}:${PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

const shutdown = async (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  try {
    await server.close();
    logger.info('Server closed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

if (require.main === module) {
  start();
}

export { buildServer };
