import { api, getApiBaseUrl } from "./client";
import { apiPath } from "./constants";
import { withPousadaId } from "./query";
import type { QuartoCreateBody, QuartoUpdateBody } from "@/types/dto";
import type { Quarto } from "@/types/entities";

export async function listQuartos(pousadaId?: number): Promise<Quarto[]> {
  return api.get<Quarto[]>(apiPath(withPousadaId("/quartos", pousadaId)));
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

/**
 * URL pública de exportação `.ics` para colar no Airbnb/Booking.
 * Não inclui JWT — usa apenas `tokenExportacao` do quarto.
 */
export function urlExportacaoIcs(
  quartoId: number,
  tokenExportacao: string
): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_URL não está definida; não é possível montar a URL de exportação."
    );
  }
  const token = encodeURIComponent(tokenExportacao);
  return `${base}${apiPath(`/quartos/${quartoId}/calendario/${token}.ics`)}`;
}

