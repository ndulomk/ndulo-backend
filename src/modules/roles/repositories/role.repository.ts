import db from "@/config/database";
import { CreateRoleInput } from "../schemas/role.schema";
import { RoleType } from "../types/role.types";
import { Role } from "../models/role.model";
import { QueryRequest } from "@/types/query.types";

export const RoleRepository = {
  async create(data: CreateRoleInput): Promise<string> {
    const query = `INSERT INTO roles (nome, descricao, permissions, ativo) VALUES ($1, $2, $3, $4) RETURNING id`;
    const values = [data.nome, data.descricao, data.permissions, data.ativo];
    const result = await db.query(query, values);
    return result.rows[0];
  },

  async findById(id: string): Promise<RoleType | null> {
    const result = await db.query("SELECT * FROM roles WHERE id = $1", [id]);

    if (result.rowCount === 0) {
      return null;
    }

    return new Role(result.rows[0]).toJSON();
  },

  async findAll({
    page,
    limit,
    search,
  }: QueryRequest): Promise<{ data: RoleType[]; total: number }> {
    const offset = (page - 1) * limit;
    let query = "SELECT * FROM roles";
    let countQuery = "SELECT COUNT(*) AS total FROM roles";
    const values: (string | number)[] = [];
    if (search) {
      query += ` WHERE nome ILIKE $1 OR descricao ILIKE $1`;
      countQuery += ` WHERE nome ILIKE $1 OR descricao ILIKE $1`;
      values.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
    values.push(limit, offset);

    const [result, countResult] = await Promise.all([
      db.query(query, values),
      db.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    const total = parseInt(countResult.rows[0].total, 10);
    const items = result.rows.map((row) => new Role(row).toJSON());
    return { data: items, total };
  },

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<RoleType>;
  }): Promise<RoleType> {
    const values: (string | boolean | string[] | Date)[] = [];
    const fields: string[] = [];
    let counter = 1;

    const fieldMapping: Record<string, string> = {
      nome: "nome",
      descricao: "descricao",
      permissions: "permissions",
      ativo: "ativo",
    };


    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && fieldMapping[key]) {
        fields.push(`${fieldMapping[key]} = $${counter}`);
        values.push(value);
        counter++;
      }
    }

    values.push(id);
    const query = `UPDATE roles SET ${fields.join(", ")} WHERE id = $${counter} RETURNING *`;
    const result = await db.query(query, values);
    if (!result.rows[0]) {
      throw new Error("Update failed");
    }
    return new Role(result.rows[0]).toJSON();
  },

  async delete(id: string): Promise<null> {
    await db.query("DELETE FROM roles WHERE id = $1", [id]);
    return null;
  }

};
