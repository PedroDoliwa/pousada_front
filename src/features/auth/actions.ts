"use server";

import { redirect } from "next/navigation";
import { login } from "@/services/api";
import { clearAuthTokenCookie, setAuthTokenCookie } from "@/features/auth/server/session";
import { AuthLoginSchema } from "@/features/auth/schema";
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

  // IMPORTANTE: `redirect()` lança internamente para controle de fluxo.
  // Não deve ficar dentro de try/catch genérico.
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearAuthTokenCookie();
  redirect("/login");
}

