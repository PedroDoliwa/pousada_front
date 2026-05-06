"use client";

import { useEffect } from "react";
import { setAuthToken } from "@/lib/api";
import { loadAuth } from "@/lib/auth/session";

/**
 * Restaura o Bearer em memória a partir do storage após reload (para chamadas `api.*`).
 */
export function AuthHydrate({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const auth = loadAuth();
    if (auth?.token) {
      setAuthToken(auth.token);
    }
  }, []);

  return <>{children}</>;
}
