"use server";

import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";
import { apiPath } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import type { ConsultaRequestBody, ConsultaResponse } from "@/types/dto";

export async function consultarIAServer(
  body: ConsultaRequestBody
): Promise<ConsultaResponse> {
  return withAuthRedirect(() =>
    apiRequestServer<ConsultaResponse>(apiPath("/consulta"), {
      method: "POST",
      body,
    })
  );
}
