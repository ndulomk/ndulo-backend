import { afterAll, beforeAll, afterEach } from 'vitest';
import db from '../config/database';
import { Pool } from 'pg';

export const testPool = new Pool({
  user: process.env.TEST_DB_USER,
  host: process.env.TEST_DB_HOST,
  database: process.env.TEST_DB_DATABASE ,
  password: process.env.TEST_DB_PASSWORD,
  port: Number(process.env.TEST_DB_PORT),
});

beforeAll(async () => {
  await testPool.connect();
  (db as any).pool = testPool; 
  await db.query(`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    -- Função para gerar UUID v7
    CREATE OR REPLACE FUNCTION uuid_generate_v7()
    RETURNS uuid
    LANGUAGE plpgsql
    AS $$
    DECLARE
        unix_ts_ms bigint;
        uuid_bytes bytea;
    BEGIN
        unix_ts_ms := (extract(epoch from clock_timestamp()) * 1000)::bigint;
        uuid_bytes := overlay(gen_random_bytes(16)
                      placing substring(int8send(unix_ts_ms), 3, 6)
                      from 1 for 6);
        uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112); -- version 7
        uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128); -- variant 10
        return encode(uuid_bytes, 'hex')::uuid;
    END
    $$;
  `);
}, 120000);

afterEach(async () => {
  await db.query(`
    TRUNCATE TABLE sessoes_usuarios RESTART IDENTITY CASCADE;
    TRUNCATE TABLE usuarios RESTART IDENTITY CASCADE;
  `);
});

afterAll(async () => {
  try {
    await testPool.end();
  } catch (error) {
    console.error('Failed to close test pool:', error);
  }
}, 30000);