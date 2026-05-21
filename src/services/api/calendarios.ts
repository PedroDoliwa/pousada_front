import { api } from "./client";
import { apiPath } from "./constants";
import type {
  CalendarioExternoCreateBody,
  CalendarioExternoUpdateBody,
} from "@/types/dto";
import type { CalendarioExterno, CalendarioSyncResult } from "@/types/entities";

export async function listCalendarios(
  quartoId: number
): Promise<CalendarioExterno[]> {
  const qs = new URLSearchParams({ quartoId: String(quartoId) });
  return api.get<CalendarioExterno[]>(
    apiPath(`/calendarios?${qs.toString()}`)
  );
}

export async function getCalendario(id: number): Promise<CalendarioExterno> {
  return api.get<CalendarioExterno>(apiPath(`/calendarios/${id}`));
}

export async function createCalendario(
  body: CalendarioExternoCreateBody
): Promise<CalendarioExterno> {
  return api.post<CalendarioExterno>(apiPath("/calendarios"), body);
}

export async function updateCalendario(
  id: number,
  body: CalendarioExternoUpdateBody
): Promise<void> {
  await api.put<void>(apiPath(`/calendarios/${id}`), body);
}

export async function deleteCalendario(id: number): Promise<void> {
  await api.delete<void>(apiPath(`/calendarios/${id}`));
}

export async function sincronizarCalendario(
  id: number
): Promise<CalendarioSyncResult> {
  return api.post<CalendarioSyncResult>(
    apiPath(`/calendarios/${id}/sincronizar`)
  );
}
