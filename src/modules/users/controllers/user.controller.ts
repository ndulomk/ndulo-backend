import { UserService } from "@/modules/users/services/user.service";
import { getByIdParam, QueryRequest } from "@/types/query.types";
import {
  CreateUserRequest,
  UserParams,
} from "@/modules/users/types/user.types";
import { FastifyReply, FastifyRequest } from "fastify";
import { CreateUserInput } from "../schemas/user.schema";

export const UserController = {
  create: async (
    request: FastifyRequest<CreateUserRequest>,
    reply: FastifyReply
  ) => {
    const userID = await UserService.create(request.body);
    return reply.code(201).send({
      status: "success",
      message: "Usuário criado com sucesso",
      data: { id: userID },
    });
  },

  findAll: async (
    request: FastifyRequest<{ Querystring: QueryRequest }>,
    reply: FastifyReply
  ) => {
    const { page, limit, search } = request.query;
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 10;
    
    const response = await UserService.getAll({
      page: pageNumber,
      limit: limitNumber,
      search: search,
    });
    
    return reply.code(200).send({
      status: "success",
      ...response,
    });
  },

  getById: async (
    request: FastifyRequest<{ Params: getByIdParam }>,
    reply: FastifyReply
  ) => {
    const response = await UserService.findById(request.params.id);
    return reply.code(200).send({
      status: "success",
      data: response,
    });
  },

  update: async (
    request: FastifyRequest<{ Params: UserParams; Body: CreateUserInput }>,
    reply: FastifyReply
  ) => {
    const response = await UserService.update({
      id: request.params.id,
      data: request.body,
    });
    
    return reply.code(200).send({
      status: "success",
      message: "Usuário atualizado com sucesso",
      data: response
    });
  },

  delete: async (
    request: FastifyRequest<{Params: UserParams}>,
    reply: FastifyReply
  ) => {
    const response = await UserService.delete(request.params.id);
    return reply.code(200).send({
      status: "success",
      message: "Usuário deletado com sucesso",
      data: response
    });
  }
};