import { ApiError } from "./errors";

/** Redireciona para login quando a API retorna 401 (token ausente ou expirado). */
export function redirectToLoginOnClient(): void {
  if (typeof window === "undefined") return;
  const next = encodeURIComponent(
    `${window.location.pathname}${window.location.search}`
  );
  window.location.href = `/login?next=${next}`;
}

/**
 * Trata erro de chamada no browser; em 401 redireciona para login.
 * @returns `true` se o erro foi tratado (401) e o caller deve encerrar o fluxo.
 */
export function handleApiErrorForClient(err: unknown): boolean {
  if (err instanceof ApiError && err.status === 401) {
    redirectToLoginOnClient();
    return true;
  }
  return false;
}
