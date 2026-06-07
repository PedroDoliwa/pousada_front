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

export const DEFAULT_CHECKIN_TIME = "14:00";
export const DEFAULT_CHECKOUT_TIME = "12:00";

/** `HH:mm` para inputs type="time". */
export function isoToTimeInput(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

export function usesDefaultReservaTimes(
  dataEntrada: string,
  dataSaida: string
): boolean {
  return (
    isoToTimeInput(dataEntrada) === DEFAULT_CHECKIN_TIME &&
    isoToTimeInput(dataSaida) === DEFAULT_CHECKOUT_TIME
  );
}

/** Combina data e hora locais e envia para a API como ISO DateTime. */
export function dateInputsToIso(
  dataEntrada: string,
  dataSaida: string,
  horaEntrada = DEFAULT_CHECKIN_TIME,
  horaSaida = DEFAULT_CHECKOUT_TIME
): { dataEntrada: string; dataSaida: string } | null {
  if (!dataEntrada || !dataSaida || !horaEntrada || !horaSaida) return null;
  const entrada = new Date(`${dataEntrada}T${horaEntrada}:00`);
  const saida = new Date(`${dataSaida}T${horaSaida}:00`);
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
