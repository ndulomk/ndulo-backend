import { FastifyRequest, FastifyReply } from 'fastify';
import { AuthService } from '@/modules/users/services/auth.service';
import { LoginDTO } from '@/modules/users/types/auth.types';
import { CreateUserInput } from '../schemas/user.schema';

export const AuthController = {
  async register(request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) {
    const result = await AuthService.register(request.body, request);
    return reply.code(201).send({
      status: "success",
      message: "Conta criada com sucesso",
      data: {
        access_token: result.token,
        user: result.user,
      },
    });
  },

  async login(request: FastifyRequest<{ Body: LoginDTO }>, reply: FastifyReply) {
    const { email, password } = request.body;
    const result = await AuthService.login(email, password, request);
    return reply.code(200).send({
      status: "success",
      message: "Login realizado com sucesso",
      data: {
        access_token: result.token,
        user: result.user,
      },
    });
  },

  async logout(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.userId;
    const token = request.headers['authorization']?.replace('Bearer ', '');
    if (!userId || !token) {
      return reply.code(401).send({
        status: "error",
        message: "Não autenticado",
      });
    }

    const result = await AuthService.logout(userId, token);
    return reply.code(200).send({
      status: "success",
      message: result.message,
    });
  },

  async me(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.userId;
    if (!userId) {
      return reply.code(401).send({
        status: "error",
        message: "Não autenticado",
      });
    }

    const result = await AuthService.getProfile(userId);
    return reply.code(200).send({
      status: "success",
      data: result.user,
    });
  },
};