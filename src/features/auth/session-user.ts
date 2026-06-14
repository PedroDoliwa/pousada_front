export type SessionUser = {
  nome: string;
  email: string | null;
  perfil: string | null;
  temFoto?: boolean;
};

export function userInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return `${parts[0]!.charAt(0)}${parts[parts.length - 1]!.charAt(0)}`.toUpperCase();
}

export function firstName(nome: string): string {
  return nome.trim().split(/\s+/)[0] ?? nome;
}
