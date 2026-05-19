"use server";

import { redirect } from "next/navigation";
import { ApiError } from "@/services/api";
import { clearAuthTokenCookie } from "@/features/auth/server/session";

/**
 * Em Server Actions: limpa cookie e redireciona ao login em 401.
 * Relança outros erros.
 */
export async function rethrowUnlessUnauthorized(err: unknown): Promise<never> {
  if (err instanceof ApiError && err.status === 401) {
    await clearAuthTokenCookie();
    redirect("/login");
  }
  throw err;
}

/** Envolve chamada à API em Server Action com tratamento de 401. */
export async function withAuthRedirect<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    return rethrowUnlessUnauthorized(err);
  }
}
