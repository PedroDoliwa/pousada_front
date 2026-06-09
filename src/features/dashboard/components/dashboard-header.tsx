"use client";

import { Bell, CalendarDays, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { PousadaSelector } from "@/features/dashboard/components/pousada-selector";
import { useDashboardUiOptional } from "@/features/dashboard/dashboard-ui-context";
import { useActivePousadaOptional } from "@/features/pousada";

export function DashboardHeader() {
  const dashboardUi = useDashboardUiOptional();
  const pendingIcalCount = dashboardUi?.pendingIcalCount ?? 0;
  const pathname = usePathname();
  const activePousada = useActivePousadaOptional();
  const pousadas = activePousada?.pousadas ?? [];
  const selectedId = activePousada?.selectedId ?? null;
  const setSelectedId = activePousada?.setSelectedId;

  const isDashboard = pathname === "/dashboard";

  const dateLabel = useMemo(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    return `Hoje, ${formatted}`;
  }, []);

  return (
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
      <div className="min-w-0 border-l-4 border-blue-600 pl-3">
        {pousadas.length > 0 && setSelectedId ? (
          <PousadaSelector
            pousadas={pousadas}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        ) : (
          <>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Sem pousada
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              <Link
                href="/pousadas"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Cadastre sua primeira pousada
              </Link>
            </p>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isDashboard && pendingIcalCount > 0 ? (
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
            aria-label={`${pendingIcalCount} notificações`}
          >
            <Bell className="size-4" aria-hidden />
            <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {pendingIcalCount > 9 ? "9+" : pendingIcalCount}
            </span>
          </button>
        ) : null}

        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <CalendarDays className="size-4 text-slate-500" aria-hidden />
          <span className="hidden capitalize sm:inline">{dateLabel}</span>
          <ChevronDown className="size-4 text-slate-400" aria-hidden />
        </button>
      </div>
    </header>
  );
}
