/** Prefixo das rotas REST documentado em INTEGRACAO_FRONT_NEXT.md */
export const API_PREFIX = "/api";

export function apiPath(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${API_PREFIX}${normalized}`;
}

