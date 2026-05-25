"use server";

import type { IsoDateTimeString } from "@/types/common";
import type {
  OcupacaoPeriodo,
  Reserva,
  VerificarDisponibilidadeResponse,
} from "@/types/entities";
import type {
  ReservaCreateBody,
  ReservaUpdateBody,
  VerificarDisponibilidadeBody,
} from "@/types/dto";
import { apiPath, withPousadaId } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";

export async function listReservasServer(
  pousadaId: number
): Promise<Reserva[]> {
  return withAuthRedirect(() =>
    apiRequestServer<Reserva[]>(
      apiPath(withPousadaId("/reservas", pousadaId))
    )
  );
}

export async function getReservaServer(id: number): Promise<Reserva> {
  return withAuthRedirect(() =>
    apiRequestServer<Reserva>(apiPath(`/reservas/${id}`))
  );
}

export async function createReservaServer(
  body: ReservaCreateBody
): Promise<Reserva> {
  return withAuthRedirect(() =>
    apiRequestServer<Reserva>(apiPath("/reservas"), {
      method: "POST",
      body,
    })
  );
}

export async function updateReservaServer(
  id: number,
  body: ReservaUpdateBody
): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/reservas/${id}`), {
      method: "PUT",
      body,
    })
  );
}

export async function cancelReservaServer(id: number): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/reservas/${id}`), {
      method: "DELETE",
    })
  );
}

export async function verificarDisponibilidadeServer(
  body: VerificarDisponibilidadeBody
): Promise<VerificarDisponibilidadeResponse> {
  return withAuthRedirect(() =>
    apiRequestServer<VerificarDisponibilidadeResponse>(
      apiPath("/reservas/verificar-disponibilidade"),
      { method: "POST", body }
    )
  );
}

export async function listOcupacaoServer(
  pousadaId: number,
  de: IsoDateTimeString,
  ate: IsoDateTimeString
): Promise<OcupacaoPeriodo[]> {
  const qs = new URLSearchParams({
    pousadaId: String(pousadaId),
    de,
    ate,
  });
  return withAuthRedirect(() =>
    apiRequestServer<OcupacaoPeriodo[]>(
      apiPath(`/reservas/ocupacao?${qs.toString()}`)
    )
  );
}
