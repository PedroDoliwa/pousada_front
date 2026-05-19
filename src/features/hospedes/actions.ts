"use server";

import type { Hospede } from "@/types/entities";
import type { HospedeCreateBody, HospedeUpdateBody } from "@/types/dto";
import { apiPath, withPousadaId } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";

export async function listHospedesServer(
  pousadaId: number
): Promise<Hospede[]> {
  return withAuthRedirect(() =>
    apiRequestServer<Hospede[]>(
      apiPath(withPousadaId("/hospedes", pousadaId))
    )
  );
}

export async function createHospedeServer(
  body: HospedeCreateBody
): Promise<Hospede> {
  return withAuthRedirect(() =>
    apiRequestServer<Hospede>(apiPath("/hospedes"), {
      method: "POST",
      body,
    })
  );
}

export async function updateHospedeServer(
  id: number,
  body: HospedeUpdateBody
): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/hospedes/${id}`), {
      method: "PUT",
      body,
    })
  );
}

export async function deleteHospedeServer(id: number): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/hospedes/${id}`), {
      method: "DELETE",
    })
  );
}
