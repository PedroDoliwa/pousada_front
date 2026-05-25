"use client";

import {
  AlertTriangle,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import { listHospedesServer } from "@/features/hospedes";
import { listQuartosServer } from "@/features/quartos/actions";
import {
  cancelReservaServer,
  listReservasServer,
} from "@/features/reservas/actions";
import {
  formatCurrencyBRL,
  formatDateTimeBR,
  formatReservaCodigo,
  isReservaImportada,
} from "@/features/reservas/utils";
import { useActivePousada } from "@/features/pousada";
import type { Hospede, Quarto, Reserva, ReservaOrigem } from "@/types/entities";

const STATUS_FILTERS = ["todos", "Confirmada", "Pendente", "Cancelada"] as const;
const ORIGEM_FILTERS = ["todas", "Manual", "Airbnb", "Booking", "Outro"] as const;

type StatusFilter = (typeof STATUS_FILTERS)[number];
type OrigemFilter = (typeof ORIGEM_FILTERS)[number];

function apiErrorMessage(err: unknown, fallback: string): string | null {
  if (handleApiErrorForClient(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s.includes("cancel")) return "bg-red-50 text-red-800 ring-red-600/20";
  if (s.includes("pend")) return "bg-amber-50 text-amber-900 ring-amber-600/20";
  return "bg-emerald-50 text-emerald-800 ring-emerald-600/20";
}

function origemBadgeClass(origem: string): string {
  switch (origem) {
    case "Airbnb":
      return "bg-violet-50 text-violet-800 ring-violet-600/20";
    case "Booking":
      return "bg-sky-50 text-sky-800 ring-sky-600/20";
    case "Manual":
      return "bg-blue-50 text-blue-800 ring-blue-600/20";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-500/20";
  }
}

function origemLabel(origem: ReservaOrigem | string): string {
  if (origem === "Booking") return "Booking.com";
  return origem;
}

const PAGE_SIZE = 10;

export function ReservasView() {
  const { selectedId: pousadaId, pousadas } = useActivePousada();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [origemFilter, setOrigemFilter] = useState<OrigemFilter>("todas");
  const [periodStart, setPeriodStart] = useState("");
  const [periodEnd, setPeriodEnd] = useState("");
  const [page, setPage] = useState(1);
  const [cancelTarget, setCancelTarget] = useState<Reserva | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

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

  useEffect(() => {
    if (pousadaId == null) {
      queueMicrotask(() => {
        setLoading(false);
        setReservas([]);
        if (pousadas.length === 0) {
          setError("Cadastre uma pousada antes de gerenciar reservas.");
        } else {
          setError("Selecione uma pousada ativa no painel.");
        }
      });
      return;
    }

    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const [r, q, h] = await Promise.all([
          listReservasServer(pousadaId),
          listQuartosServer(pousadaId),
          listHospedesServer(pousadaId),
        ]);
        if (!cancelled) {
          setReservas(r);
          setQuartos(q);
          setHospedes(h);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = apiErrorMessage(
            e,
            "Não foi possível carregar as reservas."
          );
          if (msg) setError(msg);
          setReservas([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, pousadaId, pousadas.length]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservas.filter((r) => {
      const hospede = hospedeById.get(r.hospedeId);
      const quarto = quartoById.get(r.quartoId);
      const codigo = formatReservaCodigo(r.id).toLowerCase();

      const matchesSearch =
        !q ||
        codigo.includes(q) ||
        hospede?.nome.toLowerCase().includes(q) ||
        quarto?.numeroOuNome.toLowerCase().includes(q);

      const matchesStatus =
        statusFilter === "todos" || r.status === statusFilter;

      const origem = r.origem ?? "Manual";
      const matchesOrigem =
        origemFilter === "todas" || origem === origemFilter;

      const entrada = new Date(r.dataEntrada);
      const matchesPeriod =
        (!periodStart || entrada >= new Date(`${periodStart}T00:00:00`)) &&
        (!periodEnd || entrada <= new Date(`${periodEnd}T23:59:59`));

      return matchesSearch && matchesStatus && matchesOrigem && matchesPeriod;
    });
  }, [
    reservas,
    search,
    statusFilter,
    origemFilter,
    periodStart,
    periodEnd,
    hospedeById,
    quartoById,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (Math.min(page, totalPages) - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, origemFilter, periodStart, periodEnd]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function clearFilters() {
    setSearch("");
    setStatusFilter("todos");
    setOrigemFilter("todas");
    setPeriodStart("");
    setPeriodEnd("");
  }

  async function confirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelReservaServer(cancelTarget.id);
      setCancelTarget(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível cancelar a reserva.");
      if (msg) setError(msg);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  if (error && reservas.length === 0) {
    return (
      <div className="px-6 py-8">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      </div>
    );
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  return (
    <div className="px-6 py-8">
      {error ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1 max-w-md">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar por hóspede, quarto ou código…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
              aria-label="Período início"
            />
            <span className="text-slate-400">—</span>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="rounded-lg border border-slate-300 px-2 py-2 text-sm"
              aria-label="Período fim"
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              aria-label="Status"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === "todos" ? "Todos os status" : s}
                </option>
              ))}
            </select>
            <select
              value={origemFilter}
              onChange={(e) =>
                setOrigemFilter(e.target.value as OrigemFilter)
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
              aria-label="Origem"
            >
              {ORIGEM_FILTERS.map((o) => (
                <option key={o} value={o}>
                  {o === "todas"
                    ? "Todas as origens"
                    : o === "Booking"
                      ? "Booking.com"
                      : o}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              Limpar filtros
            </button>
          </div>
        </div>
        <Link
          href="/reservas/nova"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden />
          Nova reserva
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700">Código</th>
                <th className="px-4 py-3 font-medium text-slate-700">Hóspede</th>
                <th className="px-4 py-3 font-medium text-slate-700">Quarto</th>
                <th className="px-4 py-3 font-medium text-slate-700">Entrada</th>
                <th className="px-4 py-3 font-medium text-slate-700">Saída</th>
                <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 font-medium text-slate-700">Origem</th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Valor total
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    Nenhuma reserva encontrada.
                  </td>
                </tr>
              ) : (
                paginated.map((r) => {
                  const hospede = hospedeById.get(r.hospedeId);
                  const quarto = quartoById.get(r.quartoId);
                  const imported = isReservaImportada(r.origem);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {formatReservaCodigo(r.id)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900">
                          {hospede?.nome ??
                            r.tituloExterno ??
                            "—"}
                        </p>
                        {hospede?.telefone ? (
                          <p className="text-xs text-slate-500">
                            {hospede.telefone}
                          </p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {quarto?.numeroOuNome ?? `Quarto ${r.quartoId}`}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDateTimeBR(r.dataEntrada)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatDateTimeBR(r.dataSaida)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(r.status)}`}
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${origemBadgeClass(r.origem ?? "Manual")}`}
                        >
                          {origemLabel(r.origem ?? "Manual")}
                        </span>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-slate-700">
                        {formatCurrencyBRL(r.valorTotal)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <Link
                            href={
                              imported
                                ? `/reservas/${r.id}`
                                : `/reservas/${r.id}/editar`
                            }
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title={imported ? "Ver" : "Editar"}
                          >
                            <Pencil className="size-4" aria-hidden />
                          </Link>
                          {r.status !== "Cancelada" ? (
                            <button
                              type="button"
                              onClick={() => setCancelTarget(r)}
                              className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                              title="Cancelar reserva"
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length === 0
            ? "Nenhuma reserva"
            : `Mostrando ${rangeStart} a ${rangeEnd} de ${filtered.length} reservas`}
        </p>
        {filtered.length > PAGE_SIZE ? (
          <div className="inline-flex gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="flex min-w-9 items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white">
              {page}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        ) : null}
      </div>

      {cancelTarget ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!cancelling) setCancelTarget(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex gap-3">
              <AlertTriangle className="size-5 text-red-600" />
              <div>
                <h2 className="text-lg font-semibold">Cancelar reserva?</h2>
                <p className="mt-2 text-sm text-slate-600">
                  {formatReservaCodigo(cancelTarget.id)} será marcada como
                  cancelada (o período deixa de contar na ocupação).
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void confirmCancel()}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm text-white"
              >
                {cancelling ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                Cancelar reserva
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
