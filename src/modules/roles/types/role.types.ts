export interface RoleType {
  id: string;
  nome: string;
  descricao?: string;
  permissions: string[];
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoleDbRow {
  id: string;
  nome: string;
  descricao?: string;
  permissions: string[];
  ativo: boolean;
  created_at: Date;
  updated_at: Date;
}
