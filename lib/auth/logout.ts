import { clearAuth } from "@/lib/api";
import { clearAuthStorage } from "@/lib/auth/session";

/** Limpa token em memória e storage; chame e depois redirecione para `/login`. */
export function performLogout(): void {
  clearAuth();
  clearAuthStorage();
}
