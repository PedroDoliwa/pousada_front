"use client";

import { LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { performLogout } from "@/lib/auth/logout";
import { loadAuth } from "@/lib/auth/session";

export function DashboardChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [userLabel, setUserLabel] = useState<string | null>(null);

  useEffect(() => {
    const auth = loadAuth();
    if (!auth?.token) {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => {
      setUserLabel(auth.user.nome ?? auth.user.email ?? null);
      setReady(true);
    });
  }, [router]);

  function handleLogout() {
    performLogout();
    router.replace("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="size-8 animate-spin text-slate-500" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
      <header className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-sm font-semibold text-slate-900">
          Sistema de Pousada
        </span>
        <div className="flex items-center gap-3">
          {userLabel ? (
            <span className="max-w-[200px] truncate text-sm text-slate-600">
              {userLabel}
            </span>
          ) : null}
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <LogOut className="size-4 shrink-0" aria-hidden />
            Sair
          </button>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
