import { z } from "zod";

export const createUserSchema = z.object({
  username: z.string()
    .min(3, "O nome de usuário deve ter pelo menos 3 caracteres")
    .regex(/^[a-zA-Z0-9_]+$/, "O nome de usuário deve conter apenas letras, números e sublinhado"),
  nomeCompleto: z.string().min(3, "O nome completo é obrigatório"),
  email: z.string().email("Formato de email inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  roleId: z.string().default('user'),
  ativo: z.boolean().default(true),
});

export const updateUserSchema = createUserSchema.partial().omit({ password: true });

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
