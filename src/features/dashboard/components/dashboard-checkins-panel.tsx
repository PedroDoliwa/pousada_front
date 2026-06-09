"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  formatDayMonth,
  formatTimeBR,
  isReservaAtiva,
} from "@/features/dashboard/utils";
import type { Hospede, Quarto, Reserva } from "@/types/entities";

type Tab = "checkins" | "checkouts";

type Props = {
  reservas: Reserva[];
  quartos: Quarto[];
  hospedes: Hospede[];
};

type AgendaItem = {
  reserva: Reserva;
  quartoNome: string;
  hospedeNome: string;
  dateIso: string;
  timeIso: string;
};

const HORIZON_DAYS = 14;
const MAX_ITEMS = 5;

export function DashboardCheckinsPanel({
  reservas,
  quartos,
  hospedes,
}: Props) {
  const [tab, setTab] = useState<Tab>("checkins");

  const quartoById = useMemo(() => {
    const m = new Map<number, Quarto>();
    for (const q of quartos) m.set(q.id, q);
    return m;
  }, [quartos]);

  const hospedeById = useMemo(() => {
    const m = new Map<number, Hospede>();
    for (const h of hospedes) m.set(h.id, h);
    return m;
  }, [hospedes]);

  const items = useMemo(() => {
    const now = new Date();
    const horizon = new Date(now);
    horizon.setDate(horizon.getDate() + HORIZON_DAYS);

    const list: AgendaItem[] = [];
    for (const r of reservas) {
      if (!isReservaAtiva(r.status)) continue;
      const dateIso = tab === "checkins" ? r.dataEntrada : r.dataSaida;
      const date = new Date(dateIso);
      if (date < now || date > horizon) continue;

      const quarto = quartoById.get(r.quartoId);
      const hospede = hospedeById.get(r.hospedeId);
      list.push({
        reserva: r,
        quartoNome: quarto?.numeroOuNome ?? `Quarto #${r.quartoId}`,
        hospedeNome:
          hospede?.nome?.trim() ||
          r.tituloExterno?.trim() ||
          "Hóspede",
        dateIso,
        timeIso: dateIso,
      });
    }

    return list
      .sort(
        (a, b) =>
          new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()
      )
      .slice(0, MAX_ITEMS);
  }, [reservas, quartoById, hospedeById, tab]);

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">
          Próximos Check-ins e Check-outs
        </h2>
        <div className="mt-3 flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          <button
            type="button"
            onClick={() => setTab("checkins")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === "checkins"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Check-ins
          </button>
          <button
            type="button"
            onClick={() => setTab("checkouts")}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition ${
              tab === "checkouts"
                ? "bg-blue-600 text-white shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Check-outs
          </button>
        </div>
      </div>

      <ul className="flex-1 divide-y divide-slate-100">
        {items.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-slate-500">
            Nenhum {tab === "checkins" ? "check-in" : "check-out"} nos próximos{" "}
            {HORIZON_DAYS} dias.
          </li>
        ) : (
          items.map((item) => {
            const { day, month } = formatDayMonth(item.dateIso);
            const capacidade =
              quartoById.get(item.reserva.quartoId)?.capacidade ?? 1;
            return (
              <li key={`${item.reserva.id}-${tab}`}>
                <Link
                  href={`/reservas/${item.reserva.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50"
                >
                  <div className="w-12 shrink-0 text-center">
                    <p className="text-lg font-bold leading-none text-slate-900">
                      {day}
                    </p>
                    <p className="mt-0.5 text-[10px] font-semibold uppercase text-slate-500">
                      {month}
                    </p>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-slate-900">
                      {item.hospedeNome}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {item.quartoNome}
                    </p>
                  </div>
                  <div className="shrink-0 text-right text-xs text-slate-500">
                    <p>
                      {capacidade}{" "}
                      {capacidade === 1 ? "hóspede" : "hóspedes"}
                    </p>
                    <p className="mt-0.5 font-medium text-slate-700">
                      {formatTimeBR(item.timeIso)}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })
        )}
      </ul>

      <div className="border-t border-slate-100 px-5 py-3">
        <Link
          href="/reservas"
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver todas as reservas →
        </Link>
      </div>
    </article>
  );
}
