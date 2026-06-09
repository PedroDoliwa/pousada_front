"use server";

import type { SessionUser } from "@/features/auth/session-user";
import { sessionUserFromToken } from "@/features/auth/server/jwt";
import { getAuthTokenFromCookie } from "@/features/auth/server/session";

export async function getSessionUserServer(): Promise<SessionUser | null> {
  const token = await getAuthTokenFromCookie();
  return sessionUserFromToken(token);
}
