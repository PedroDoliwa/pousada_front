"use client";

import {
  AlertTriangle,
  CalendarRange,
  Loader2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import { listHospedesServer } from "@/features/hospedes";
import { listQuartosServer } from "@/features/quartos/actions";
import {
  createReservaServer,
  getReservaServer,
  listOcupacaoServer,
  updateReservaServer,
  verificarDisponibilidadeServer,
} from "@/features/reservas/actions";
import {
  dateInputsToIso,
  formatCurrencyBRL,
  formatDateTimeBR,
  formatReservaCodigo,
  isoToDateInput,
  isReservaImportada,
  monthBoundsFromDateInput,
  nightsBetween,
} from "@/features/reservas/utils";
import { useActivePousada } from "@/features/pousada";
import type { Hospede, OcupacaoPeriodo, Quarto, Reserva } from "@/types/entities";

type Mode = "create" | "edit" | "view";

type Props = {
  mode: Mode;
  reservaId?: number;
};

function apiErrorMessage(err: unknown, fallback: string): string | null {
  if (handleApiErrorForClient(err)) return null;
  return err instanceof ApiError ? err.message : fallback;
}

const STATUS_OPTIONS = ["Confirmada", "Pendente", "Cancelada"];

export function ReservaFormView({ mode, reservaId }: Props) {
  const router = useRouter();
  const { selectedId: pousadaId, pousadas } = useActivePousada();

  const [loading, setLoading] = useState(mode !== "create");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reserva, setReserva] = useState<Reserva | null>(null);
  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [ocupacao, setOcupacao] = useState<OcupacaoPeriodo[]>([]);

  const [hospedeId, setHospedeId] = useState<number | "">("");
  const [quartoId, setQuartoId] = useState<number | "">("");
  const [dataEntrada, setDataEntrada] = useState("");
  const [dataSaida, setDataSaida] = useState("");
  const [status, setStatus] = useState("Confirmada");
  const [observacoes, setObservacoes] = useState("");

  const [checkingDisp, setCheckingDisp] = useState(false);
  const [disponivel, setDisponivel] = useState<boolean | null>(null);

  const readOnly = mode === "view" || (reserva != null && isReservaImportada(reserva.origem));
  const canEdit = !readOnly;

  const isoRange = useMemo(
    () => dateInputsToIso(dataEntrada, dataSaida),
    [dataEntrada, dataSaida]
  );

  const selectedQuarto = useMemo(
    () => quartos.find((q) => q.id === quartoId) ?? null,
    [quartos, quartoId]
  );

  const nights = useMemo(() => {
    if (!isoRange) return 0;
    return nightsBetween(isoRange.dataEntrada, isoRange.dataSaida);
  }, [isoRange]);

  const estimatedTotal = useMemo(() => {
    if (!selectedQuarto || nights <= 0) return 0;
    return selectedQuarto.valorDiaria * nights;
  }, [selectedQuarto, nights]);

  const calendarDays = useMemo(() => {
    if (!dataEntrada) return [];
    const [y, m] = dataEntrada.split("-").map(Number);
    const daysInMonth = new Date(y!, m!, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  }, [dataEntrada]);

  const occupiedDaySet = useMemo(() => {
    const set = new Set<number>();
    if (quartoId === "" || !dataEntrada) return set;
    const [y, m] = dataEntrada.split("-").map(Number);
    for (const o of ocupacao) {
      if (o.quartoId !== quartoId || o.status === "Cancelada") continue;
      const start = new Date(o.dataEntrada);
      const end = new Date(o.dataSaida);
      for (let d = 1; d <= 31; d++) {
        const day = new Date(y!, m! - 1, d, 12, 0, 0);
        if (day >= start && day < end) set.add(d);
      }
    }
    return set;
  }, [ocupacao, quartoId, dataEntrada]);

  useEffect(() => {
    if (pousadaId == null) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [q, h] = await Promise.all([
          listQuartosServer(pousadaId),
          listHospedesServer(pousadaId),
        ]);
        if (cancelled) return;
        setQuartos(q);
        setHospedes(h);

        if (mode !== "create" && reservaId != null) {
          const r = await getReservaServer(reservaId);
          if (cancelled) return;
          setReserva(r);
          setHospedeId(r.hospedeId);
          setQuartoId(r.quartoId);
          setDataEntrada(isoToDateInput(r.dataEntrada));
          setDataSaida(isoToDateInput(r.dataSaida));
          setStatus(r.status);
          setObservacoes(r.observacoes ?? "");
        } else if (q[0]) {
          setQuartoId(q[0].id);
        }
        if (h[0] && mode === "create") setHospedeId(h[0].id);
      } catch (e) {
        if (!cancelled) {
          const msg = apiErrorMessage(e, "Não foi possível carregar os dados.");
          if (msg) setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pousadaId, mode, reservaId]);

  useEffect(() => {
    if (pousadaId == null || quartoId === "" || !dataEntrada) {
      setOcupacao([]);
      return;
    }
    let cancelled = false;
    const { de, ate } = monthBoundsFromDateInput(dataEntrada);
    (async () => {
      try {
        const rows = await listOcupacaoServer(pousadaId, de, ate);
        if (!cancelled) setOcupacao(rows);
      } catch {
        if (!cancelled) setOcupacao([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pousadaId, quartoId, dataEntrada]);

  useEffect(() => {
    if (!canEdit || !isoRange || quartoId === "") {
      setDisponivel(null);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      (async () => {
        setCheckingDisp(true);
        try {
          const result = await verificarDisponibilidadeServer({
            quartoId,
            dataEntrada: isoRange.dataEntrada,
            dataSaida: isoRange.dataSaida,
            reservaIdIgnorar: mode === "edit" && reservaId ? reservaId : null,
          });
          if (!cancelled) setDisponivel(result.disponivel);
        } catch {
          if (!cancelled) setDisponivel(null);
        } finally {
          if (!cancelled) setCheckingDisp(false);
        }
      })();
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [canEdit, isoRange, quartoId, mode, reservaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canEdit || !isoRange || hospedeId === "" || quartoId === "") return;
    if (disponivel === false) {
      setError("Quarto indisponível no período informado.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (mode === "create") {
        await createReservaServer({
          quartoId,
          hospedeId,
          dataEntrada: isoRange.dataEntrada,
          dataSaida: isoRange.dataSaida,
          observacoes: observacoes.trim() || null,
        });
      } else if (mode === "edit" && reservaId != null && reserva) {
        await updateReservaServer(reservaId, {
          id: reservaId,
          quartoId,
          hospedeId,
          dataEntrada: isoRange.dataEntrada,
          dataSaida: isoRange.dataSaida,
          observacoes: observacoes.trim() || null,
          status,
        });
      }
      router.push("/reservas");
      router.refresh();
    } catch (err) {
      const msg = apiErrorMessage(
        err,
        "Não foi possível salvar a reserva. Verifique disponibilidade e dados."
      );
      if (msg) setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (pousadaId == null && !loading) {
    return (
      <div className="px-6 py-8">
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {pousadas.length === 0
            ? "Cadastre uma pousada antes de criar reservas."
            : "Selecione uma pousada ativa no painel."}
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  const title =
    mode === "create"
      ? "Nova reserva"
      : readOnly
        ? formatReservaCodigo(reservaId ?? 0)
        : "Editar reserva";

  return (
    <div className="px-6 py-8">
      <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/reservas" className="hover:text-blue-600">
          Reservas
        </Link>
        <span>/</span>
        <span className="text-slate-800">{title}</span>
      </div>

      {error ? (
        <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {readOnly && reserva ? (
        <p className="mb-4 rounded-lg bg-violet-50 px-4 py-3 text-sm text-violet-900">
          Reserva importada ({reserva.origem}). Edição limitada — alterações devem
          ser feitas no canal de origem.
        </p>
      ) : null}

      <form
        onSubmit={(e) => void handleSubmit(e)}
        className="grid gap-8 xl:grid-cols-[1fr_340px]"
      >
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Dados da reserva</h2>

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="res-hospede" className="block text-sm font-medium">
                Hóspede
              </label>
              <select
                id="res-hospede"
                disabled={readOnly}
                value={hospedeId}
                onChange={(e) =>
                  setHospedeId(Number.parseInt(e.target.value, 10))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              >
                {hospedes.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="res-quarto" className="block text-sm font-medium">
                Quarto
              </label>
              <select
                id="res-quarto"
                disabled={readOnly}
                value={quartoId}
                onChange={(e) =>
                  setQuartoId(Number.parseInt(e.target.value, 10))
                }
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              >
                {quartos.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.numeroOuNome} — {formatCurrencyBRL(q.valorDiaria)} / diária
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="res-in" className="block text-sm font-medium">
                  Data de entrada
                </label>
                <input
                  id="res-in"
                  type="date"
                  disabled={readOnly}
                  value={dataEntrada}
                  onChange={(e) => setDataEntrada(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                />
              </div>
              <div>
                <label htmlFor="res-out" className="block text-sm font-medium">
                  Data de saída
                </label>
                <input
                  id="res-out"
                  type="date"
                  disabled={readOnly}
                  value={dataSaida}
                  onChange={(e) => setDataSaida(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                />
              </div>
            </div>

            {nights > 0 ? (
              <p className="text-sm text-slate-600">
                <span className="font-medium">{nights}</span>{" "}
                {nights === 1 ? "noite" : "noites"}
              </p>
            ) : null}

            {mode !== "create" ? (
              <div>
                <label htmlFor="res-status" className="block text-sm font-medium">
                  Status
                </label>
                <select
                  id="res-status"
                  disabled={readOnly}
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div>
              <label htmlFor="res-obs" className="block text-sm font-medium">
                Observações
              </label>
              <textarea
                id="res-obs"
                disabled={readOnly}
                maxLength={300}
                rows={3}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-50"
              />
              <p className="mt-1 text-xs text-slate-500">
                {observacoes.length}/300
              </p>
            </div>

            {canEdit ? (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">Valor das diárias (estimado)</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrencyBRL(estimatedTotal)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  O valor final é calculado pela API ao salvar.
                </p>
              </div>
            ) : reserva ? (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-sm text-slate-600">Valor total</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCurrencyBRL(reserva.valorTotal)}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="space-y-4">
          {canEdit && disponivel === false ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-2">
                <AlertTriangle className="size-5 shrink-0 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">
                    Conflito de datas
                  </p>
                  <p className="mt-1 text-sm text-red-800">
                    O quarto não está disponível no período escolhido.
                  </p>
                  <Link
                    href="/calendario"
                    className="mt-2 inline-block text-sm font-medium text-red-900 underline"
                  >
                    Ver no calendário
                  </Link>
                </div>
              </div>
            </div>
          ) : null}

          {canEdit && quartoId !== "" && dataEntrada ? (
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-slate-900">
                Disponibilidade do quarto
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {checkingDisp
                  ? "Verificando…"
                  : disponivel === true
                    ? "Período disponível"
                    : disponivel === false
                      ? "Indisponível"
                      : "Informe as datas"}
              </p>
              <div className="mt-3 flex flex-wrap gap-1">
                {calendarDays.map((day) => {
                  const busy = occupiedDaySet.has(day);
                  return (
                    <span
                      key={day}
                      className={`flex size-8 items-center justify-center rounded text-xs ${
                        busy
                          ? "bg-red-100 text-red-800"
                          : "bg-emerald-50 text-emerald-800"
                      }`}
                      title={busy ? "Ocupado" : "Livre"}
                    >
                      {busy ? (
                        <X className="size-3" aria-hidden />
                      ) : (
                        day
                      )}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">Resumo</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Hóspede</dt>
                <dd className="text-right font-medium text-slate-900">
                  {hospedes.find((h) => h.id === hospedeId)?.nome ?? "—"}
                </dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Quarto</dt>
                <dd className="text-right font-medium text-slate-900">
                  {selectedQuarto?.numeroOuNome ?? "—"}
                </dd>
              </div>
              {isoRange ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Período</dt>
                  <dd className="text-right text-slate-900">
                    {formatDateTimeBR(isoRange.dataEntrada)} —{" "}
                    {formatDateTimeBR(isoRange.dataSaida)}
                  </dd>
                </div>
              ) : null}
              {reserva ? (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Origem</dt>
                  <dd className="font-medium text-slate-900">{reserva.origem}</dd>
                </div>
              ) : (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Origem</dt>
                  <dd className="font-medium text-slate-900">Manual</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>

        <div className="flex justify-end gap-2 xl:col-span-2">
          <Link
            href="/reservas"
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            {readOnly ? "Voltar" : "Cancelar"}
          </Link>
          {canEdit ? (
            <button
              type="submit"
              disabled={
                saving ||
                disponivel === false ||
                checkingDisp ||
                !isoRange ||
                hospedeId === "" ||
                quartoId === ""
              }
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <CalendarRange className="size-4" aria-hidden />
              )}
              Salvar reserva
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
