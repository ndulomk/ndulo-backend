import { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { ForbiddenException } from '@/utils/domain';

export const rbacMiddleware = (allowedRoles: string[]) => {
  return (
    request: FastifyRequest,
    reply: FastifyReply,
    done: HookHandlerDoneFunction
  ) => {
    const user = (request as any).user;
    if (!user || !user.role) {
      throw new ForbiddenException('Acesso negado. Role de usuário não encontrada.');
    }
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenException('Acesso negado. Você não tem permissão para realizar esta ação.');
    }
    done();
  };
};
