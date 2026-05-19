"use server";

import type { Quarto, Reserva } from "@/types/entities";
import { apiPath, withPousadaId } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";

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
