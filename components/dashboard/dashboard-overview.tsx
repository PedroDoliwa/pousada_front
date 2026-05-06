"use client";

import { Loader2, Building2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { ApiError, listPousadas, listQuartos, listReservas } from "@/lib/api";
import type { Pousada, Quarto, Reserva } from "@/types/entities";

const STORAGE_KEY = "pousada_selected_id";

export function DashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pousadas, setPousadas] = useState<Pousada[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setLoading(true);
      try {
        const rows = await listPousadas();
        if (cancelled) return;
        setPousadas(rows);
        const stored =
          typeof window !== "undefined"
            ? window.sessionStorage.getItem(STORAGE_KEY)
            : null;
        const parsed = stored ? Number.parseInt(stored, 10) : NaN;
        const valid =
          Number.isFinite(parsed) && rows.some((p) => p.id === parsed);
        const initial =
          valid ? parsed! : rows[0]?.id ?? null;
        setSelectedId(initial);
        if (initial != null && typeof window !== "undefined") {
          window.sessionStorage.setItem(STORAGE_KEY, String(initial));
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof ApiError
              ? e.message
              : "Não foi possível carregar as pousadas."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;
    queueMicrotask(() => {
      setLoadingExtra(true);
    });
    (async () => {
      try {
        const [q, r] = await Promise.all([
          listQuartos(selectedId),
          listReservas(selectedId),
        ]);
        if (cancelled) return;
        queueMicrotask(() => {
          setQuartos(q);
          setReservas(r);
          setLoadingExtra(false);
        });
      } catch {
        if (!cancelled) {
          queueMicrotask(() => {
            setQuartos([]);
            setReservas([]);
            setLoadingExtra(false);
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  function handleSelect(id: number) {
    setSelectedId(id);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(STORAGE_KEY, String(id));
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" />
      </div>
    );
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

  const selected = pousadas.find((p) => p.id === selectedId);

  return (
    <div className="px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Pousada ativa</p>
          {pousadas.length === 0 ? (
            <p className="mt-1 text-slate-700">
              Nenhuma pousada cadastrada. Crie uma pela API ou pelo fluxo que
              será adicionado aqui.
            </p>
          ) : (
            <select
              id="pousada-select"
              className="mt-1 max-w-md rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={selectedId ?? ""}
              onChange={(e) =>
                handleSelect(Number.parseInt(e.target.value, 10))
              }
            >
              {pousadas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                  {p.ativa === false ? " (inativa)" : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selected ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Building2 className="size-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-slate-900">{selected.nome}</h3>
                <p className="mt-1 flex items-start gap-1 text-sm text-slate-600">
                  <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                  {selected.endereco}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  {selected.email} · {selected.telefone}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Quartos</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {loadingExtra ? "…" : quartos.length}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Reservas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {loadingExtra ? "…" : reservas.length}
            </p>
          </article>
        </div>
      ) : null}
    </div>
  );
}
