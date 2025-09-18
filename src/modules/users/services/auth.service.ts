import { UserRepository } from "@/modules/users/repositories/user.repository";
import { sessionRepository } from "@/modules/users/repositories/session.repository";
import {
  CreateUserInput,
  createUserSchema,
} from "@/modules/users/schemas/user.schema";
import { UserResponseType } from "@/modules/users/types/user.types";
import {
  ConflictException,
  UnauthorizedException,
  ValidationException,
  DomainException,
} from "@/utils/domain";
import { formatZodError } from "@/utils/formatZodError";
import { FastifyRequest } from "fastify";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const AuthService = {
  async register(data: CreateUserInput, request: FastifyRequest) {
    const parseResult = createUserSchema.safeParse(data);
    if (!parseResult.success) {
      throw new ValidationException(
        formatZodError(parseResult.error),
        "AuthService.register"
      );
    }

    if (await UserRepository.findByUsername(data.username)) {
      throw new ConflictException(
        "Nome de usuário já existe.",
        "AuthService.register"
      );
    }
    if (await UserRepository.findByEmail(data.email)) {
      throw new ConflictException(
        "Email já está em uso.",
        "AuthService.register"
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const userId = await UserRepository.create({
      ...data,
      password: hashedPassword,
    });
    const user = await UserRepository.findById(userId);

    if (!user) {
      throw new DomainException(
        "Falha ao registrar o usuário.",
        "AuthService.register"
      );
    }

    const token = this.generateToken(user);
    await this.createSession(userId, token, request);

    return { success: true, user, token };
  },

  async login(email: string, password: string, request: FastifyRequest) {
    if (!email || !password) {
      throw new ValidationException(
        "Email e senha são obrigatórios.",
        "AuthService.login"
      );
    }

    const userWithPassword =
      await UserRepository.findByEmailWithPassword(email);
    if (!userWithPassword) {
      throw new UnauthorizedException(
        "Credenciais inválidas.",
        "AuthService.login"
      );
    }

    if (!userWithPassword.ativo) {
      throw new UnauthorizedException(
        "Esta conta está inativa.",
        "AuthService.login"
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      userWithPassword.password
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        "Credenciais inválidas.",
        "AuthService.login"
      );
    }

    await UserRepository.updateLastLogin(userWithPassword.id);

    const user = userWithPassword;
    const token = this.generateToken(user);
    await this.createSession(user.id, token, request);

    return { success: true, user, token };
  },

  async logout(userId: string, token: string) {
    await sessionRepository.deleteSession(userId, token);
    return { success: true, message: "Logout realizado com sucesso." };
  },

  async getProfile(userId: string) {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new DomainException(
        "Usuário não encontrado.",
        "AuthService.getProfile"
      );
    }
    return { success: true, user };
  },

  async createSession(userId: string, token: string, request: FastifyRequest) {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Expira em 7 dias
    const ipAddress = request.ip;
    const userAgent = request.headers["user-agent"] || "unknown";
    const deviceInfo = { agent: userAgent };

    await sessionRepository.createSession(
      userId,
      token,
      ipAddress,
      userAgent,
      deviceInfo,
      expiresAt
    );
  },

  generateToken(user: UserResponseType): string {
    const jwtSecret = process.env.JWT_SECRET || "seu-segredo-jwt-aqui";
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.roleId },
      jwtSecret,
      { expiresIn: "7d" }
    );
  },
};
