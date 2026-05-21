"use server";

import type { Quarto } from "@/types/entities";
import type { QuartoCreateBody, QuartoUpdateBody } from "@/types/dto";
import { apiPath, withPousadaId } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";

export async function listQuartosServer(pousadaId: number): Promise<Quarto[]> {
  return withAuthRedirect(() =>
    apiRequestServer<Quarto[]>(
      apiPath(withPousadaId("/quartos", pousadaId))
    )
  );
}

export async function createQuartoServer(
  body: QuartoCreateBody
): Promise<Quarto> {
  return withAuthRedirect(() =>
    apiRequestServer<Quarto>(apiPath("/quartos"), {
      method: "POST",
      body,
    })
  );
}

export async function updateQuartoServer(
  id: number,
  body: QuartoUpdateBody
): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/quartos/${id}`), {
      method: "PUT",
      body,
    })
  );
}

export async function deleteQuartoServer(id: number): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/quartos/${id}`), {
      method: "DELETE",
    })
  );
}
