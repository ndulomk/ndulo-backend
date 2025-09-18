import { UserDbRow, UserResponseType, UserResponseWithPassword } from "@/modules/users/types/user.types";

export class User implements UserResponseWithPassword {
  id: string;
  username: string;
  nomeCompleto: string;
  email: string;
  password: string;
  roleId: string;
  ativo: boolean;
  ultimoLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: UserDbRow) {
    this.id = data.id;
    this.username = data.username;
    this.nomeCompleto = data.nome_completo;
    this.email = data.email;
    this.password = data.password;
    this.roleId = data.role_id;
    this.ativo = data.ativo;
    this.ultimoLogin = data.ultimo_login;
    this.createdAt = data.created_at;
    this.updatedAt = data.updated_at;
  }

  toJSON(): UserResponseType {
    const { password, ...userData } = this;
    return userData;
  }
}

export default User;
