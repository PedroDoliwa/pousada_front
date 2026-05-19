import { api } from "./client";
import { apiPath } from "./constants";
import { withPousadaId } from "./query";
import type { HospedeCreateBody, HospedeUpdateBody } from "@/types/dto";
import type { Hospede } from "@/types/entities";

export async function listHospedes(pousadaId?: number): Promise<Hospede[]> {
  return api.get<Hospede[]>(
    apiPath(withPousadaId("/hospedes", pousadaId))
  );
}

export async function getHospede(id: number): Promise<Hospede> {
  return api.get<Hospede>(apiPath(`/hospedes/${id}`));
}

export async function createHospede(body: HospedeCreateBody): Promise<Hospede> {
  return api.post<Hospede>(apiPath("/hospedes"), body);
}

export async function updateHospede(
  id: number,
  body: HospedeUpdateBody
): Promise<void> {
  await api.put<void>(apiPath(`/hospedes/${id}`), body);
}

export async function deleteHospede(id: number): Promise<void> {
  await api.delete<void>(apiPath(`/hospedes/${id}`));
}

