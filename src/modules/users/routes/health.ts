import db from '@/config/database';
import { FastifyInstance } from 'fastify';

export default async function healthRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    try {
      const dbOk = await checkDatabase();
      
      return {
        status: dbOk ? 'ok' : 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: dbOk ? 'connected' : 'disconnected'
      };
    } catch {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'disconnected'
      };
    }
  });

  fastify.get('/live', async () => {
    return { status: 'alive' };
  });

  fastify.get('/ready', async () => {
    const dbOk = await checkDatabase();
    
    if (!dbOk) {
      throw new Error('Database not ready');
    }
    
    return { status: 'ready' };
  });
}

async function checkDatabase(): Promise<boolean> {
  try {
    await db.query('SELECT 1');
    return true;
  } catch {
    return false;
  }
}