"use server";

import type { IsoDateTimeString } from "@/types/common";
import type {
  CalendarioExterno,
  Hospede,
  Metricas,
  OcupacaoPeriodo,
  Quarto,
  Reserva,
} from "@/types/entities";
import { apiPath, withPousadaId } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";
import { listCalendariosServer } from "@/features/calendarios/actions";
import { listHospedesServer } from "@/features/hospedes";
import { listQuartosServer } from "@/features/quartos/actions";
import { listOcupacaoServer } from "@/features/reservas/actions";
import { isCalendarioPendenteSync, monthRange } from "@/features/dashboard/utils";

export type DashboardData = {
  metricasAtual: Metricas;
  metricasAnterior: Metricas;
  quartos: Quarto[];
  ocupacao: OcupacaoPeriodo[];
  reservas: Reserva[];
  hospedes: Hospede[];
  calendariosPendentes: CalendarioExterno[];
};

async function getMetricasServer(
  pousadaId: number,
  de: IsoDateTimeString,
  ate: IsoDateTimeString
): Promise<Metricas> {
  const qs = new URLSearchParams({
    pousadaId: String(pousadaId),
    de,
    ate,
  });
  return apiRequestServer<Metricas>(apiPath(`/metricas?${qs.toString()}`));
}

export async function loadDashboardDataServer(
  pousadaId: number
): Promise<DashboardData> {
  return withAuthRedirect(async () => {
    const atual = monthRange(0);
    const anterior = monthRange(-1);

    const [metricasAtual, metricasAnterior, quartos, reservas, hospedes, ocupacao] =
      await Promise.all([
        getMetricasServer(pousadaId, atual.de, atual.ate),
        getMetricasServer(pousadaId, anterior.de, anterior.ate),
        listQuartosServer(pousadaId),
        apiRequestServer<Reserva[]>(
          apiPath(withPousadaId("/reservas", pousadaId))
        ),
        listHospedesServer(pousadaId),
        listOcupacaoServer(pousadaId, atual.de, atual.ate),
      ]);

    const calendarioLists = await Promise.all(
      quartos.map((q) => listCalendariosServer(q.id))
    );
    const calendariosPendentes = calendarioLists
      .flat()
      .filter(isCalendarioPendenteSync);

    return {
      metricasAtual,
      metricasAnterior,
      quartos,
      ocupacao,
      reservas,
      hospedes,
      calendariosPendentes,
    };
  });
}

export async function loadDashboardExtrasServer(pousadaId: number): Promise<{
  quartos: Quarto[];
  reservas: Reserva[];
}> {
  return withAuthRedirect(async () => {
    const [quartos, reservas] = await Promise.all([
      apiRequestServer<Quarto[]>(
        apiPath(withPousadaId("/quartos", pousadaId))
      ),
      apiRequestServer<Reserva[]>(
        apiPath(withPousadaId("/reservas", pousadaId))
      ),
    ]);
    return { quartos, reservas };
  });
}

export async function listReservasServer(
  pousadaId: number
): Promise<Reserva[]> {
  return withAuthRedirect(() =>
    apiRequestServer<Reserva[]>(
      apiPath(withPousadaId("/reservas", pousadaId))
    )
  );
}
