import { formatZodError } from "@/utils/formatZodError";
import { CreateRoleInput, createRoleSchema } from "../schemas/role.schema";
import {
  BadRequestException,
  NotFoundException,
  ValidationException,
} from "@/utils/domain";
import { RoleRepository } from "../repositories/role.repository";
import { RoleType } from "../types/role.types";
import { IdMandatory } from "@/utils/IdMandatory";
import { NOTFOUND } from "@/utils/CONSTANTS";
import { QueryRequest, QueryResponse } from "@/types/query.types";

const COMPONENT = "rolesServices";

export const RoleService = {
  async create(data: CreateRoleInput): Promise<string> {
    const parseResult = createRoleSchema.safeParse(data);
    if (!parseResult.success) {
      const errorMessage = formatZodError(parseResult.error);
      throw new ValidationException(errorMessage, COMPONENT);
    }
    const result = await RoleRepository.create(parseResult.data);
    return result;
  },

  async findById(id: string): Promise<RoleType | null> {
    await IdMandatory(id);
    const result = await RoleRepository.findById(id);
    if (!result) {
      throw new NotFoundException(`${NOTFOUND("role")}`, COMPONENT);
    }
    return result;
  },

  async findAll({
    page,
    limit,
    search,
  }: QueryRequest): Promise<QueryResponse<RoleType>> {
    if (page < 1)
      throw new BadRequestException("Página deve ser maior que 0", COMPONENT);
    if (limit < 1 || limit > 100)
      throw new BadRequestException(
        "Limit deve estar entre 1 e 100",
        COMPONENT
      );

    const { data, total } = await RoleRepository.findAll({
      page,
      limit,
      search,
    });
    const totalPages = Math.ceil(total / limit);
    return {
      data: data,
      pagination: {
        page: page,
        limit: limit,
        totalPages: totalPages,
        total: total,
      },
    };
  },
  async update({
    id,
    data,
  }: {
    id: string;
    data: Partial<RoleType>;
  }): Promise<RoleType> {
    await this.findById(id);
    const result = await RoleRepository.update({ id, data });
    return result;
  },

  async delete(id: string): Promise<null> {
    await this.findById(id);
    const result = await RoleRepository.delete(id);
    return result;
  },
};
