import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import bcrypt from 'bcrypt';
import * as schema from './schema';

const runSeed = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not defined in .env file');
  }

  const connection = postgres(databaseUrl, { max: 1 });
  const db = drizzle(connection, { schema });

  console.log('Starting seed...');

  // Seed role
  const [role] = await db
    .insert(schema.roles)
    .values({
      nome: 'admin',
      descricao: 'Administrador do sistema',
      permissions: { all: true },
    })
    .returning();

  console.log('Role criada:', role.nome);

  // Seed usuario
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const [usuario] = await db
    .insert(schema.usuarios)
    .values({
      username: 'admin',
      nomeCompleto: 'Administrador do Sistema',
      email: 'admin@gmail.ao',
      password: hashedPassword,
      roleId: role.id,
    })
    .returning();

  console.log('Usuário admin criado:', usuario.username);

  console.log('Seeding completed successfully!');
  await connection.end();
  process.exit(0);
};

runSeed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});