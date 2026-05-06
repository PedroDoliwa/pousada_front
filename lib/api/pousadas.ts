import { api } from "./client";
import { apiPath } from "./constants";
import type { PousadaCreateBody, PousadaUpdateBody } from "@/types/dto";
import type { Pousada } from "@/types/entities";

export async function listPousadas(): Promise<Pousada[]> {
  return api.get<Pousada[]>(apiPath("/pousadas"));
}

export async function getPousada(id: number): Promise<Pousada> {
  return api.get<Pousada>(apiPath(`/pousadas/${id}`));
}

export async function createPousada(
  body: PousadaCreateBody
): Promise<Pousada> {
  return api.post<Pousada>(apiPath("/pousadas"), body);
}

export async function updatePousada(
  id: number,
  body: PousadaUpdateBody
): Promise<void> {
  await api.put<void>(apiPath(`/pousadas/${id}`), body);
}

export async function deletePousada(id: number): Promise<void> {
  await api.delete<void>(apiPath(`/pousadas/${id}`));
}
