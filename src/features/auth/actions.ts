"use server";

import { redirect } from "next/navigation";
import { login, registro } from "@/services/api";
import { clearAuthTokenCookie, setAuthTokenCookie } from "@/features/auth/server/session";
import {
  AuthLoginSchema,
  AuthRegistroSchema,
  safeRedirectPath,
} from "@/features/auth/schema";
import { ApiError } from "@/services/api";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = AuthLoginSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Preencha e-mail e senha válidos." };
  }

  let token: string;
  try {
    const session = await login(parsed.data);
    token = session.token;
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível entrar. Tente novamente." };
  }

  try {
    await setAuthTokenCookie(token);
  } catch {
    return { error: "Não foi possível iniciar a sessão. Tente novamente." };
  }

  const redirectTo = safeRedirectPath(
    String(formData.get("redirectTo") ?? "")
  );

  // IMPORTANTE: `redirect()` lança internamente para controle de fluxo.
  // Não deve ficar dentro de try/catch genérico.
  redirect(redirectTo);
}

export type RegistroActionState = {
  error?: string;
};

export async function registroAction(
  _prevState: RegistroActionState,
  formData: FormData
): Promise<RegistroActionState> {
  const parsed = AuthRegistroSchema.safeParse({
    nome: String(formData.get("nome") ?? ""),
    email: String(formData.get("email") ?? ""),
    senha: String(formData.get("senha") ?? ""),
  });

  if (!parsed.success) {
    return { error: "Preencha nome, e-mail e senha válidos." };
  }

  let token: string;
  try {
    const session = await registro(parsed.data);
    token = session.token;
  } catch (e) {
    if (e instanceof ApiError) {
      return { error: e.message };
    }
    return { error: "Não foi possível criar a conta. Tente novamente." };
  }

  try {
    await setAuthTokenCookie(token);
  } catch {
    return { error: "Não foi possível iniciar a sessão. Tente novamente." };
  }

  const redirectTo = safeRedirectPath(
    String(formData.get("redirectTo") ?? "")
  );
  redirect(redirectTo);
}

export async function logoutAction(): Promise<void> {
  await clearAuthTokenCookie();
  redirect("/login");
}

