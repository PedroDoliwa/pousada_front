"use client";

import { Loader2, Building2, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import { useActivePousada } from "@/features/pousada";
import type { Quarto, Reserva } from "@/types/entities";

type Props = {
  loadExtras: (pousadaId: number) => Promise<{ quartos: Quarto[]; reservas: Reserva[] }>;
};

export function DashboardOverview({ loadExtras }: Props) {
  const { pousadas, selectedId, selected, setSelectedId } = useActivePousada();
  const [error, setError] = useState<string | null>(null);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;
    queueMicrotask(() => setLoadingExtra(true));
    (async () => {
      try {
        const { quartos: q, reservas: r } = await loadExtras(selectedId);
        if (cancelled) return;
        queueMicrotask(() => {
          setQuartos(q);
          setReservas(r);
          setLoadingExtra(false);
        });
      } catch (e) {
        if (cancelled) return;
        if (handleApiErrorForClient(e)) return;
        setError(
          e instanceof ApiError ? e.message : "Não foi possível carregar os dados."
        );
        queueMicrotask(() => {
          setQuartos([]);
          setReservas([]);
          setLoadingExtra(false);
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, loadExtras]);

  function handleSelect(id: number) {
    setError(null);
    setSelectedId(id);
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
    <div className="px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Pousada ativa</p>
          {pousadas.length > 0 ? (
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
          ) : (
            <p className="mt-2 text-sm text-slate-600">
              Nenhuma pousada cadastrada.{" "}
              <Link
                href="/pousadas"
                className="font-medium text-blue-600 hover:text-blue-700"
              >
                Cadastre sua primeira pousada
              </Link>
            </p>
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
              {loadingExtra ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-slate-400" aria-hidden />
                  …
                </span>
              ) : (
                quartos.length
              )}
            </p>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Reservas</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {loadingExtra ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-slate-400" aria-hidden />
                  …
                </span>
              ) : (
                reservas.length
              )}
            </p>
          </article>
        </div>
      ) : null}
    </div>
  );
}
