import type { Pousada } from "@/types/entities";

export const ACTIVE_POUSADA_STORAGE_KEY = "pousada_selected_id";

/** Lê o id da pousada ativa no `sessionStorage`, validando contra a lista do usuário. */
export function readActivePousadaId(pousadas: Pousada[]): number | null {
  if (typeof window === "undefined") return pousadas[0]?.id ?? null;
  const stored = window.sessionStorage.getItem(ACTIVE_POUSADA_STORAGE_KEY);
  const parsed = stored ? Number.parseInt(stored, 10) : NaN;
  const valid =
    Number.isFinite(parsed) && pousadas.some((p) => p.id === parsed);
  return valid ? parsed! : pousadas[0]?.id ?? null;
}

export function writeActivePousadaId(id: number): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(ACTIVE_POUSADA_STORAGE_KEY, String(id));
}
