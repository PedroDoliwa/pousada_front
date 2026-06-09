"use client";

import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import {
  buildDayCell,
  dayDiff,
  isCancelada,
  ocupacaoTone,
  visibleDays,
} from "@/features/calendario/utils";
import type { OcupacaoPeriodo, Quarto } from "@/types/entities";

const DAY_W = 28;
const ROOM_COL_W = 128;
const ROW_H = 40;
const BAR_H = 26;

type Props = {
  quartos: Quarto[];
  ocupacao: OcupacaoPeriodo[];
};

function LegendItem({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-600">
      <span className={`size-2 rounded-full ${dot}`} aria-hidden />
      {label}
    </div>
  );
}

export function DashboardOcupacaoResumo({ quartos, ocupacao }: Props) {
  const anchor = useMemo(() => new Date(), []);
  const today = useMemo(() => new Date(), []);

  const days = useMemo(() => visibleDays(anchor, "mes"), [anchor]);
  const dayCells = useMemo(
    () => days.map((d) => buildDayCell(d, today)),
    [days, today]
  );

  const ocupacaoByQuarto = useMemo(() => {
    const map = new Map<number, OcupacaoPeriodo[]>();
    for (const o of ocupacao) {
      if (isCancelada(o.status)) continue;
      const list = map.get(o.quartoId) ?? [];
      list.push(o);
      map.set(o.quartoId, list);
    }
    return map;
  }, [ocupacao]);

  const trackWidth = days.length * DAY_W;

  return (
    <article className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Resumo de Ocupação</h2>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <LegendItem dot="bg-emerald-300" label="Disponível" />
          <LegendItem dot="bg-blue-500" label="Reservado" />
          <LegendItem dot="bg-red-400" label="Bloqueado" />
          <LegendItem dot="bg-amber-400" label="Check-out" />
        </div>
      </div>

      {quartos.length === 0 ? (
        <p className="px-5 py-8 text-sm text-slate-500">
          Nenhum quarto cadastrado.
        </p>
      ) : (
        <div className="overflow-x-auto px-2 pb-2 pt-3">
          <div style={{ minWidth: ROOM_COL_W + trackWidth }}>
            <div className="flex border-b border-slate-100 bg-slate-50/80">
              <div
                className="sticky left-0 z-10 bg-slate-50/80 px-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400"
                style={{ width: ROOM_COL_W, minWidth: ROOM_COL_W }}
              >
                Quarto
              </div>
              <div className="flex" style={{ width: trackWidth }}>
                {dayCells.map((cell) => (
                  <div
                    key={cell.key}
                    className={`flex items-center justify-center border-l border-slate-100 text-[10px] font-medium ${
                      cell.isToday
                        ? "bg-blue-50 text-blue-600"
                        : "text-slate-500"
                    }`}
                    style={{ width: DAY_W, minWidth: DAY_W, height: 24 }}
                  >
                    {cell.dayNum}
                  </div>
                ))}
              </div>
            </div>

            {quartos.map((quarto) => {
              const reservas = ocupacaoByQuarto.get(quarto.id) ?? [];
              return (
                <div
                  key={quarto.id}
                  className="flex border-b border-slate-50 last:border-b-0"
                >
                  <div
                    className="sticky left-0 z-10 flex items-center bg-white px-3 text-xs font-medium text-slate-700"
                    style={{
                      width: ROOM_COL_W,
                      minWidth: ROOM_COL_W,
                      height: ROW_H,
                    }}
                  >
                    <span className="truncate">{quarto.numeroOuNome}</span>
                  </div>
                  <div
                    className="relative"
                    style={{ width: trackWidth, height: ROW_H }}
                  >
                    <div className="absolute inset-0 flex">
                      {dayCells.map((cell) => (
                        <div
                          key={cell.key}
                          className={`border-l border-slate-50 ${
                            cell.isToday
                              ? "bg-blue-50/40"
                              : cell.isWeekend
                                ? "bg-slate-50/80"
                                : "bg-emerald-50/30"
                          }`}
                          style={{ width: DAY_W, minWidth: DAY_W }}
                        />
                      ))}
                    </div>
                    {reservas.map((o) => {
                      const startIdx = Math.max(
                        0,
                        Math.min(
                          days.length - 1,
                          dayDiff(days[0]!, new Date(o.dataEntrada))
                        )
                      );
                      const endIdx = Math.max(
                        0,
                        Math.min(
                          days.length - 1,
                          dayDiff(days[0]!, new Date(o.dataSaida))
                        )
                      );
                      const span = Math.max(1, endIdx - startIdx + 1);
                      const tone = ocupacaoTone(o);
                      return (
                        <div
                          key={o.reservaId}
                          className={`absolute rounded-sm border ${tone.bar}`}
                          style={{
                            left: startIdx * DAY_W + 1,
                            width: span * DAY_W - 2,
                            top: (ROW_H - BAR_H) / 2,
                            height: BAR_H,
                          }}
                          title={o.hospedeNome ?? o.tituloExterno ?? "Reserva"}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="border-t border-slate-100 px-5 py-4 text-center">
        <Link
          href="/calendario"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <CalendarDays className="size-4 text-blue-600" aria-hidden />
          Ver calendário completo
        </Link>
      </div>
    </article>
  );
}
