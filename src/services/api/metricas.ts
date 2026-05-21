import { api } from "./client";
import { apiPath } from "./constants";
import type { IsoDateTimeString } from "@/types/common";
import type { Metricas } from "@/types/entities";

export async function getMetricas(
  pousadaId: number,
  de: IsoDateTimeString,
  ate: IsoDateTimeString
): Promise<Metricas> {
  const qs = new URLSearchParams({
    pousadaId: String(pousadaId),
    de,
    ate,
  });
  return api.get<Metricas>(apiPath(`/metricas?${qs.toString()}`));
}
