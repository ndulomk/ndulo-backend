import { UserRepository } from "@/modules/users/repositories/user.repository";
import {
  createUserSchema,
  updateUserSchema,
  CreateUserInput,
  UpdateUserInput,
} from "@/modules/users/schemas/user.schema";
import { QueryRequest, QueryResponse } from "@/types/query.types";
import { UserResponseType } from "@/modules/users/types/user.types";
import {
  NotFoundException,
  ValidationException,
  ConflictException,
  BadRequestException,
} from "@/utils/domain";
import { formatZodError } from "@/utils/formatZodError";
import bcrypt from "bcrypt";

export const UserService = {
  async create(data: CreateUserInput): Promise<UserResponseType> {
    const parseResult = createUserSchema.safeParse(data);
    if (!parseResult.success) {
      throw new ValidationException(
        formatZodError(parseResult.error),
        "UserService.create"
      );
    }

    if (await UserRepository.findByUsername(data.username)) {
      throw new ConflictException(
        "Nome de usuário já existe.",
        "UserService.create"
      );
    }
    if (await UserRepository.findByEmail(data.email)) {
      throw new ConflictException("Email já cadastrado.", "UserService.create");
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userId = await UserRepository.create({
      ...data,
      password: hashedPassword,
    });
    const newUser = await UserRepository.findById(userId);

    if (!newUser) {
      throw new NotFoundException(
        "Usuário não encontrado após a criação.",
        "UserService.create"
      );
    }
    return newUser;
  },

  async findById(id: string): Promise<UserResponseType> {
    if (!id)
      throw new BadRequestException(
        "O ID do usuário é obrigatório.",
        "UserService.findById"
      );

    const result = await UserRepository.findById(id);
    if (!result)
      throw new NotFoundException(
        "Usuário não encontrado.",
        "UserService.findById"
      );

    return result;
  },

  async getAll({
    page,
    limit,
    search,
  }: QueryRequest): Promise<QueryResponse<UserResponseType>> {
    if (page < 1)
      throw new BadRequestException(
        "A página deve ser maior que 0.",
        "UserService.getAll"
      );
    if (limit < 1 || limit > 100)
      throw new BadRequestException(
        "O limite deve ser entre 1 e 100.",
        "UserService.getAll"
      );

    const { data, total } = await UserRepository.getAll({
      page,
      limit,
      search,
    });
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: { page, limit, totalPages, total },
    };
  },

  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<UpdateUserInput>;
  }): Promise<UserResponseType> {
    if (!id)
      throw new BadRequestException(
        "O ID do usuário é obrigatório.",
        "UserService.update"
      );

    await this.findById(id);

    const parseResult = updateUserSchema.safeParse(data);
    if (!parseResult.success) {
      throw new ValidationException(
        formatZodError(parseResult.error),
        "UserService.update"
      );
    }

    if (data.email) {
      const userByEmail = await UserRepository.findByEmail(data.email);
      if (userByEmail && userByEmail.id !== id) {
        throw new ConflictException(
          "O email já está em uso por outra conta.",
          "UserService.update"
        );
      }
    }
    if (data.username) {
      const userByUsername = await UserRepository.findByUsername(data.username);
      if (userByUsername && userByUsername.id !== id) {
        throw new ConflictException(
          "O nome de usuário já está em uso.",
          "UserService.update"
        );
      }
    }

    const updatedUser = await UserRepository.update({ id, data });
    return updatedUser;
  },

  async delete(id: string): Promise<void> {
    if (!id)
      throw new BadRequestException(
        "O ID do usuário é obrigatório.",
        "UserService.delete"
      );
    await this.findById(id);
    await UserRepository.delete(id);
  },
};
