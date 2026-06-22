"use client";

import {
  AlertTriangle,
  BedDouble,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import {
  createQuartoServer,
  deleteQuartoServer,
  listQuartosServer,
  updateQuartoServer,
} from "@/features/quartos/actions";
import { useActivePousada, PousadaGateShell } from "@/features/pousada";
import type { Quarto } from "@/types/entities";

const STATUS_OPTIONS = [
  "Disponível",
  "Ocupado",
  "Manutenção",
  "Indisponível",
] as const;

type StatusFilter = (typeof STATUS_OPTIONS)[number] | "todos";

type FormState = {
  numeroOuNome: string;
  capacidade: string;
  valorDiaria: string;
  status: string;
};

const emptyForm = (): FormState => ({
  numeroOuNome: "",
  capacidade: "2",
  valorDiaria: "",
  status: "Disponível",
});

function apiErrorMessage(err: unknown, fallback: string): string | null {
  if (handleApiErrorForClient(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function normalizeStatus(status: string): string {
  const s = status.trim().toLowerCase();
  if (s === "disponível" || s === "disponivel") return "Disponível";
  if (s === "ocupado") return "Ocupado";
  if (s === "manutenção" || s === "manutencao") return "Manutenção";
  if (s === "indisponível" || s === "indisponivel") return "Indisponível";
  return status.trim() || "—";
}

function statusBadgeClass(status: string): string {
  const n = normalizeStatus(status);
  switch (n) {
    case "Disponível":
      return "bg-emerald-50 text-emerald-800 ring-emerald-600/20";
    case "Ocupado":
      return "bg-blue-50 text-blue-800 ring-blue-600/20";
    case "Manutenção":
      return "bg-amber-50 text-amber-900 ring-amber-600/20";
    case "Indisponível":
      return "bg-red-50 text-red-800 ring-red-600/20";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-500/20";
  }
}

function statusDotClass(status: string): string {
  const n = normalizeStatus(status);
  switch (n) {
    case "Disponível":
      return "bg-emerald-500";
    case "Ocupado":
      return "bg-blue-500";
    case "Manutenção":
      return "bg-amber-500";
    case "Indisponível":
      return "bg-red-500";
    default:
      return "bg-slate-400";
  }
}

const PAGE_SIZE = 10;

export function QuartosView() {
  const { selectedId: pousadaId } = useActivePousada();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [page, setPage] = useState(1);
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<
    | { mode: "create" }
    | { mode: "edit"; quarto: Quarto }
    | null
  >(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Quarto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (pousadaId == null) {
      queueMicrotask(() => {
        setLoading(false);
        setQuartos([]);
      });
      return;
    }

    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const rows = await listQuartosServer(pousadaId);
        if (!cancelled) setQuartos(rows);
      } catch (e) {
        if (!cancelled) {
          const msg = apiErrorMessage(
            e,
            "Não foi possível carregar os quartos."
          );
          if (msg) setError(msg);
          setQuartos([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey, pousadaId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return quartos.filter((room) => {
      const matchesSearch =
        !q ||
        room.numeroOuNome.toLowerCase().includes(q) ||
        String(room.id).includes(q);
      const matchesStatus =
        statusFilter === "todos" ||
        normalizeStatus(room.status) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [quartos, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, pousadaId]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  function openCreate() {
    if (pousadaId == null) {
      setError("Selecione uma pousada ativa antes de cadastrar quartos.");
      return;
    }
    setForm(emptyForm());
    setModal({ mode: "create" });
  }

  function openEdit(room: Quarto) {
    setForm({
      numeroOuNome: room.numeroOuNome ?? "",
      capacidade: String(room.capacidade),
      valorDiaria: String(room.valorDiaria),
      status: normalizeStatus(room.status),
    });
    setModal({ mode: "edit", quarto: room });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const numeroOuNome = form.numeroOuNome.trim();
    const capacidade = Number.parseInt(form.capacidade, 10);
    const valorDiaria = Number.parseFloat(
      form.valorDiaria.replace(",", ".")
    );
    if (!numeroOuNome || !Number.isFinite(capacidade) || capacidade < 1) {
      return;
    }
    if (!Number.isFinite(valorDiaria) || valorDiaria < 0) {
      return;
    }
    if (pousadaId == null) {
      setError("Selecione uma pousada ativa antes de salvar.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (modal?.mode === "create") {
        await createQuartoServer({
          pousadaId,
          numeroOuNome,
          capacidade,
          valorDiaria,
        });
      } else if (modal?.mode === "edit") {
        await updateQuartoServer(modal.quarto.id, {
          id: modal.quarto.id,
          numeroOuNome,
          capacidade,
          valorDiaria,
          status: form.status,
        });
      }
      setModal(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível salvar o quarto.");
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
      await deleteQuartoServer(deleteTarget.id);
      setDeleteTarget(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível excluir o quarto.");
      if (msg) setError(msg);
    } finally {
      setDeleting(false);
    }
  }

  const rangeStart = filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const rangeEnd = Math.min(page * PAGE_SIZE, filtered.length);

  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  } else if (error && quartos.length === 0) {
    content = (
      <div className="px-6 py-8">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      </div>
    );
  } else {
    content = (
    <div className="px-6 py-8">
      {error ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1 max-w-xl">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
              aria-hidden
            />
            <input
              type="search"
              placeholder="Buscar por nome ou número do quarto…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="quarto-status-filter" className="sr-only">
              Filtrar por status
            </label>
            <select
              id="quarto-status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="todos">Todos os status</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="rounded-lg border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-50"
              title="Filtros"
              aria-label="Filtros"
              onClick={() => {
                setStatusFilter("todos");
                setSearch("");
              }}
            >
              <Filter className="size-4" aria-hidden />
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={pousadaId == null}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden />
          Novo quarto
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700">Quarto</th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Capacidade
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Valor da diária
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginated.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    {quartos.length === 0
                      ? "Nenhum quarto cadastrado. Use “Novo quarto” para incluir."
                      : "Nenhum resultado para os filtros aplicados."}
                  </td>
                </tr>
              ) : (
                paginated.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-100 text-slate-500">
                          <BedDouble className="size-5" aria-hidden />
                        </span>
                        <p className="min-w-0 font-medium text-slate-900">
                          {room.numeroOuNome}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Users className="size-3.5 text-slate-400" aria-hidden />
                        {room.capacidade}{" "}
                        {room.capacidade === 1 ? "hóspede" : "hóspedes"}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {formatCurrencyBRL(room.valorDiaria)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(room.status)}`}
                      >
                        <span
                          className={`size-1.5 shrink-0 rounded-full ${statusDotClass(room.status)}`}
                          aria-hidden
                        />
                        {normalizeStatus(room.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(room)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Editar"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(room)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Excluir"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-500">
          {filtered.length === 0
            ? "Nenhum quarto exibido"
            : `Mostrando ${rangeStart} a ${rangeEnd} de ${filtered.length} ${
                filtered.length === 1 ? "quarto" : "quartos"
              }`}
        </p>
        {filtered.length > PAGE_SIZE ? (
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`min-w-9 rounded-lg px-3 py-1.5 text-sm font-medium ${
                  n === page
                    ? "bg-blue-600 text-white"
                    : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              Próximo
            </button>
          </div>
        ) : null}
      </div>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quarto-modal-title"
          onClick={() => {
            if (!saving) setModal(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <BedDouble className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="quarto-modal-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {modal.mode === "create" ? "Novo quarto" : "Editar quarto"}
                </h2>
              </div>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="quarto-nome"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nome ou número
                </label>
                <input
                  id="quarto-nome"
                  required
                  placeholder="Ex.: Suíte 01 (101)"
                  value={form.numeroOuNome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, numeroOuNome: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="quarto-cap"
                  className="block text-sm font-medium text-slate-700"
                >
                  Capacidade (hóspedes)
                </label>
                <input
                  id="quarto-cap"
                  type="number"
                  min={1}
                  required
                  value={form.capacidade}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, capacidade: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="quarto-valor"
                  className="block text-sm font-medium text-slate-700"
                >
                  Valor da diária (R$)
                </label>
                <input
                  id="quarto-valor"
                  type="number"
                  min={0}
                  step="0.01"
                  required
                  value={form.valorDiaria}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, valorDiaria: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              {modal.mode === "edit" ? (
                <div>
                  <label
                    htmlFor="quarto-status"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="quarto-status"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-quarto-title"
          onClick={() => {
            if (!deleting) setDeleteTarget(null);
          }}
        >
          <div
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <AlertTriangle className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="delete-quarto-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Excluir quarto?
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  Tem certeza que deseja excluir{" "}
                  <span className="font-medium text-slate-900">
                    {deleteTarget.numeroOuNome}
                  </span>
                  ? Reservas vinculadas podem impedir a exclusão.
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeleteTarget(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void confirmDelete()}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                Excluir
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
    );
  }

  return (
    <PousadaGateShell feature="quartos">{content}</PousadaGateShell>
  );
}
