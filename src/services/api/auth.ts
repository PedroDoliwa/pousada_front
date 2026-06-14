import { api } from "./client";
import { apiPath } from "./constants";
import type {
  ApiMessageBody,
  AuthLoginBody,
  AuthRegistroBody,
  AuthSessionResponse,
  EsqueciSenha,
  RedefinirSenha,
} from "@/types/dto";

export async function login(
  body: AuthLoginBody
): Promise<AuthSessionResponse> {
  return api.post<AuthSessionResponse>(apiPath("/auth/login"), body, {
    auth: false,
  });
}

export async function registro(
  body: AuthRegistroBody
): Promise<AuthSessionResponse> {
  return api.post<AuthSessionResponse>(apiPath("/auth/registro"), body, {
    auth: false,
  });
}

export async function esqueciSenha(body: EsqueciSenha): Promise<ApiMessageBody> {
  return api.post<ApiMessageBody>(apiPath("/auth/esqueci-senha"), body, {
    auth: false,
  });
}

export async function redefinirSenha(
  body: RedefinirSenha
): Promise<ApiMessageBody> {
  return api.post<ApiMessageBody>(apiPath("/auth/redefinir-senha"), body, {
    auth: false,
  });
}

