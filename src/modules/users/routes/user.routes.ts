import { UserController } from "@/modules/users/controllers/user.controller";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { authMiddleware } from "@/middleware/auth.middleware";
import { rbacMiddleware } from "@/middleware/rbac.middleware";

export const UserRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.addHook("preHandler", authMiddleware);
  
  fastify.post("/", {
    preHandler: [rbacMiddleware(['admin'])], 
    handler: UserController.create
  });
  
  fastify.get("/", {
    preHandler: [rbacMiddleware(['admin'])], 
    handler: UserController.findAll
  });

  fastify.get("/:id", UserController.getById);

  fastify.put("/:id", {
    preHandler: [rbacMiddleware(['admin'])],
    handler: UserController.update
  });
  
  fastify.delete("/:id", {
    preHandler: [rbacMiddleware(['admin'])],
    handler: UserController.delete
  });
};
