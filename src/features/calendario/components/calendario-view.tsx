"use client";

import {
  BedDouble,
  CalendarCheck,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Percent,
  Plug,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import { useActivePousada } from "@/features/pousada";
import type { CalendarioData } from "@/features/calendario/actions";
import {
  buildDayCell,
  dayDiff,
  formatDateBR,
  isBloqueada,
  isCancelada,
  isImportada,
  nightsInRange,
  ocupacaoSubtitulo,
  ocupacaoTitulo,
  ocupacaoTone,
  periodLabel,
  rangeBounds,
  shiftAnchor,
  visibleDays,
  type ViewMode,
} from "@/features/calendario/utils";
import type { OcupacaoPeriodo, Quarto } from "@/types/entities";

type Props = {
  loadData: (
    pousadaId: number,
    de: string,
    ate: string
  ) => Promise<CalendarioData>;
};

const DAY_W = 44;
const ROOM_COL_W = 176;
const ROW_H = 56;
const BAR_H = 38;

const VIEW_OPTIONS: { id: ViewMode; label: string }[] = [
  { id: "mes", label: "Mês" },
  { id: "semana", label: "Semana" },
  { id: "lista", label: "Lista" },
];

function apiErrorMessage(err: unknown, fallback: string): string | null {
  if (handleApiErrorForClient(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

function LegendItem({ dot, label }: { dot: string; label: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-600">
      <span className={`size-2.5 rounded-full ${dot}`} aria-hidden />
      {label}
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <article className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <span
        className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
      >
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </p>
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
      </div>
    </article>
  );
}

export function CalendarioView({ loadData }: Props) {
  const router = useRouter();
  const { selectedId: pousadaId, pousadas } = useActivePousada();

  const [anchor, setAnchor] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("mes");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [ocupacao, setOcupacao] = useState<OcupacaoPeriodo[]>([]);

  const today = useMemo(() => new Date(), []);

  const gridMode: ViewMode = viewMode === "lista" ? "mes" : viewMode;

  const days = useMemo(
    () => visibleDays(anchor, gridMode),
    [anchor, gridMode]
  );

  const dayCells = useMemo(
    () => days.map((d) => buildDayCell(d, today)),
    [days, today]
  );

  const { de, ate } = useMemo(() => rangeBounds(days), [days]);

  useEffect(() => {
    if (pousadaId == null) {
      queueMicrotask(() => {
        setLoading(false);
        setQuartos([]);
        setOcupacao([]);
        setError(
          pousadas.length === 0
            ? "Cadastre uma pousada antes de visualizar o calendário."
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
        const data = await loadData(pousadaId, de, ate);
        if (!cancelled) {
          setQuartos(data.quartos);
          setOcupacao(data.ocupacao);
        }
      } catch (err) {
        if (!cancelled) {
          const msg = apiErrorMessage(
            err,
            "Não foi possível carregar o calendário."
          );
          if (msg) setError(msg);
          setQuartos([]);
          setOcupacao([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loadData, pousadaId, pousadas.length, de, ate]);

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

  const summary = useMemo(() => {
    const first = days[0]!;
    const last = days[days.length - 1]!;
    const rangeStart = new Date(
      first.getFullYear(),
      first.getMonth(),
      first.getDate()
    );
    const rangeEndExclusive = new Date(
      last.getFullYear(),
      last.getMonth(),
      last.getDate() + 1
    );

    const ativas = ocupacao.filter((o) => !isCancelada(o.status));
    const reservasValidas = ativas.filter((o) => !isBloqueada(o.status));
    const bloqueios = ativas.filter((o) => isBloqueada(o.status));
    const reservas = new Set(reservasValidas.map((o) => o.reservaId)).size;
    const importadas = new Set(
      reservasValidas.filter((o) => isImportada(o.origem)).map((o) => o.reservaId)
    ).size;
    const bloqueiosExternos = new Set(
      bloqueios.filter((o) => isImportada(o.origem)).map((o) => o.reservaId)
    ).size;

    const occupiedNights = ativas.reduce(
      (sum, o) => sum + nightsInRange(o, rangeStart, rangeEndExclusive),
      0
    );
    const capacity = Math.max(1, quartos.length * days.length);
    const occupancy = Math.min(100, (occupiedNights / capacity) * 100);

    return {
      reservas,
      importadas,
      bloqueiosExternos,
      occupancy,
      quartos: quartos.length,
    };
  }, [days, ocupacao, quartos.length]);

  const listaRows = useMemo(() => {
    return ocupacao
      .filter((o) => !isCancelada(o.status))
      .slice()
      .sort(
        (a, b) =>
          new Date(a.dataEntrada).getTime() - new Date(b.dataEntrada).getTime()
      );
  }, [ocupacao]);

  const trackWidth = days.length * DAY_W;

  function goToday() {
    setAnchor(new Date());
  }

  function openReserva(reservaId: number) {
    router.push(`/reservas/${reservaId}`);
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  if (error && quartos.length === 0) {
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
      {error ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setAnchor((a) => shiftAnchor(a, gridMode, -1))}
              className="grid size-9 place-items-center rounded-l-lg text-slate-600 hover:bg-slate-50"
              aria-label="Período anterior"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setAnchor((a) => shiftAnchor(a, gridMode, 1))}
              className="grid size-9 place-items-center border-l border-slate-200 text-slate-600 hover:bg-slate-50"
              aria-label="Próximo período"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <button
            type="button"
            onClick={goToday}
            className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Hoje
          </button>
          <span className="inline-flex items-center gap-2 px-1 text-base font-semibold capitalize text-slate-900">
            <CalendarDays className="size-4 text-slate-400" aria-hidden />
            {periodLabel(anchor, gridMode, days)}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-sm">
            {VIEW_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setViewMode(opt.id)}
                className={
                  viewMode === opt.id
                    ? "rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white"
                    : "rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
          <Link
            href="/integracoes-ical"
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Plug className="size-4 text-slate-500" aria-hidden />
            Importar iCal
          </Link>
        </div>
      </div>

      {quartos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <BedDouble className="mx-auto size-8 text-slate-300" aria-hidden />
          <p className="mt-3 text-sm font-medium text-slate-700">
            Nenhum quarto cadastrado nesta pousada.
          </p>
          <Link
            href="/quartos"
            className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            Cadastrar quartos
          </Link>
        </div>
      ) : viewMode === "lista" ? (
        <ListaView
          rows={listaRows}
          onOpen={openReserva}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <div style={{ minWidth: ROOM_COL_W + trackWidth }}>
              <div className="flex border-b border-slate-200 bg-slate-50">
                <div
                  className="sticky left-0 z-20 flex items-center bg-slate-50 px-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                  style={{ width: ROOM_COL_W, minWidth: ROOM_COL_W }}
                >
                  Quarto
                </div>
                <div className="flex" style={{ width: trackWidth }}>
                  {dayCells.map((cell) => (
                    <div
                      key={cell.key}
                      className={`flex flex-col items-center justify-center border-l border-slate-100 py-1.5 ${
                        cell.isToday
                          ? "bg-blue-50"
                          : cell.isWeekend
                            ? "bg-slate-100/60"
                            : ""
                      }`}
                      style={{ width: DAY_W, minWidth: DAY_W }}
                    >
                      <span className="text-[10px] uppercase text-slate-400">
                        {cell.weekdayShort}
                      </span>
                      <span
                        className={`text-xs font-semibold ${
                          cell.isToday ? "text-blue-600" : "text-slate-700"
                        }`}
                      >
                        {cell.dayNum}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {quartos.map((quarto) => {
                const reservas = ocupacaoByQuarto.get(quarto.id) ?? [];
                return (
                  <div
                    key={quarto.id}
                    className="flex border-b border-slate-100 last:border-b-0"
                  >
                    <div
                      className="sticky left-0 z-10 flex flex-col justify-center bg-white px-4"
                      style={{
                        width: ROOM_COL_W,
                        minWidth: ROOM_COL_W,
                        height: ROW_H,
                      }}
                    >
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {quarto.numeroOuNome}
                      </span>
                      <span className="text-xs text-slate-500">
                        {quarto.capacidade}{" "}
                        {quarto.capacidade === 1 ? "hóspede" : "hóspedes"}
                      </span>
                    </div>

                    <div
                      className="relative"
                      style={{ width: trackWidth, height: ROW_H }}
                    >
                      <div className="absolute inset-0 flex">
                        {dayCells.map((cell) => (
                          <div
                            key={cell.key}
                            className={`border-l border-slate-100 ${
                              cell.isToday
                                ? "bg-blue-50/50"
                                : cell.isWeekend
                                  ? "bg-slate-50"
                                  : "bg-emerald-50/40"
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
                          <button
                            key={o.reservaId}
                            type="button"
                            onClick={() => openReserva(o.reservaId)}
                            title={`${ocupacaoTitulo(o)} · ${formatDateBR(
                              o.dataEntrada
                            )} → ${formatDateBR(o.dataSaida)}${
                              o.observacoes ? ` · ${o.observacoes}` : ""
                            }`}
                            className={`absolute flex flex-col justify-center overflow-hidden rounded-md border px-2 text-left transition hover:brightness-95 ${tone.bar}`}
                            style={{
                              left: startIdx * DAY_W + 2,
                              width: span * DAY_W - 4,
                              top: (ROW_H - BAR_H) / 2,
                              height: BAR_H,
                            }}
                          >
                            <span className="truncate text-[11px] font-semibold leading-tight">
                              {ocupacaoTitulo(o)}
                            </span>
                            <span className="truncate text-[10px] leading-tight opacity-80">
                              {ocupacaoSubtitulo(o)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Legenda
        </span>
        <LegendItem dot="bg-emerald-300" label="Disponível" />
        <LegendItem dot="bg-blue-500" label="Reserva confirmada" />
        <LegendItem dot="bg-amber-400" label="Pendente" />
        <LegendItem dot="bg-violet-400" label="Importado (iCal)" />
        <LegendItem dot="bg-red-400" label="Bloqueio externo" />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900">Observações</h2>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
            <li>• Clique sobre uma reserva para abrir os detalhes.</li>
            <li>• Passe o mouse sobre uma reserva para ver o período.</li>
            <li>
              • Reservas importadas via iCal são atualizadas automaticamente.
            </li>
            <li>
              • Bloqueios externos indisponibilizam o quarto, mas não entram no
              total de reservas.
            </li>
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SummaryCard
            icon={Users}
            label="Reservas"
            value={String(summary.reservas)}
            tone="bg-blue-50 text-blue-600"
          />
          <SummaryCard
            icon={Percent}
            label="Taxa de ocupação"
            value={`${Math.round(summary.occupancy)}%`}
            tone="bg-emerald-50 text-emerald-600"
          />
          <SummaryCard
            icon={Plug}
            label="Importações"
            value={String(summary.importadas)}
            tone="bg-violet-50 text-violet-600"
          />
          <SummaryCard
            icon={BedDouble}
            label="Bloqueios externos"
            value={String(summary.bloqueiosExternos)}
            tone="bg-red-50 text-red-600"
          />
        </div>
      </div>
    </div>
  );
}

function ListaView({
  rows,
  onOpen,
}: {
  rows: OcupacaoPeriodo[];
  onOpen: (reservaId: number) => void;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
        <CalendarCheck className="mx-auto size-8 text-slate-300" aria-hidden />
        <p className="mt-3 text-sm font-medium text-slate-700">
          Nenhuma reserva neste período.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Quarto</th>
              <th className="px-4 py-3">Hóspede</th>
              <th className="px-4 py-3">Entrada</th>
              <th className="px-4 py-3">Saída</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((o) => {
              const tone = ocupacaoTone(o);
              return (
                <tr
                  key={o.reservaId}
                  onClick={() => onOpen(o.reservaId)}
                  className="cursor-pointer hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {o.quartoNumeroOuNome}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {o.tituloExterno?.trim() || o.hospedeNome?.trim() || "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDateBR(o.dataEntrada)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {formatDateBR(o.dataSaida)}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {o.origem ?? "Manual"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone.bar}`}
                    >
                      {o.status?.trim() || "—"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
