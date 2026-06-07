"use server";

import type { IsoDateTimeString } from "@/types/common";
import type { OcupacaoPeriodo, Quarto } from "@/types/entities";
import { listQuartosServer } from "@/features/quartos/actions";
import { listOcupacaoServer } from "@/features/reservas/actions";

export type CalendarioData = {
  quartos: Quarto[];
  ocupacao: OcupacaoPeriodo[];
};

/**
 * Carrega os quartos da pousada e a ocupação no período visível do calendário.
 * Usa `GET /api/quartos` e `GET /api/reservas/ocupacao`.
 */
export async function loadCalendarioDataServer(
  pousadaId: number,
  de: IsoDateTimeString,
  ate: IsoDateTimeString
): Promise<CalendarioData> {
  const [quartos, ocupacao] = await Promise.all([
    listQuartosServer(pousadaId),
    listOcupacaoServer(pousadaId, de, ate),
  ]);
  return { quartos, ocupacao };
}
