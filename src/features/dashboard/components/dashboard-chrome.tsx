"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { SessionUser } from "@/features/auth/session-user";
import { DashboardHeader } from "@/features/dashboard";
import { Sidebar } from "@/features/dashboard";
import { DashboardUiProvider } from "@/features/dashboard/dashboard-ui-context";

export function DashboardChrome({
  children,
  user,
}: {
  children: React.ReactNode;
  user: SessionUser | null;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
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
    <DashboardUiProvider>
      <div className="flex min-h-screen bg-[#F8FAFC]">
        <Sidebar user={user} onLogout={handleLogout} />
        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader />
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </DashboardUiProvider>
  );
}
