import type { SessionUser } from "@/features/auth/session-user";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length < 2) return null;
  const segment = parts[1]!;
  const padded = segment + "=".repeat((4 - (segment.length % 4)) % 4);
  const base64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  try {
    const json = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function claimString(
  payload: Record<string, unknown>,
  ...keys: string[]
): string | null {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

/** Extrai nome, e-mail e perfil do payload JWT (claims ASP.NET Core). */
export function sessionUserFromToken(
  token: string | null | undefined
): SessionUser | null {
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  const nome =
    claimString(
      payload,
      "unique_name",
      "name",
      "given_name",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"
    ) ?? "Usuário";

  const email =
    claimString(
      payload,
      "email",
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
    ) ?? null;

  const perfil =
    claimString(
      payload,
      "role",
      "perfil",
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ) ?? null;

  return { nome, email, perfil };
}
