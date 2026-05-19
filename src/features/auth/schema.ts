import { z } from "zod";

export const AuthLoginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(1),
});

export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;

export const AuthRegistroSchema = z.object({
  nome: z.string().min(1, "Informe o nome."),
  email: z.string().email(),
  senha: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
});

export type AuthRegistroInput = z.infer<typeof AuthRegistroSchema>;

/** Caminhos internos permitidos após login (evita open redirect). */
export function safeRedirectPath(value: string | null | undefined): string {
  const path = (value ?? "").trim();
  if (!path.startsWith("/") || path.startsWith("//")) return "/dashboard";
  return path;
}

