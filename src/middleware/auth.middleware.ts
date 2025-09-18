import { FastifyRequest, FastifyReply } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '@/config/env'; 
import { UnauthorizedException, NotFoundException } from '@/utils/domain';
import { sessionRepository } from '@/modules/users/repositories/session.repository';
import { UserRepository } from '@/modules/users/repositories/user.repository';

interface DecodedToken {
  userId: string;
  email: string;
  role: string; 
}

export const authMiddleware = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const authHeader = request.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedException('Token não fornecido');
  }

  const token = authHeader.replace('Bearer ', '');
  const jwtSecret = env.JWT_SECRET; 

  let decoded: DecodedToken;
  try {
    decoded = jwt.verify(token, jwtSecret) as DecodedToken;
  } catch (error) {
    throw new UnauthorizedException('Token inválido ou expirado');
  }

  const session = await sessionRepository.findValidSession(decoded.userId, token);
  if (!session) {
    throw new UnauthorizedException('Sessão inválida ou expirada');
  }

  const user = await UserRepository.findById(decoded.userId);
  if (!user || !user.ativo) {
    throw new NotFoundException('Usuário não encontrado ou inativo');
  }
  
  await sessionRepository.updateLastActivity(decoded.userId, token);

  (request as any).user = {
    userId: decoded.userId,
    email: decoded.email,
    roleId: user.roleId,
  };
};
