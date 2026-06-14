"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/services/api";
import {
  deleteFoto,
  esqueciSenha,
  getPerfil,
  redefinirSenha,
  solicitarRedefinicaoSenha,
  updatePerfil,
  updateSenha,
  uploadFoto,
} from "@/services/api";
import { setAuthTokenCookie } from "@/features/auth/server/session";
import { withAuthRedirect } from "@/features/auth/server/handle-unauthorized";
import type { UsuarioPerfil } from "@/types/dto";
import {
  EsqueciSenhaSchema,
  PerfilUpdateSchema,
  RedefinirSenhaSchema,
  SenhaUpdateSchema,
  validateFotoFile,
} from "./schema";

export async function getPerfilServer(): Promise<UsuarioPerfil> {
  return withAuthRedirect(() => getPerfil());
}

export type PerfilActionState = {
  error?: string;
  success?: string;
  perfil?: UsuarioPerfil;
};

export async function updatePerfilAction(
  _prevState: PerfilActionState,
  formData: FormData
): Promise<PerfilActionState> {
  const parsed = PerfilUpdateSchema.safeParse({
    nome: String(formData.get("nome") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Nome inválido." };
  }

  try {
    const updated = await withAuthRedirect(() =>
      updatePerfil(parsed.data)
    );
    await setAuthTokenCookie(updated.token);
    const { token: _token, ...perfil } = updated;
    return {
      success: "Nome atualizado com sucesso.",
      perfil,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível atualizar o nome. Tente novamente." };
  }
}

export type SenhaActionState = {
  error?: string;
  success?: string;
};

export async function updateSenhaAction(
  _prevState: SenhaActionState,
  formData: FormData
): Promise<SenhaActionState> {
  const parsed = SenhaUpdateSchema.safeParse({
    senhaAtual: String(formData.get("senhaAtual") ?? ""),
    senhaNova: String(formData.get("senhaNova") ?? ""),
    senhaConfirmacao: String(formData.get("senhaConfirmacao") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { senhaConfirmacao: _confirmacao, ...body } = parsed.data;

  try {
    const res = await withAuthRedirect(() => updateSenha(body));
    return { success: res.message ?? "Senha alterada com sucesso." };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível alterar a senha. Tente novamente." };
  }
}

export type SolicitarRedefinicaoState = {
  error?: string;
  success?: string;
};

export async function solicitarRedefinicaoAction(): Promise<SolicitarRedefinicaoState> {
  try {
    const res = await withAuthRedirect(() => solicitarRedefinicaoSenha());
    return { success: res.message ?? "Link de redefinição enviado." };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return {
      error: "Não foi possível enviar o e-mail de redefinição. Tente novamente.",
    };
  }
}

export type FotoActionState = {
  error?: string;
  success?: string;
  temFoto?: boolean;
};

export async function uploadFotoAction(
  _prevState: FotoActionState,
  formData: FormData
): Promise<FotoActionState> {
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
    const res = await withAuthRedirect(() => uploadFoto(payload));
    return {
      success: res.message ?? "Foto de perfil atualizada com sucesso.",
      temFoto: true,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível enviar a foto. Tente novamente." };
  }
}

export async function deleteFotoAction(): Promise<FotoActionState> {
  try {
    const res = await withAuthRedirect(() => deleteFoto());
    return {
      success: res.message ?? "Foto de perfil removida com sucesso.",
      temFoto: false,
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível remover a foto. Tente novamente." };
  }
}

export type EsqueciSenhaActionState = {
  error?: string;
  success?: string;
};

export async function esqueciSenhaAction(
  _prevState: EsqueciSenhaActionState,
  formData: FormData
): Promise<EsqueciSenhaActionState> {
  const parsed = EsqueciSenhaSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "E-mail inválido." };
  }

  try {
    const res = await esqueciSenha(parsed.data);
    return {
      success:
        res.message ??
        "Se o e-mail estiver cadastrado, você receberá um link para redefinir sua senha.",
    };
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível processar a solicitação. Tente novamente." };
  }
}

export type RedefinirSenhaActionState = {
  error?: string;
};

export async function redefinirSenhaAction(
  _prevState: RedefinirSenhaActionState,
  formData: FormData
): Promise<RedefinirSenhaActionState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) {
    return { error: "Link inválido ou expirado." };
  }

  const parsed = RedefinirSenhaSchema.safeParse({
    senhaNova: String(formData.get("senhaNova") ?? ""),
    senhaConfirmacao: String(formData.get("senhaConfirmacao") ?? ""),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    await redefinirSenha({ token, senhaNova: parsed.data.senhaNova });
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível redefinir a senha. Tente novamente." };
  }

  redirect("/login");
}
