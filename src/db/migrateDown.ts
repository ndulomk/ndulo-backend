import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

const runMigrateDown = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in .env file');
  }

  const connection = postgres(databaseUrl, { max: 1 });

  try {
    console.log('Running DOWN migrations...');

    const migrationsDir = path.resolve(__dirname, '../../drizzle');
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('_down.sql'))
      .sort()
      .reverse();

    for (const file of files) {
      console.log(`Applying rollback: ${file}`);
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      await connection.unsafe(sql);
    }

    console.log('All DOWN migrations applied successfully!');
  } catch (err) {
    console.error('Migration DOWN failed:', err);
    process.exit(1);
  } finally {
    await connection.end();
  }
};

runMigrateDown().catch((err) => {
  console.error(err);
  process.exit(1);
});
