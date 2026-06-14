"use server";

import { ApiError } from "@/services/api";
import type { Pousada } from "@/types/entities";
import type { PousadaCreateBody, PousadaUpdateBody } from "@/types/dto";
import { apiPath, deletePousadaFoto, uploadPousadaFoto } from "@/services/api";
import { apiRequestServer } from "@/services/api/server-client";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";
import { validateFotoFile } from "@/features/conta/schema";

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

export async function deletePousadaServer(id: number): Promise<void> {
  return withAuthRedirect(() =>
    apiRequestServer<void>(apiPath(`/pousadas/${id}`), {
      method: "DELETE",
    })
  );
}

export type PousadaFotoActionState = {
  error?: string;
  success?: string;
  temFoto?: boolean;
};

export async function uploadPousadaFotoServer(
  pousadaId: number,
  formData: FormData
): Promise<PousadaFotoActionState> {
  const arquivo = formData.get("arquivo");
  if (!(arquivo instanceof File) || arquivo.size === 0) {
    return { error: "Selecione uma foto para enviar." };
  }

  const validationError = validateFotoFile(arquivo);
  if (validationError) {
    return { error: validationError };
  }

  const payload = new FormData();
  payload.append("arquivo", arquivo);

  try {
    const res = await withAuthRedirect(() =>
      uploadPousadaFoto(pousadaId, payload)
    );
    return {
      success: res.message ?? "Foto da pousada atualizada com sucesso.",
      temFoto: true,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível enviar a foto. Tente novamente." };
  }
}

export async function deletePousadaFotoServer(
  pousadaId: number
): Promise<PousadaFotoActionState> {
  try {
    const res = await withAuthRedirect(() => deletePousadaFoto(pousadaId));
    return {
      success: res.message ?? "Foto da pousada removida com sucesso.",
      temFoto: false,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível remover a foto. Tente novamente." };
  }
}
