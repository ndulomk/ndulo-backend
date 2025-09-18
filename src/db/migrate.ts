import 'dotenv/config';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const runMigrate = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in .env file');
  }

  const connection = postgres(databaseUrl, { max: 1 });
  const db = drizzle(connection);

  try {
    console.log('Creating extensions and UUID v7 function...');

    await connection`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await connection`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    await connection`
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
        uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
        uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);
        return encode(uuid_bytes, 'hex')::uuid;
      END
      $$;
    `;

    console.log('Extensions and UUID v7 function created successfully!');

    console.log('Running migrations...');
    const start = Date.now();

    await migrate(db, { migrationsFolder: 'drizzle' });

    const end = Date.now();
    console.log(`Migrations completed in ${end - start}ms`);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

runMigrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});