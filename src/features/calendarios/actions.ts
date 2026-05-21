"use server";

import type { CalendarioExterno, CalendarioSyncResult } from "@/types/entities";
import type {
  CalendarioExternoCreateBody,
  CalendarioExternoUpdateBody,
} from "@/types/dto";
import { apiPath } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";

export async function listCalendariosServer(
  quartoId: number
): Promise<CalendarioExterno[]> {
  return withAuthRedirect(() =>
    apiRequestServer<CalendarioExterno[]>(
      apiPath(`/calendarios?${new URLSearchParams({ quartoId: String(quartoId) })}`)
    )
  );
}

export async function createCalendarioServer(
  body: CalendarioExternoCreateBody
): Promise<CalendarioExterno> {
  return withAuthRedirect(() =>
    apiRequestServer<CalendarioExterno>(apiPath("/calendarios"), {
      method: "POST",
      body,
    })
  );
}

export async function updateCalendarioServer(
  id: number,
  body: CalendarioExternoUpdateBody
): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/calendarios/${id}`), {
      method: "PUT",
      body,
    })
  );
}

export async function deleteCalendarioServer(id: number): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/calendarios/${id}`), {
      method: "DELETE",
    })
  );
}

export async function sincronizarCalendarioServer(
  id: number
): Promise<CalendarioSyncResult> {
  return withAuthRedirect(() =>
    apiRequestServer<CalendarioSyncResult>(
      apiPath(`/calendarios/${id}/sincronizar`),
      { method: "POST" }
    )
  );
}

/** Cancelamento de reserva (`DELETE` na API). */
export async function cancelReservaServer(id: number): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/reservas/${id}`), {
      method: "DELETE",
    })
  );
}
