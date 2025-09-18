import { beforeAll, afterAll } from 'vitest';
import { Pool } from 'pg';
import db from '@/config/database';

export const testPool = new Pool({
  user: process.env.TEST_DB_USER,
  host: process.env.TEST_DB_HOST,
  database: process.env.TEST_DB_DATABASE,
  password: process.env.TEST_DB_PASSWORD,
  port: Number(process.env.TEST_DB_PORT),
});

beforeAll(async () => {
  await testPool.connect();
  (db as any).pool = testPool;

  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `);
}, 30000);

afterAll(async () => {
  await testPool.end();
}, 30000);
