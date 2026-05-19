"use client";

import {
  AlertTriangle,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import {
  createHospedeServer,
  deleteHospedeServer,
  listHospedesServer,
  updateHospedeServer,
} from "@/features/hospedes";
import { listReservasServer } from "@/features/dashboard/actions";
import { useActivePousada } from "@/features/pousada";
import type { Hospede } from "@/types/entities";

function formatPhoneBR(value: string | null): string {
  if (!value?.trim()) return "—";
  const d = value.replace(/\D/g, "");
  if (d.length === 11) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  if (d.length === 10) {
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  }
  return value;
}

function formatDocBR(value: string | null): string {
  if (!value?.trim()) return "—";
  const d = value.replace(/\D/g, "");
  if (d.length === 11) {
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
  }
  return value;
}

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (
    parts[0]!.slice(0, 1) + parts[parts.length - 1]!.slice(0, 1)
  ).toUpperCase();
}

type FormState = {
  nome: string;
  telefone: string;
  email: string;
  documento: string;
};

const emptyForm = (): FormState => ({
  nome: "",
  telefone: "",
  email: "",
  documento: "",
});

function apiErrorMessage(err: unknown, fallback: string): string | null {
  if (handleApiErrorForClient(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

export function HospedesView() {
  const { selectedId: pousadaId, pousadas } = useActivePousada();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [reservaCountByHospede, setReservaCountByHospede] = useState<
    Map<number, number>
  >(() => new Map());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [modal, setModal] = useState<
    | { mode: "create" }
    | { mode: "edit"; hospede: Hospede }
    | null
  >(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<Hospede | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (pousadaId == null) {
      queueMicrotask(() => {
        setLoading(false);
        setHospedes([]);
        setReservaCountByHospede(new Map());
        if (pousadas.length === 0) {
          setError(
            "Cadastre uma pousada antes de gerenciar hóspedes."
          );
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
        const rows = await listHospedesServer(pousadaId);
        if (cancelled) return;
        setHospedes(rows);

        const reservas = await listReservasServer(pousadaId);
        if (cancelled) return;
        const map = new Map<number, number>();
        for (const r of reservas) {
          map.set(r.hospedeId, (map.get(r.hospedeId) ?? 0) + 1);
        }
        setReservaCountByHospede(map);
      } catch (e) {
        if (!cancelled) {
          const msg = apiErrorMessage(
            e,
            "Não foi possível carregar os hóspedes."
          );
          if (msg) setError(msg);
          setHospedes([]);
          setReservaCountByHospede(new Map());
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
    if (!q) return hospedes;
    return hospedes.filter((h) => {
      const nome = h.nome?.toLowerCase() ?? "";
      const tel = h.telefone?.toLowerCase() ?? "";
      const em = h.email?.toLowerCase() ?? "";
      return (
        nome.includes(q) || tel.includes(q) || em.includes(q)
      );
    });
  }, [hospedes, search]);

  function openCreate() {
    if (pousadaId == null) {
      setError("Selecione uma pousada ativa antes de cadastrar hóspedes.");
      return;
    }
    setForm(emptyForm());
    setModal({ mode: "create" });
  }

  function openEdit(h: Hospede) {
    setForm({
      nome: h.nome ?? "",
      telefone: h.telefone ?? "",
      email: h.email ?? "",
      documento: h.documento ?? "",
    });
    setModal({ mode: "edit", hospede: h });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nome = form.nome.trim();
    if (!nome) return;
    if (pousadaId == null) {
      setError("Selecione uma pousada ativa antes de salvar.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (modal?.mode === "create") {
        await createHospedeServer({
          pousadaId,
          nome,
          telefone: form.telefone.trim() || null,
          email: form.email.trim() || null,
          documento: form.documento.trim() || null,
        });
      } else if (modal?.mode === "edit") {
        await updateHospedeServer(modal.hospede.id, {
          id: modal.hospede.id,
          pousadaId: modal.hospede.pousadaId,
          nome,
          telefone: form.telefone.trim() || null,
          email: form.email.trim() || null,
          documento: form.documento.trim() || null,
        });
      }
      setModal(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível salvar o hóspede.");
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
      await deleteHospedeServer(deleteTarget.id);
      setDeleteTarget(null);
      setReloadKey((k) => k + 1);
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível excluir o hóspede.");
      if (msg) setError(msg);
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  if (error && hospedes.length === 0) {
    return (
      <div className="px-6 py-8">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-8">
      {error ? (
        <p className="mb-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1 max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
            aria-hidden
          />
          <input
            type="search"
            placeholder="Buscar por nome, telefone ou e-mail…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <button
          type="button"
          onClick={openCreate}
          disabled={pousadaId == null}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-4" aria-hidden />
          Novo hóspede
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Nome
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Telefone
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  E-mail
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Documento
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Reservas
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    {hospedes.length === 0
                      ? "Nenhum hóspede cadastrado. Use “Novo hóspede” para incluir."
                      : "Nenhum resultado para a busca."}
                  </td>
                </tr>
              ) : (
                filtered.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700"
                          aria-hidden
                        >
                          {initialsFromName(h.nome)}
                        </span>
                        <span className="font-medium text-slate-900">
                          {h.nome}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        <Phone className="size-3.5 text-slate-400" aria-hidden />
                        {formatPhoneBR(h.telefone)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {h.email?.trim() ? h.email : "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {formatDocBR(h.documento)}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {reservaCountByHospede.get(h.id) ?? 0}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEdit(h)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Editar"
                        >
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(h)}
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

      <p className="mt-4 text-sm text-slate-500">
        Mostrando {filtered.length}{" "}
        {filtered.length === 1 ? "hóspede" : "hóspedes"}
        {hospedes.length > 0 && filtered.length !== hospedes.length
          ? ` (filtrado de ${hospedes.length})`
          : ""}
      </p>

      {modal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="hospede-modal-title"
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
                <User className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2
                  id="hospede-modal-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {modal.mode === "create"
                    ? "Novo hóspede"
                    : "Editar hóspede"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Os campos seguem o contrato da API (nome obrigatório).
                </p>
              </div>
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="hospede-nome"
                  className="block text-sm font-medium text-slate-700"
                >
                  Nome
                </label>
                <input
                  id="hospede-nome"
                  required
                  value={form.nome}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, nome: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="hospede-tel"
                  className="block text-sm font-medium text-slate-700"
                >
                  Telefone
                </label>
                <input
                  id="hospede-tel"
                  value={form.telefone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, telefone: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="hospede-email"
                  className="block text-sm font-medium text-slate-700"
                >
                  E-mail
                </label>
                <input
                  id="hospede-email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label
                  htmlFor="hospede-doc"
                  className="block text-sm font-medium text-slate-700"
                >
                  Documento
                </label>
                <input
                  id="hospede-doc"
                  value={form.documento}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, documento: e.target.value }))
                  }
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

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
          aria-labelledby="delete-hospede-title"
          aria-describedby="delete-hospede-desc"
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
                  id="delete-hospede-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  Excluir hóspede?
                </h2>
                <p
                  id="delete-hospede-desc"
                  className="mt-2 text-sm text-slate-600"
                >
                  Tem certeza que deseja excluir{" "}
                  <span className="font-medium text-slate-900">
                    {deleteTarget.nome}
                  </span>
                  ? Esta ação não pode ser desfeita.
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
