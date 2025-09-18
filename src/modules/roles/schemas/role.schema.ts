import { MANDATORY } from "@/utils/CONSTANTS";
import z from "zod";

export const createRoleSchema = z.object({
  nome: z.string().min(1, MANDATORY("nome")),
  descricao: z.string().optional(),
  permissions: z.union([
    z.record(z.any()),  
    z.array(z.string()) 
  ]),
  ativo: z.boolean().default(true)
})

export type CreateRoleInput = z.infer<typeof createRoleSchema>