"use client";

import {
  AlertTriangle,
  BedDouble,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  createPousadaServer,
  deletePousadaServer,
  updatePousadaServer,
} from "@/features/pousada/actions";
import { useActivePousada } from "@/features/pousada";
import { listQuartosServer } from "@/features/quartos/actions";
import { listReservasServer } from "@/features/reservas/actions";
import { formatCurrencyBRL } from "@/features/reservas/utils";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import type { Pousada, Quarto, Reserva } from "@/types/entities";

type StatusFilter = "todas" | "ativas" | "inativas";

type PousadaExtras = {
  quartos: Quarto[];
  reservas: Reserva[];
};

type FormState = {
  nome: string;
  endereco: string;
  telefone: string;
  email: string;
  descricao: string;
};

const PAGE_SIZE = 5;

const emptyForm = (): FormState => ({
  nome: "",
  endereco: "",
  telefone: "",
  email: "",
  descricao: "",
});

function apiErrorMessage(err: unknown, fallback: string): string | null {
  if (handleApiErrorForClient(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

function isAtiva(pousada: Pousada): boolean {
  return pousada.ativa ?? true;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function currentMonthReservations(reservas: Reserva[]): Reserva[] {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  return reservas.filter((reserva) => {
    if (reserva.status.toLowerCase().includes("cancel")) return false;
    const entrada = new Date(reserva.dataEntrada);
    return entrada.getMonth() === month && entrada.getFullYear() === year;
  });
}

function formatAddressLines(endereco: string): string[] {
  const parts = endereco
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 2) return [endereco];
  return [parts.slice(0, 2).join(", "), parts.slice(2).join(", ")];
}

function statusBadgeClass(pousada: Pousada): string {
  return isAtiva(pousada)
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20"
    : "bg-slate-100 text-slate-600 ring-slate-500/20";
}

function PousadaCover({ pousada }: { pousada: Pousada }) {
  return (
    <div className="relative h-14 w-20 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-200 via-amber-100 to-blue-200 shadow-sm ring-1 ring-slate-200">
      <div className="absolute inset-x-0 bottom-0 h-7 bg-emerald-700/70" />
      <div className="absolute bottom-2 left-2 h-5 w-8 rounded-sm bg-amber-900/70" />
      <div className="absolute bottom-3 left-5 h-3 w-3 rounded-sm bg-white/75" />
      <div className="absolute right-2 top-2 rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-bold text-slate-700">
        {getInitials(pousada.nome) || "P"}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  tone,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  helper: string;
  tone: "blue" | "green" | "violet" | "amber";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  }[tone];

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <span
          className={`inline-flex size-12 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
        >
          <Icon className="size-6" aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium text-slate-600">{label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-1 text-xs text-slate-500">{helper}</p>
        </div>
      </div>
    </article>
  );
}

export function PousadasView() {
  const router = useRouter();
  const { pousadas, selectedId, setSelectedId } = useActivePousada();
  const [rows, setRows] = useState<Pousada[]>(pousadas);
  const [extras, setExtras] = useState<Record<number, PousadaExtras>>({});
  const [loadingExtras, setLoadingExtras] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todas");
  const [page, setPage] = useState(1);
  const [selectedPousadaId, setSelectedPousadaId] = useState<number | null>(
    selectedId ?? pousadas[0]?.id ?? null
  );
  const [modal, setModal] = useState<
    { mode: "create" } | { mode: "edit"; pousada: Pousada } | null
  >(null);
  const [deleteTarget, setDeleteTarget] = useState<Pousada | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (rows.length === 0) {
      queueMicrotask(() => {
        if (!cancelled) {
          setExtras({});
          setLoadingExtras(false);
        }
      });
      return;
    }

    (async () => {
      setLoadingExtras(true);
      setError(null);
      const entries = await Promise.all(
        rows.map(async (pousada) => {
          try {
            const [quartos, reservas] = await Promise.all([
              listQuartosServer(pousada.id),
              listReservasServer(pousada.id),
            ]);
            return [pousada.id, { quartos, reservas }] as const;
          } catch (err) {
            const msg = apiErrorMessage(
              err,
              "Não foi possível carregar os indicadores das pousadas."
            );
            if (msg && !cancelled) setError(msg);
            return [pousada.id, { quartos: [], reservas: [] }] as const;
          }
        })
      );
      if (!cancelled) {
        setExtras(Object.fromEntries(entries));
        setLoadingExtras(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [rows]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((pousada) => {
      const matchesSearch =
        !q ||
        pousada.nome.toLowerCase().includes(q) ||
        pousada.endereco.toLowerCase().includes(q) ||
        pousada.email.toLowerCase().includes(q) ||
        pousada.telefone.toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "todas" ||
        (statusFilter === "ativas" && isAtiva(pousada)) ||
        (statusFilter === "inativas" && !isAtiva(pousada));
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const totals = useMemo(() => {
    const allExtras = Object.values(extras);
    const quartos = allExtras.reduce(
      (sum, item) => sum + item.quartos.length,
      0
    );
    const reservasMes = allExtras.reduce(
      (sum, item) => sum + currentMonthReservations(item.reservas).length,
      0
    );
    const faturamentoMes = allExtras.reduce(
      (sum, item) =>
        sum +
        currentMonthReservations(item.reservas).reduce(
          (subtotal, reserva) => subtotal + reserva.valorTotal,
          0
        ),
      0
    );
    return { quartos, reservasMes, faturamentoMes };
  }, [extras]);

  const rangeStart =
    filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filtered.length);

  function openCreate() {
    setForm(emptyForm());
    setModal({ mode: "create" });
  }

  function openEdit(pousada: Pousada) {
    setForm({
      nome: pousada.nome,
      endereco: pousada.endereco,
      telefone: pousada.telefone,
      email: pousada.email,
      descricao: pousada.descricao ?? "",
    });
    setModal({ mode: "edit", pousada });
  }

  function selectPousada(pousada: Pousada) {
    setSelectedPousadaId(pousada.id);
    setSelectedId(pousada.id);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = {
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
      telefone: form.telefone.trim(),
      email: form.email.trim(),
      descricao: form.descricao.trim() || null,
    };

    if (!body.nome || !body.endereco || !body.telefone || !body.email) {
      setError("Preencha nome, endereço, telefone e e-mail da pousada.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (modal?.mode === "edit") {
        await updatePousadaServer(modal.pousada.id, {
          id: modal.pousada.id,
          ...body,
        });
        setRows((current) =>
          current.map((pousada) =>
            pousada.id === modal.pousada.id ? { ...pousada, ...body } : pousada
          )
        );
        setSelectedPousadaId(modal.pousada.id);
        if (selectedId === modal.pousada.id) setSelectedId(modal.pousada.id);
      } else {
        const created = await createPousadaServer(body);
        setRows((current) => [...current, created]);
        setSelectedPousadaId(created.id);
        setSelectedId(created.id);
      }
      setModal(null);
      setForm(emptyForm());
      router.refresh();
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível salvar a pousada.");
      if (msg) setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    try {
      await deletePousadaServer(deleteTarget.id);
      const remaining = rows.filter((pousada) => pousada.id !== deleteTarget.id);
      const nextSelected = remaining[0] ?? null;

      setRows(remaining);
      if (selectedPousadaId === deleteTarget.id) {
        setSelectedPousadaId(nextSelected?.id ?? null);
        if (nextSelected) setSelectedId(nextSelected.id);
      }
      setDeleteTarget(null);
      router.refresh();
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível excluir a pousada.");
      if (msg) setError(msg);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-6 py-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Buscar pousada..."
              className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="todas">Todas as pousadas</option>
            <option value="ativas">Somente ativas</option>
            <option value="inativas">Somente inativas</option>
          </select>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus className="size-4" aria-hidden />
          Nova Pousada
        </button>
      </div>

      {error ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{error}</p>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Building2}
          label="Total de Pousadas"
          value={String(rows.length)}
          helper="Pousadas cadastradas"
          tone="blue"
        />
        <StatCard
          icon={BedDouble}
          label="Total de Quartos"
          value={loadingExtras ? "..." : String(totals.quartos)}
          helper="Quartos cadastrados"
          tone="green"
        />
        <StatCard
          icon={CalendarDays}
          label="Reservas no mês"
          value={loadingExtras ? "..." : String(totals.reservasMes)}
          helper="Reservas confirmadas"
          tone="violet"
        />
        <StatCard
          icon={Building2}
          label="Faturamento no mês"
          value={
            loadingExtras ? "..." : formatCurrencyBRL(totals.faturamentoMes)
          }
          helper="Total das pousadas"
          tone="amber"
        />
      </section>

      <div className="min-h-0">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="text-base font-semibold text-slate-900">
              Lista de Pousadas
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="w-36 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Selecionada
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Pousada
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Endereço
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quartos
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Telefone
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Nenhuma pousada encontrada.
                    </td>
                  </tr>
                ) : (
                  paginated.map((pousada) => {
                    const isSelected = selectedPousadaId === pousada.id;
                    const pousadaExtras = extras[pousada.id];
                    const addressLines = formatAddressLines(pousada.endereco);
                    return (
                      <tr
                        key={pousada.id}
                        className={
                          isSelected
                            ? "bg-blue-50/70"
                            : "transition hover:bg-slate-50"
                        }
                      >
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => selectPousada(pousada)}
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset transition ${
                              isSelected
                                ? "bg-blue-600 text-white ring-blue-600"
                                : "bg-white text-slate-600 ring-slate-200 hover:bg-blue-50 hover:text-blue-700 hover:ring-blue-200"
                            }`}
                          >
                            <CheckCircle2 className="size-4" aria-hidden />
                            {isSelected ? "Selecionada" : "Selecionar"}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => selectPousada(pousada)}
                            className="flex items-center gap-3 text-left"
                          >
                            <PousadaCover pousada={pousada} />
                            <span>
                              <span className="block font-semibold text-slate-900">
                                {pousada.nome}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {addressLines.map((line) => (
                            <span key={line} className="block">
                              {line}
                            </span>
                          ))}
                        </td>
                        <td className="px-5 py-4 tabular-nums text-slate-700">
                          {loadingExtras
                            ? "..."
                            : (pousadaExtras?.quartos.length ?? 0)}
                        </td>
                        <td className="px-5 py-4 text-slate-700">
                          {pousada.telefone}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(pousada)}`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                isAtiva(pousada)
                                  ? "bg-emerald-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {isAtiva(pousada) ? "Ativa" : "Inativa"}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEdit(pousada)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-blue-700"
                              title="Editar pousada"
                            >
                              <Pencil className="size-4" aria-hidden />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(pousada)}
                              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700"
                              title="Excluir pousada"
                            >
                              <Trash2 className="size-4" aria-hidden />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {filtered.length === 0
                ? "Nenhuma pousada"
                : `Mostrando ${rangeStart} a ${rangeEnd} de ${filtered.length} pousadas`}
            </p>
            <div className="inline-flex items-center gap-2 self-start sm:self-auto">
              <button
                type="button"
                disabled={safePage <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white">
                {safePage}
              </span>
              <button
                type="button"
                disabled={safePage >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Próxima página"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </section>
      </div>

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!deleting) setDeleteTarget(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="size-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Excluir pousada?
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  A pousada <strong>{deleteTarget.nome}</strong> será removida.
                  Esta ação pode afetar quartos, reservas e relatórios
                  vinculados no backend.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void confirmDelete()}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Excluindo..." : "Excluir pousada"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {modal ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => {
            if (!saving) setModal(null);
          }}
        >
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  {modal.mode === "create" ? "Nova Pousada" : "Editar Pousada"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Preencha os dados básicos para manter o cadastro atualizado.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setModal(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                aria-label="Fechar"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">Nome</span>
                <input
                  value={form.nome}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nome: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Pousada Recanto do Sol"
                  required
                />
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Endereço
                </span>
                <input
                  value={form.endereco}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      endereco: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Rua das Palmeiras, 123, Centro"
                  required
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">
                  Telefone
                </span>
                <input
                  value={form.telefone}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      telefone: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="(48) 99999-1234"
                  required
                />
              </label>
              <label>
                <span className="text-sm font-medium text-slate-700">
                  E-mail
                </span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="contato@pousada.com.br"
                  required
                />
              </label>
              <label className="sm:col-span-2">
                <span className="text-sm font-medium text-slate-700">
                  Descrição
                </span>
                <textarea
                  value={form.descricao}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      descricao: event.target.value,
                    }))
                  }
                  className="mt-1 min-h-24 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  placeholder="Descreva a pousada, localização e diferenciais."
                />
              </label>

              <div className="mt-2 flex justify-end gap-2 sm:col-span-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setModal(null)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar pousada"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
