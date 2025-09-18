import { CreateUserInput, UpdateUserInput } from "@/modules/users/schemas/user.schema";

export interface UserDbRow {
  id: string;
  username: string;
  nome_completo: string;
  email: string;
  password: string;
  role_id: string;
  ativo: boolean;
  ultimo_login: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface UserParams {
  id: string;
}

export interface UserResponseType {
  id: string;
  username: string;
  nomeCompleto: string;
  email: string;
  roleId: string;
  ativo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponseWithPassword extends UserResponseType {
  password: string;
}

export interface CreateUserRequest {
  Body: CreateUserInput;
}

export interface UpdateUserRequest {
  Body: Partial<UpdateUserInput>;
  Params: { id: string };
}
