"use server";

import { listHospedesServer } from "@/features/hospedes";
import { listQuartosServer } from "@/features/quartos/actions";
import { listReservasServer } from "@/features/reservas/actions";
import type { Hospede, Quarto, Reserva } from "@/types/entities";

export async function loadRelatoriosDataServer(
  pousadaId: number
): Promise<{
  quartos: Quarto[];
  reservas: Reserva[];
  hospedes: Hospede[];
}> {
  const [quartos, reservas, hospedes] = await Promise.all([
    listQuartosServer(pousadaId),
    listReservasServer(pousadaId),
    listHospedesServer(pousadaId),
  ]);

  return { quartos, reservas, hospedes };
}
