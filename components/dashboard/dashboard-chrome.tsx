"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Sidebar } from "@/components/dashboard/sidebar";
import { performLogout } from "@/lib/auth/logout";
import { loadAuth, type StoredAuth } from "@/lib/auth/session";

export function DashboardChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [auth, setAuth] = useState<StoredAuth | null>(null);

  useEffect(() => {
    const a = loadAuth();
    if (!a?.token) {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => setAuth(a));
  }, [router]);

  function handleLogout() {
    performLogout();
    router.replace("/login");
    router.refresh();
  }

  if (!auth) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="size-8 animate-spin text-slate-500" aria-hidden />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar auth={auth} onLogout={handleLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader userName={auth.user.nome} />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
