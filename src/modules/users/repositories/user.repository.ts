import db from "@/config/database";
import { QueryRequest } from "@/types/query.types";
import {
  CreateUserInput,
  UpdateUserInput,
} from "@/modules/users/schemas/user.schema";
import {
  UserResponseType,
  UserResponseWithPassword,
  UserDbRow,
} from "@/modules/users/types/user.types";
import User from "@/modules/users/models/user.model";


export const UserRepository = {
  async create(
    userData: CreateUserInput & { password: string }
  ): Promise<string> {
    const query = `
      INSERT INTO usuarios (username, nome_completo, email, password, role_id, ativo)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `;
    const values = [
      userData.username,
      userData.nomeCompleto,
      userData.email,
      userData.password,
      userData.roleId,
      userData.ativo || true,
    ];

    const result = await db.query(query, values);
    if (!result.rows[0]) {
      throw new Error("A criação do usuário falhou, nenhum ID retornado.");
    }
    return result.rows[0].id;
  },

  async findById(id: string): Promise<UserResponseType | null> {
    const result = await db.query("SELECT * FROM usuarios WHERE id = $1", [id]);
    return result.rows[0] ? new User(result.rows[0]).toJSON() : null;
  },

  async findByEmail(email: string): Promise<UserResponseType | null> {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    return result.rows[0] ? new User(result.rows[0]).toJSON() : null;
  },

  async findByEmailWithPassword(
    email: string
  ): Promise<UserResponseWithPassword | null> {
    const result = await db.query("SELECT * FROM usuarios WHERE email = $1", [
      email,
    ]);
    return result.rows[0] ? new User(result.rows[0]) : null;
  },

  async findByUsername(username: string): Promise<UserResponseType | null> {
    const result = await db.query(
      "SELECT * FROM usuarios WHERE username = $1",
      [username]
    );
    return result.rows[0] ? new User(result.rows[0]).toJSON() : null;
  },

  async getAll({
    page,
    limit,
    search,
  }: QueryRequest): Promise<{ data: UserResponseType[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = `SELECT * FROM usuarios`;
    let countQuery = `SELECT COUNT(*) AS total FROM usuarios`;
    const values: (string | number)[] = [];

    if (search) {
      const searchQuery = ` WHERE username ILIKE $1 OR email ILIKE $1 OR nome_completo ILIKE $1`;
      query += searchQuery;
      countQuery += searchQuery;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [result, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const items = result.rows.map((row) => new User(row).toJSON());
    return { data: items, total };
  },

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<UpdateUserInput>;
  }): Promise<UserResponseType> {
    const values: (string | number | boolean | Date | null)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<keyof UpdateUserInput, string> = {
      username: "username",
      nomeCompleto: "nome_completo",
      email: "email",
      roleId: "role_id",
      ativo: "ativo",
    };

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const mappedKey = key as keyof UpdateUserInput;
        const column = fieldMapping[mappedKey];
        if (column) {
          fields.push(`${column} = $${counter++}`);
          values.push(data[mappedKey] as any);
        }
      }
    }

    fields.push(`updated_at = $${counter++}`);
    values.push(new Date());

    values.push(id);
    const query = `UPDATE usuarios SET ${fields.join(", ")} WHERE id = $${counter} RETURNING *`;

    const result = await db.query(query, values);
    return new User(result.rows[0]).toJSON();
  },

  async updateLastLogin(id: string): Promise<void> {
    const query = `UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1`;
    await db.query(query, [id]);
  },

  async delete(id: string): Promise<void> {
    await db.query(`DELETE FROM usuarios WHERE id = $1`, [id]);
  },
};
