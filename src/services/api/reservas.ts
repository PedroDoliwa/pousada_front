import { api } from "./client";
import { apiPath } from "./constants";
import { withPousadaId } from "./query";
import type {
  ReservaCreateBody,
  ReservaUpdateBody,
  VerificarDisponibilidadeBody,
} from "@/types/dto";
import type { IsoDateTimeString } from "@/types/common";
import type {
  OcupacaoPeriodo,
  Reserva,
  VerificarDisponibilidadeResponse,
} from "@/types/entities";

export async function listReservas(pousadaId?: number): Promise<Reserva[]> {
  return api.get<Reserva[]>(apiPath(withPousadaId("/reservas", pousadaId)));
}

export async function getReserva(id: number): Promise<Reserva> {
  return api.get<Reserva>(apiPath(`/reservas/${id}`));
}

export async function createReserva(
  body: ReservaCreateBody
): Promise<Reserva> {
  return api.post<Reserva>(apiPath("/reservas"), body);
}

export async function updateReserva(
  id: number,
  body: ReservaUpdateBody
): Promise<void> {
  await api.put<void>(apiPath(`/reservas/${id}`), body);
}

export async function deleteReserva(id: number): Promise<void> {
  await api.delete<void>(apiPath(`/reservas/${id}`));
}

export async function verificarDisponibilidade(
  body: VerificarDisponibilidadeBody
): Promise<VerificarDisponibilidadeResponse> {
  return api.post<VerificarDisponibilidadeResponse>(
    apiPath("/reservas/verificar-disponibilidade"),
    body
  );
}

export async function listOcupacao(
  pousadaId: number,
  de: IsoDateTimeString,
  ate: IsoDateTimeString
): Promise<OcupacaoPeriodo[]> {
  const qs = new URLSearchParams({
    pousadaId: String(pousadaId),
    de,
    ate,
  });
  return api.get<OcupacaoPeriodo[]>(
    apiPath(`/reservas/ocupacao?${qs.toString()}`)
  );
}

