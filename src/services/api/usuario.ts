import { apiPath } from "./constants";
import { apiRequestServer } from "./server-client";
import type {
  ApiMessageBody,
  UsuarioPerfil,
  UsuarioPerfilAtualizado,
  UsuarioSenhaUpdate,
  UsuarioUpdate,
} from "@/types/dto";

export async function getPerfil(): Promise<UsuarioPerfil> {
  return apiRequestServer<UsuarioPerfil>(apiPath("/usuario/perfil"));
}

export async function updatePerfil(
  body: UsuarioUpdate
): Promise<UsuarioPerfilAtualizado> {
  return apiRequestServer<UsuarioPerfilAtualizado>(apiPath("/usuario/perfil"), {
    method: "PUT",
    body,
  });
}

export async function updateSenha(
  body: UsuarioSenhaUpdate
): Promise<ApiMessageBody> {
  return apiRequestServer<ApiMessageBody>(apiPath("/usuario/senha"), {
    method: "PUT",
    body,
  });
}

export async function solicitarRedefinicaoSenha(): Promise<ApiMessageBody> {
  return apiRequestServer<ApiMessageBody>(
    apiPath("/usuario/solicitar-redefinicao-senha"),
    { method: "POST" }
  );
}

export async function uploadFoto(formData: FormData): Promise<ApiMessageBody> {
  return apiRequestServer<ApiMessageBody>(apiPath("/usuario/foto"), {
    method: "POST",
    body: formData,
  });
}

export async function deleteFoto(): Promise<ApiMessageBody> {
  return apiRequestServer<ApiMessageBody>(apiPath("/usuario/foto"), {
    method: "DELETE",
  });
}
