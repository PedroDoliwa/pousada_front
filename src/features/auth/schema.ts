import { z } from "zod";

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;

