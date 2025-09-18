import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  inet,
  jsonb,
  numeric,
  date,
  primaryKey,
} from 'drizzle-orm/pg-core';

// Tabela roles
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  nome: varchar('nome', { length: 100 }).unique().notNull(),
  descricao: text('descricao'),
  permissions: jsonb('permissions'),
  ativo: boolean('ativo').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Tabela usuarios
export const usuarios = pgTable('usuarios', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  username: varchar('username', { length: 100 }).unique().notNull(),
  nomeCompleto: varchar('nome_completo', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  password: text('password').notNull(),
  roleId: uuid('role_id').references(() => roles.id, { onDelete: 'set null' }),
  ativo: boolean('ativo').default(true),
  ultimoLogin: timestamp('ultimo_login'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});


// Tabela sessoes_usuarios
export const sessoesUsuarios = pgTable('sessoes_usuarios', {
  id: uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  userId: uuid('user_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  ipAddress: inet('ip_address'),
  userAgent: text('user_agent'),
  deviceInfo: jsonb('device_info'),
  createdAt: timestamp('created_at').defaultNow(),
  ultimaAtividadeEm: timestamp('ultima_atividade_em').defaultNow(),
  expiresAt: timestamp('expires_at').notNull(),
});

export const rolesRelations = relations(roles, ({ many }) => ({
  usuarios: many(usuarios),
}));

export const usuariosRelations = relations(usuarios, ({ many, one }) => ({
  sessoes: many(sessoesUsuarios),
  role: one(roles, { fields: [usuarios.roleId], references: [roles.id] }),
}));

export const sessoesUsuariosRelations = relations(sessoesUsuarios, ({ one }) => ({
  usuario: one(usuarios, { fields: [sessoesUsuarios.userId], references: [usuarios.id] }),
}));