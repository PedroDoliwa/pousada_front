"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DashboardHeader } from "@/features/dashboard";
import { Sidebar } from "@/features/dashboard";

export function DashboardChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // A proteção de rota agora é feita por cookie httpOnly (middleware/server).
    // No cliente, apenas liberamos o layout após mount.
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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar onLogout={handleLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />
        <main className="flex min-h-0 flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}

