import { api } from "./client";
import { apiPath } from "./constants";
import type { QuartoCreateBody, QuartoUpdateBody } from "@/types/dto";
import type { Quarto } from "@/types/entities";

export async function listQuartos(pousadaId?: number): Promise<Quarto[]> {
  const qs =
    pousadaId != null
      ? `?pousadaId=${encodeURIComponent(String(pousadaId))}`
      : "";
  return api.get<Quarto[]>(apiPath(`/quartos${qs}`));
}

export async function getQuarto(id: number): Promise<Quarto> {
  return api.get<Quarto>(apiPath(`/quartos/${id}`));
}

export async function createQuarto(body: QuartoCreateBody): Promise<Quarto> {
  return api.post<Quarto>(apiPath("/quartos"), body);
}

export async function updateQuarto(
  id: number,
  body: QuartoUpdateBody
): Promise<void> {
  await api.put<void>(apiPath(`/quartos/${id}`), body);
}

export async function deleteQuarto(id: number): Promise<void> {
  await api.delete<void>(apiPath(`/quartos/${id}`));
}

