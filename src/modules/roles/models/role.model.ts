import { RoleDbRow, RoleType } from "../types/role.types";

export class Role {
  id: string;
  nome: string;
  descricao?: string;
  permissions: string[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
  constructor(data: RoleDbRow){
    this.id = data.id;
    this.nome = data.nome;
    this.descricao = data.descricao;
    this.permissions = data.permissions;
    this.ativo = data.ativo;
    this.createdAt = new Date(data.created_at);
    this.updatedAt = new Date(data.updated_at);
  }
  toJSON(): RoleType {
    return {
      id: this.id,
      nome: this.nome,
      descricao: this.descricao,
      permissions: this.permissions,
      ativo: this.ativo,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}