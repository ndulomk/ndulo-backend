import fastify, { FastifyInstance, FastifyPluginAsync } from "fastify";
import { RoleController } from "../controllers/role.controller";

export const RoleRoutes: FastifyPluginAsync = async(fastify: FastifyInstance) => {
  fastify.post("/", RoleController.create);
  fastify.get("/", RoleController.findAll);
  fastify.get("/:id", RoleController.findById);
  fastify.put("/:id", RoleController.update);
  fastify.delete("/:id", RoleController.delete)
}