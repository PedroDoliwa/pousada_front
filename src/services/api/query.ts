/** Acrescenta `?pousadaId=` quando informado (listagens filtradas por pousada ativa). */
export function withPousadaId(path: string, pousadaId?: number): string {
  if (pousadaId == null) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}pousadaId=${encodeURIComponent(String(pousadaId))}`;
}
