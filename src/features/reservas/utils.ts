import type { ReservaOrigem } from "@/types/entities";

/** Ex.: #RES-0001 */
export function formatReservaCodigo(id: number): string {
  return `#RES-${String(id).padStart(4, "0")}`;
}

/** `yyyy-MM-dd` para inputs type="date". */
export function isoToDateInput(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Check-in 14:00 e check-out 12:00 (horário local). */
export function dateInputsToIso(
  dataEntrada: string,
  dataSaida: string
): { dataEntrada: string; dataSaida: string } | null {
  if (!dataEntrada || !dataSaida) return null;
  const entrada = new Date(`${dataEntrada}T14:00:00`);
  const saida = new Date(`${dataSaida}T12:00:00`);
  if (Number.isNaN(entrada.getTime()) || Number.isNaN(saida.getTime())) {
    return null;
  }
  if (saida.getTime() <= entrada.getTime()) return null;
  return {
    dataEntrada: entrada.toISOString(),
    dataSaida: saida.toISOString(),
  };
}

export function nightsBetween(startIso: string, endIso: string): number {
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

export function monthBoundsFromDateInput(dateInput: string): {
  de: string;
  ate: string;
} {
  const [y, m] = dateInput.split("-").map(Number);
  const start = new Date(y!, m! - 1, 1, 0, 0, 0);
  const end = new Date(y!, m!, 0, 23, 59, 59);
  return { de: start.toISOString(), ate: end.toISOString() };
}

export function isReservaImportada(
  origem: ReservaOrigem | string | undefined
): boolean {
  return (origem ?? "Manual") !== "Manual";
}

export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatDateTimeBR(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
