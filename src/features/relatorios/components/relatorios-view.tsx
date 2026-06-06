"use client";

import {
  ArrowDown,
  ArrowUp,
  BedDouble,
  CalendarDays,
  Download,
  Filter,
  Loader2,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useActivePousada } from "@/features/pousada";
import { formatCurrencyBRL, nightsBetween } from "@/features/reservas/utils";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import type { Hospede, Quarto, Reserva, ReservaOrigem } from "@/types/entities";

type RelatoriosData = {
  quartos: Quarto[];
  reservas: Reserva[];
  hospedes: Hospede[];
};

type Props = {
  loadData: (pousadaId: number) => Promise<RelatoriosData>;
};

type OrigemFilter = "todas" | ReservaOrigem;
type StatusFilter = "todos" | "Confirmada" | "Pendente" | "Cancelada";

const ORIGEM_OPTIONS: OrigemFilter[] = [
  "todas",
  "Manual",
  "Airbnb",
  "Booking",
];

const STATUS_OPTIONS: StatusFilter[] = [
  "todos",
  "Confirmada",
  "Pendente",
  "Cancelada",
];

function apiErrorMessage(err: unknown, fallback: string): string | null {
  if (handleApiErrorForClient(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

function dateToInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function defaultPeriod(): { start: string; end: string } {
  const now = new Date();
  return {
    start: dateToInput(new Date(now.getFullYear(), now.getMonth(), 1)),
    end: dateToInput(new Date(now.getFullYear(), now.getMonth() + 1, 0)),
  };
}

function parseStart(value: string): Date {
  return new Date(`${value}T00:00:00`);
}

function parseEnd(value: string): Date {
  return new Date(`${value}T23:59:59`);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function daysInclusive(start: Date, end: Date): number {
  const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(
    1,
    Math.round((endDay.getTime() - startDay.getTime()) / 86_400_000) + 1
  );
}

function isCancelled(reserva: Reserva): boolean {
  return reserva.status.toLowerCase().includes("cancel");
}

function overlapsPeriod(reserva: Reserva, start: Date, end: Date): boolean {
  const entrada = new Date(reserva.dataEntrada);
  const saida = new Date(reserva.dataSaida);
  return entrada <= end && saida >= start;
}

function reservationNightsInPeriod(
  reserva: Reserva,
  start: Date,
  end: Date
): number {
  const entrada = new Date(reserva.dataEntrada);
  const saida = new Date(reserva.dataSaida);
  const clippedStart = entrada > start ? entrada : start;
  const clippedEnd = saida < end ? saida : end;
  if (clippedEnd <= clippedStart) return 0;
  return nightsBetween(clippedStart.toISOString(), clippedEnd.toISOString());
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function trend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

function origemLabel(origem: string): string {
  if (origem === "Manual") return "Direto";
  return origem;
}

function dateLabel(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function shortDateLabel(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

function MetricCard({
  icon: Icon,
  title,
  value,
  trendValue,
  tone,
}: {
  icon: typeof CalendarDays;
  title: string;
  value: string;
  trendValue: number;
  tone: "blue" | "green" | "amber" | "violet" | "red";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    red: "bg-red-50 text-red-600",
  }[tone];
  const positive = trendValue >= 0;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex gap-4">
        <span
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p
            className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
              positive ? "text-emerald-700" : "text-red-700"
            }`}
          >
            {positive ? (
              <ArrowUp className="size-3" aria-hidden />
            ) : (
              <ArrowDown className="size-3" aria-hidden />
            )}
            {Math.abs(Math.round(trendValue))}% em relação ao período anterior
          </p>
        </div>
      </div>
    </article>
  );
}

function RevenueLineChart({
  data,
}: {
  data: Array<{ date: string; value: number }>;
}) {
  const width = 720;
  const height = 220;
  const padding = 32;
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data.map((item, index) => {
    const x =
      data.length === 1
        ? width / 2
        : padding + (index * (width - padding * 2)) / (data.length - 1);
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return { ...item, x, y };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-slate-900">Faturamento por dia</h2>
        <span className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-600">
          Diário
        </span>
      </div>
      <div className="mt-5 overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="min-w-[620px]"
          role="img"
          aria-label="Gráfico de faturamento por dia"
        >
          {[0, 0.25, 0.5, 0.75, 1].map((step) => {
            const y = height - padding - step * (height - padding * 2);
            return (
              <g key={step}>
                <line
                  x1={padding}
                  x2={width - padding}
                  y1={y}
                  y2={y}
                  stroke="#e2e8f0"
                />
                <text x={0} y={y + 4} className="fill-slate-500 text-[10px]">
                  {formatCurrencyBRL(max * step).replace(",00", "")}
                </text>
              </g>
            );
          })}
          <path d={path} fill="none" stroke="#2563eb" strokeWidth="3" />
          {points.map((point) => (
            <circle
              key={point.date}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="#2563eb"
              stroke="white"
              strokeWidth="2"
            />
          ))}
          {points.map((point, index) =>
            index % Math.ceil(points.length / 6) === 0 ||
            index === points.length - 1 ? (
              <text
                key={`${point.date}-label`}
                x={point.x}
                y={height - 8}
                textAnchor="middle"
                className="fill-slate-500 text-[10px]"
              >
                {shortDateLabel(point.date)}
              </text>
            ) : null
          )}
        </svg>
      </div>
    </div>
  );
}

function DonutCard({
  title,
  center,
  subtitle,
  segments,
}: {
  title: string;
  center: string;
  subtitle: string;
  segments: Array<{ label: string; value: number; color: string }>;
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0);
  let cursor = 0;
  const gradient =
    total === 0
      ? "#e2e8f0 0 100%"
      : segments
          .map((item) => {
            const start = cursor;
            const end = cursor + (item.value / total) * 100;
            cursor = end;
            return `${item.color} ${start}% ${end}%`;
          })
          .join(", ");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="font-semibold text-slate-900">{title}</h2>
      <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
        <div
          className="grid size-36 shrink-0 place-items-center rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="grid size-24 place-items-center rounded-full bg-white text-center">
            <div>
              <p className="text-2xl font-bold text-slate-900">{center}</p>
              <p className="text-xs text-slate-500">{subtitle}</p>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          {segments.map((item) => {
            const pct = total === 0 ? 0 : (item.value / total) * 100;
            return (
              <div key={item.label} className="flex items-center gap-3 text-sm">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="flex-1 text-slate-700">{item.label}</span>
                <span className="font-medium text-slate-900">
                  {formatPercent(pct)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function RelatoriosView({ loadData }: Props) {
  const { selectedId: pousadaId, pousadas } = useActivePousada();
  const initialPeriod = useMemo(() => defaultPeriod(), []);
  const [start, setStart] = useState(initialPeriod.start);
  const [end, setEnd] = useState(initialPeriod.end);
  const [origemFilter, setOrigemFilter] = useState<OrigemFilter>("todas");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [hospedes, setHospedes] = useState<Hospede[]>([]);

  useEffect(() => {
    if (pousadaId == null) {
      queueMicrotask(() => {
        setLoading(false);
        setQuartos([]);
        setReservas([]);
        setHospedes([]);
        setError(
          pousadas.length === 0
            ? "Cadastre uma pousada antes de visualizar relatórios."
            : "Selecione uma pousada ativa no painel."
        );
      });
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await loadData(pousadaId);
        if (!cancelled) {
          setQuartos(data.quartos);
          setReservas(data.reservas);
          setHospedes(data.hospedes);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = apiErrorMessage(
            err,
            "Não foi possível carregar os relatórios."
          );
          if (msg) setError(msg);
          setQuartos([]);
          setReservas([]);
          setHospedes([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadData, pousadaId, pousadas.length]);

  const quartoById = useMemo(() => {
    const map = new Map<number, Quarto>();
    for (const quarto of quartos) map.set(quarto.id, quarto);
    return map;
  }, [quartos]);

  const hospedeById = useMemo(() => {
    const map = new Map<number, Hospede>();
    for (const hospede of hospedes) map.set(hospede.id, hospede);
    return map;
  }, [hospedes]);

  const startDate = useMemo(() => parseStart(start), [start]);
  const endDate = useMemo(() => parseEnd(end), [end]);
  const periodDays = daysInclusive(startDate, endDate);

  const filteredReservas = useMemo(
    () =>
      reservas.filter((reserva) => {
        const origem = reserva.origem ?? "Manual";
        return (
          overlapsPeriod(reserva, startDate, endDate) &&
          (origemFilter === "todas" || origem === origemFilter) &&
          (statusFilter === "todos" || reserva.status === statusFilter)
        );
      }),
    [endDate, origemFilter, reservas, startDate, statusFilter]
  );

  const previousReservas = useMemo(() => {
    const previousEnd = addDays(startDate, -1);
    const previousStart = addDays(previousEnd, -(periodDays - 1));
    return reservas.filter((reserva) => {
      const origem = reserva.origem ?? "Manual";
      return (
        overlapsPeriod(reserva, previousStart, previousEnd) &&
        (origemFilter === "todas" || origem === origemFilter) &&
        (statusFilter === "todos" || reserva.status === statusFilter)
      );
    });
  }, [origemFilter, periodDays, reservas, startDate, statusFilter]);

  function summarize(list: Reserva[]) {
    const valid = list.filter((reserva) => !isCancelled(reserva));
    const revenue = valid.reduce((sum, reserva) => sum + reserva.valorTotal, 0);
    const uniqueHospedes = new Set(valid.map((reserva) => reserva.hospedeId)).size;
    const occupiedNights = valid.reduce(
      (sum, reserva) =>
        sum + reservationNightsInPeriod(reserva, startDate, endDate),
      0
    );
    const capacity = Math.max(1, quartos.length * periodDays);
    return {
      reservations: valid.length,
      revenue,
      uniqueHospedes,
      cancellations: list.filter(isCancelled).length,
      occupancy: Math.min(100, (occupiedNights / capacity) * 100),
    };
  }

  const currentSummary = summarize(filteredReservas);
  const previousSummary = summarize(previousReservas);

  const dailyRevenue = useMemo(() => {
    const days = Array.from({ length: periodDays }, (_, index) => {
      const date = addDays(startDate, index);
      return { date: dateToInput(date), value: 0 };
    });
    for (const reserva of filteredReservas) {
      if (isCancelled(reserva)) continue;
      const entrada = dateToInput(new Date(reserva.dataEntrada));
      const match = days.find((item) => item.date === entrada);
      if (match) match.value += reserva.valorTotal;
    }
    return days;
  }, [filteredReservas, periodDays, startDate]);

  const roomRevenue = useMemo(() => {
    const map = new Map<number, { quarto: Quarto | undefined; revenue: number; reservations: number; nights: number }>();
    for (const quarto of quartos) {
      map.set(quarto.id, { quarto, revenue: 0, reservations: 0, nights: 0 });
    }
    for (const reserva of filteredReservas) {
      if (isCancelled(reserva)) continue;
      const entry =
        map.get(reserva.quartoId) ??
        { quarto: quartoById.get(reserva.quartoId), revenue: 0, reservations: 0, nights: 0 };
      entry.revenue += reserva.valorTotal;
      entry.reservations += 1;
      entry.nights += reservationNightsInPeriod(reserva, startDate, endDate);
      map.set(reserva.quartoId, entry);
    }
    return Array.from(map.entries())
      .map(([quartoId, item]) => ({ quartoId, ...item }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [endDate, filteredReservas, quartoById, quartos, startDate]);

  const origemSegments = useMemo(() => {
    const colors: Record<string, string> = {
      Manual: "#2563eb",
      Airbnb: "#22c55e",
      Booking: "#f59e0b",
      Outro: "#8b5cf6",
    };
    return ["Manual", "Airbnb", "Booking"].map((origem) => ({
      label: origemLabel(origem),
      value: filteredReservas.filter(
        (reserva) => !isCancelled(reserva) && (reserva.origem ?? "Manual") === origem
      ).length,
      color: colors[origem]!,
    }));
  }, [filteredReservas]);

  const occupancySegments = [
    {
      label: "Ocupado",
      value: currentSummary.occupancy,
      color: "#22c55e",
    },
    {
      label: "Disponível",
      value: Math.max(0, 100 - currentSummary.occupancy),
      color: "#f59e0b",
    },
  ];

  function exportCsv() {
    const rows = filteredReservas.map((reserva) => {
      const quarto = quartoById.get(reserva.quartoId);
      const hospede = hospedeById.get(reserva.hospedeId);
      return [
        reserva.id,
        hospede?.nome ?? "",
        quarto?.numeroOuNome ?? `Quarto ${reserva.quartoId}`,
        reserva.status,
        reserva.origem ?? "Manual",
        reserva.dataEntrada,
        reserva.dataSaida,
        reserva.valorTotal,
      ];
    });
    const csv = [
      [
        "Reserva",
        "Hóspede",
        "Quarto",
        "Status",
        "Origem",
        "Entrada",
        "Saída",
        "Valor",
      ],
      ...rows,
    ]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replaceAll('"', '""')}"`)
          .join(";")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${start}-a-${end}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (error) {
    return (
      <div className="px-6 py-8">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Início</span>
            <input
              type="date"
              value={start}
              onChange={(event) => setStart(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Fim</span>
            <input
              type="date"
              value={end}
              onChange={(event) => setEnd(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Origem</span>
            <select
              value={origemFilter}
              onChange={(event) =>
                setOrigemFilter(event.target.value as OrigemFilter)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {ORIGEM_OPTIONS.map((origem) => (
                <option key={origem} value={origem}>
                  {origem === "todas" ? "Todas as origens" : origemLabel(origem)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-medium text-slate-600">Status</span>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "todos" ? "Todos os status" : status}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          type="button"
          onClick={exportCsv}
          disabled={filteredReservas.length === 0}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Download className="size-4" aria-hidden />
          Exportar relatório
        </button>
      </div>

      {loading ? (
        <div className="flex min-h-80 items-center justify-center rounded-xl border border-slate-200 bg-white">
          <Loader2 className="size-8 animate-spin text-slate-400" aria-hidden />
        </div>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <MetricCard
              icon={CalendarDays}
              title="Reservas no período"
              value={String(currentSummary.reservations)}
              trendValue={trend(
                currentSummary.reservations,
                previousSummary.reservations
              )}
              tone="violet"
            />
            <MetricCard
              icon={Filter}
              title="Faturamento bruto"
              value={formatCurrencyBRL(currentSummary.revenue)}
              trendValue={trend(currentSummary.revenue, previousSummary.revenue)}
              tone="green"
            />
            <MetricCard
              icon={BedDouble}
              title="Taxa de ocupação média"
              value={formatPercent(currentSummary.occupancy)}
              trendValue={trend(
                currentSummary.occupancy,
                previousSummary.occupancy
              )}
              tone="amber"
            />
            <MetricCard
              icon={Users}
              title="Hóspedes recebidos"
              value={String(currentSummary.uniqueHospedes)}
              trendValue={trend(
                currentSummary.uniqueHospedes,
                previousSummary.uniqueHospedes
              )}
              tone="blue"
            />
            <MetricCard
              icon={XCircle}
              title="Cancelamentos"
              value={String(currentSummary.cancellations)}
              trendValue={trend(
                currentSummary.cancellations,
                previousSummary.cancellations
              )}
              tone="red"
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
            <RevenueLineChart data={dailyRevenue} />
            <DonutCard
              title="Taxa de Ocupação"
              center={formatPercent(currentSummary.occupancy)}
              subtitle="Média no período"
              segments={occupancySegments}
            />
          </section>

          <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px_1fr]">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Faturamento por acomodação
              </h2>
              <div className="mt-5 space-y-4">
                {roomRevenue.slice(0, 6).map((item) => {
                  const maxRevenue = Math.max(
                    ...roomRevenue.map((room) => room.revenue),
                    1
                  );
                  return (
                    <div key={item.quartoId} className="grid gap-2">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-medium text-slate-700">
                          {item.quarto?.numeroOuNome ?? `Quarto ${item.quartoId}`}
                        </span>
                        <span className="text-slate-600">
                          {formatCurrencyBRL(item.revenue)}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100">
                        <div
                          className="h-2 rounded-full bg-blue-600"
                          style={{
                            width: `${Math.max(4, (item.revenue / maxRevenue) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DonutCard
              title="Origem das reservas"
              center={String(
                origemSegments.reduce((sum, item) => sum + item.value, 0)
              )}
              subtitle="Reservas"
              segments={origemSegments}
            />

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Resumo por acomodação
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Quarto</th>
                      <th className="px-4 py-3 font-semibold">Reservas</th>
                      <th className="px-4 py-3 font-semibold">Faturamento</th>
                      <th className="px-4 py-3 font-semibold">Ocupação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {roomRevenue.map((item) => {
                      const occupancy = Math.min(
                        100,
                        (item.nights / Math.max(1, periodDays)) * 100
                      );
                      return (
                        <tr key={item.quartoId}>
                          <td className="px-4 py-3 font-medium text-slate-900">
                            {item.quarto?.numeroOuNome ?? `Quarto ${item.quartoId}`}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {item.reservations}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {formatCurrencyBRL(item.revenue)}
                          </td>
                          <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                              {formatPercent(occupancy)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <footer className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Dados referentes ao período selecionado: {dateLabel(start)} até{" "}
              {dateLabel(end)}.
            </span>
            <span className="inline-flex items-center gap-2">
              Última atualização:{" "}
              {new Date().toLocaleString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              <RefreshCw className="size-4" aria-hidden />
            </span>
          </footer>
        </>
      )}
    </div>
  );
}
