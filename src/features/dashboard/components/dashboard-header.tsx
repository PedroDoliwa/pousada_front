"use client";

import { CalendarDays } from "lucide-react";
import { useMemo } from "react";
import { useActivePousadaOptional } from "@/features/pousada";

export function DashboardHeader() {
  const activePousada = useActivePousadaOptional();
  const selectedPousada = activePousada?.selected;
  const pousadaName = selectedPousada?.nome ?? "Sem pousada";

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  return (
    <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
      <div className="border-l-4 border-blue-600 pl-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {pousadaName}
        </h1>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <CalendarDays className="size-4 text-slate-500" aria-hidden />
          <span className="hidden capitalize sm:inline">{dateLabel}</span>
        </button>
      </div>
    </header>
  );
}

