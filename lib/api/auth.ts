import { api } from "./client";
import { apiPath } from "./constants";
import type {
  AuthLoginBody,
  AuthRegistroBody,
  AuthSessionResponse,
} from "@/types/dto";

export async function login(
  body: AuthLoginBody
): Promise<AuthSessionResponse> {
  return api.post<AuthSessionResponse>(
    apiPath("/auth/login"),
    body,
    { auth: false }
  );
}

export async function registro(
  body: AuthRegistroBody
): Promise<AuthSessionResponse> {
  return api.post<AuthSessionResponse>(
    apiPath("/auth/registro"),
    body,
    { auth: false }
  );
}
