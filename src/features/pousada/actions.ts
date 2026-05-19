"use server";

import type { Pousada } from "@/types/entities";
import type { PousadaCreateBody, PousadaUpdateBody } from "@/types/dto";
import { apiPath } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";

export async function listPousadasServer(): Promise<Pousada[]> {
  return withAuthRedirect(() =>
    apiRequestServer<Pousada[]>(apiPath("/pousadas"))
  );
}

export async function createPousadaServer(
  body: PousadaCreateBody
): Promise<Pousada> {
  return withAuthRedirect(() =>
    apiRequestServer<Pousada>(apiPath("/pousadas"), {
      method: "POST",
      body,
    })
  );
}

export async function updatePousadaServer(
  id: number,
  body: PousadaUpdateBody
): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/pousadas/${id}`), {
      method: "PUT",
      body,
    })
  );
}
