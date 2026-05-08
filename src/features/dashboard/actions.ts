"use server";

import type { Pousada, Quarto, Reserva } from "@/types/entities";
import { apiPath } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";

export async function listPousadasServer(): Promise<Pousada[]> {
  return apiRequestServer<Pousada[]>(apiPath("/pousadas"));
}

export async function loadDashboardExtrasServer(pousadaId: number): Promise<{
  quartos: Quarto[];
  reservas: Reserva[];
}> {
  const qs = `?pousadaId=${encodeURIComponent(String(pousadaId))}`;
  const [quartos, reservas] = await Promise.all([
    apiRequestServer<Quarto[]>(apiPath(`/quartos${qs}`)),
    apiRequestServer<Reserva[]>(apiPath(`/reservas${qs}`)),
  ]);
  return { quartos, reservas };
}

