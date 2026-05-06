import type { AuthSessionResponse } from "@/types/dto";

const STORAGE_KEY = "pousada_session_v1";

export type StoredUser = Pick<
  AuthSessionResponse,
  "id" | "nome" | "email" | "perfil"
>;

export type StoredAuth = {
  token: string;
  user: StoredUser;
};

export function saveAuth(
  response: AuthSessionResponse,
  remember: boolean
): void {
  const payload: StoredAuth = {
    token: response.token,
    user: {
      id: response.id,
      nome: response.nome,
      email: response.email,
      perfil: response.perfil,
    },
  };
  const raw = JSON.stringify(payload);
  if (remember) {
    localStorage.setItem(STORAGE_KEY, raw);
    sessionStorage.removeItem(STORAGE_KEY);
  } else {
    sessionStorage.setItem(STORAGE_KEY, raw);
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw =
    sessionStorage.getItem(STORAGE_KEY) ??
    localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function clearAuthStorage(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_KEY);
}
