import { z } from "zod";

export const FOTO_MAX_BYTES = 2 * 1024 * 1024;
export const FOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const PerfilUpdateSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório."),
});

export type PerfilUpdateInput = z.infer<typeof PerfilUpdateSchema>;

export const SenhaUpdateSchema = z
  .object({
    senhaAtual: z.string().min(1, "Informe a senha atual."),
    senhaNova: z
      .string()
      .min(6, "A nova senha deve ter pelo menos 6 caracteres."),
    senhaConfirmacao: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.senhaNova === data.senhaConfirmacao, {
    message: "As senhas não coincidem.",
    path: ["senhaConfirmacao"],
  });

export type SenhaUpdateInput = z.infer<typeof SenhaUpdateSchema>;

export const EsqueciSenhaSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
});

export type EsqueciSenhaInput = z.infer<typeof EsqueciSenhaSchema>;

export const RedefinirSenhaSchema = z
  .object({
    senhaNova: z
      .string()
      .min(6, "A senha deve ter pelo menos 6 caracteres."),
    senhaConfirmacao: z.string().min(1, "Confirme a nova senha."),
  })
  .refine((data) => data.senhaNova === data.senhaConfirmacao, {
    message: "As senhas não coincidem.",
    path: ["senhaConfirmacao"],
  });

export type RedefinirSenhaInput = z.infer<typeof RedefinirSenhaSchema>;

export function validateFotoFile(file: File): string | null {
  if (!FOTO_MIME_TYPES.includes(file.type as (typeof FOTO_MIME_TYPES)[number])) {
    return "Formato não suportado. Use JPEG, PNG ou WebP.";
  }
  if (file.size > FOTO_MAX_BYTES) {
    return "A foto deve ter no máximo 2 MB.";
  }
  return null;
}
