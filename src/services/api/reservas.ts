import { api } from "./client";
import { apiPath } from "./constants";
import type { ReservaCreateBody, ReservaUpdateBody } from "@/types/dto";
import type { Reserva } from "@/types/entities";

export async function listReservas(pousadaId?: number): Promise<Reserva[]> {
  const qs =
    pousadaId != null
      ? `?pousadaId=${encodeURIComponent(String(pousadaId))}`
      : "";
  return api.get<Reserva[]>(apiPath(`/reservas${qs}`));
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

