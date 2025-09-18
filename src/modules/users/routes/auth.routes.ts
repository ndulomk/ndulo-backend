import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { AuthController } from "@/modules/users/controllers/auth.controller";
import { authMiddleware } from "@/middleware/auth.middleware";

const authRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.post("/register", AuthController.register);
  fastify.post("/login", AuthController.login);
  
  fastify.register(async (authenticatedRoutes) => {
    authenticatedRoutes.addHook("preHandler", authMiddleware);
    
    authenticatedRoutes.get("/me", AuthController.me);
    authenticatedRoutes.post("/logout", AuthController.logout);
  });
};

export default authRoutes;
