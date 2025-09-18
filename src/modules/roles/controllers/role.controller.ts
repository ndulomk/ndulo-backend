import { FastifyReply, FastifyRequest } from "fastify";
import { CreateRoleInput } from "../schemas/role.schema";
import { RoleService } from "../services/role.service";
import { IdParam, QueryRequest } from "@/types/query.types";
import { RoleType } from "../types/role.types";

export const RoleController = {
  create: async(
    request: FastifyRequest<{ Body: CreateRoleInput }>,
    reply: FastifyReply
  ) => {
    const result = await RoleService.create(request.body)
    return reply.code(201).send({
      status: "success",
      message: "Role criada com successo",
      data: { id: result }
    })
  },

  findAll: async(
    request: FastifyRequest<{ Querystring: QueryRequest }>,
    reply: FastifyReply
  )=> {
    const { page, limit, search } = request.query
    const pageNumber = page ? Number(page) : 1
    const limitNumber = limit ? Number(limit) : 10
    const response = await RoleService.findAll({
      page: pageNumber,
      limit: limitNumber,
      search: search
    })
    return reply.code(200).send({
      status:"success",
      ...response
    })
  },
  
  findById: async(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) => {
    const response = await RoleService.findById(request.params.id)
    return reply.code(200).send({
      status:"success",
      data: response
    })
  },
  
  update: async(
    request: FastifyRequest<{ Params: IdParam, Body: RoleType }>,
    reply: FastifyReply
  )=> {
    const result = await RoleService.update({
      id: request.params.id,
      data: request.body
    })
    return reply.code(200).send({
      status:"success",
      message:"Role Atualizada com successo",
      data: result
    })
  },

  delete: async(
    request: FastifyRequest<{ Params: IdParam }>,
    reply: FastifyReply
  ) => {
    const response = await RoleService.delete(request.params.id)
    return reply.code(200).send({
      status:"success",
      message:"Role deletada com successo",
      data: null
    })
  }
}