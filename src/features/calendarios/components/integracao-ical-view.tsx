"use client";

import {
  AlertTriangle,
  Check,
  Copy,
  Info,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, handleApiErrorForClient, urlExportacaoIcs } from "@/services/api";
import {
  cancelReservaServer,
  createCalendarioServer,
  deleteCalendarioServer,
  listCalendariosServer,
  sincronizarCalendarioServer,
  updateCalendarioServer,
} from "@/features/calendarios/actions";
import { listReservasServer } from "@/features/dashboard/actions";
import { listHospedesServer } from "@/features/hospedes";
import { listQuartosServer } from "@/features/quartos/actions";
import { useActivePousada } from "@/features/pousada";
import type {
  CalendarioExterno,
  Hospede,
  Quarto,
  Reserva,
} from "@/types/entities";

/** Canais disponíveis na UI (sem "Outro" por enquanto). */
const CANAIS = ["Airbnb", "Booking"] as const;
type CanalUi = (typeof CANAIS)[number];

function normalizeCanal(canal: string): CanalUi | null {
  const s = canal.trim().toLowerCase();
  if (s === "airbnb") return "Airbnb";
  if (s === "booking") return "Booking";
  return null;
}

function findFeedForCanal(
  feedList: CalendarioExterno[],
  canal: CanalUi
): CalendarioExterno | null {
  return (
    feedList.find((f) => normalizeCanal(f.canal) === canal) ?? null
  );
}

function urlPlaceholderForCanal(canal: CanalUi): string {
  switch (canal) {
    case "Airbnb":
      return "https://www.airbnb.com/calendar/ical/….ics";
    case "Booking":
      return "https://admin.booking.com/hotel/hoteladmin/ical/….ics";
  }
}

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

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function nightsBetween(start: string, end: string): number {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

function origemLabel(origem: string): string {
  if (origem === "Booking") return "Booking.com";
  return origem;
}

function origemBadgeClass(origem: string): string {
  switch (origem) {
    case "Airbnb":
      return "bg-violet-50 text-violet-800 ring-violet-600/20";
    case "Booking":
      return "bg-sky-50 text-sky-800 ring-sky-600/20";
    default:
      return "bg-slate-50 text-slate-700 ring-slate-500/20";
  }
}

export function IntegracaoIcalView() {
  const { selectedId: pousadaId, pousadas } = useActivePousada();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [quartos, setQuartos] = useState<Quarto[]>([]);
  const [hospedes, setHospedes] = useState<Hospede[]>([]);
  const [reservas, setReservas] = useState<Reserva[]>([]);
  const [feeds, setFeeds] = useState<CalendarioExterno[]>([]);

  const [selectedQuartoId, setSelectedQuartoId] = useState<number | "">("");

  const [urlImportacao, setUrlImportacao] = useState("");
  const [canal, setCanal] = useState<CanalUi>("Airbnb");
  const [savingFeed, setSavingFeed] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [copyingExport, setCopyingExport] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Reserva | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const selectedQuarto = useMemo(
    () => quartos.find((q) => q.id === selectedQuartoId) ?? null,
    [quartos, selectedQuartoId]
  );

  /** Feed salvo na API para o canal selecionado (um link por canal, por quarto). */
  const feedForCanal = useMemo(
    () => findFeedForCanal(feeds, canal),
    [feeds, canal]
  );

  const hospedeNomeById = useMemo(() => {
    const map = new Map<number, string>();
    for (const h of hospedes) map.set(h.id, h.nome);
    return map;
  }, [hospedes]);

  const importedReservas = useMemo(() => {
    if (selectedQuartoId === "") return [];
    return reservas
      .filter(
        (r) =>
          r.quartoId === selectedQuartoId &&
          r.origem !== "Manual" &&
          r.status !== "Cancelada"
      )
      .sort(
        (a, b) =>
          new Date(b.dataEntrada).getTime() -
          new Date(a.dataEntrada).getTime()
      );
  }, [reservas, selectedQuartoId]);

  const reloadData = useCallback(async (): Promise<Quarto[]> => {
    if (pousadaId == null) return [];
    const [q, h, r] = await Promise.all([
      listQuartosServer(pousadaId),
      listHospedesServer(pousadaId),
      listReservasServer(pousadaId),
    ]);
    setQuartos(q);
    setHospedes(h);
    setReservas(r);
    return q;
  }, [pousadaId]);

  const syncFormToCanal = useCallback(
    (list: CalendarioExterno[], targetCanal: CanalUi) => {
      const feed = findFeedForCanal(list, targetCanal);
      setUrlImportacao(feed?.urlImportacao ?? "");
    },
    []
  );

  const reloadFeeds = useCallback(
    async (quartoId: number, targetCanal: CanalUi) => {
      const list = await listCalendariosServer(quartoId);
      setFeeds(list);
      syncFormToCanal(list, targetCanal);
      return list;
    },
    [syncFormToCanal]
  );

  function handleCanalChange(next: CanalUi) {
    setCanal(next);
    syncFormToCanal(feeds, next);
    setSuccess(null);
  }

  useEffect(() => {
    if (pousadaId == null) {
      queueMicrotask(() => {
        setLoading(false);
        setQuartos([]);
        setFeeds([]);
        if (pousadas.length === 0) {
          setError("Cadastre uma pousada antes de configurar integrações.");
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
        const q = await reloadData();
        if (cancelled) return;
        const first = q[0];
        if (first && selectedQuartoId === "") {
          setSelectedQuartoId(first.id);
        }
      } catch (e) {
        if (!cancelled) {
          const msg = apiErrorMessage(
            e,
            "Não foi possível carregar os dados."
          );
          if (msg) setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- carga inicial por pousada
  }, [pousadaId, pousadas.length, reloadData]);

  useEffect(() => {
    if (selectedQuartoId === "" || pousadaId == null) {
      setFeeds([]);
      setUrlImportacao("");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await reloadFeeds(selectedQuartoId, canal);
        if (cancelled) return;
      } catch (e) {
        if (!cancelled) {
          const msg = apiErrorMessage(
            e,
            "Não foi possível carregar os calendários do quarto."
          );
          if (msg) setError(msg);
          setFeeds([]);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedQuartoId, pousadaId, reloadFeeds, canal]);

  async function handleSaveFeed(e: React.FormEvent) {
    e.preventDefault();
    const url = urlImportacao.trim();
    if (!url || selectedQuartoId === "") return;

    setSavingFeed(true);
    setError(null);
    setSuccess(null);
    try {
      const existing = findFeedForCanal(feeds, canal);
      if (existing) {
        await updateCalendarioServer(existing.id, {
          id: existing.id,
          canal,
          urlImportacao: url,
          ativo: existing.ativo,
        });
        await reloadFeeds(selectedQuartoId, canal);
        setSuccess(
          `Link do ${canal === "Booking" ? "Booking.com" : canal} atualizado. Use “Sincronizar agora”.`
        );
      } else {
        await createCalendarioServer({
          quartoId: selectedQuartoId,
          canal,
          urlImportacao: url,
        });
        await reloadFeeds(selectedQuartoId, canal);
        setSuccess(
          `Link do ${canal === "Booking" ? "Booking.com" : canal} salvo. Use “Sincronizar agora”.`
        );
      }
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível salvar o calendário.");
      if (msg) setError(msg);
    } finally {
      setSavingFeed(false);
    }
  }

  async function handleSync() {
    if (!feedForCanal) {
      setError(
        `Salve primeiro a URL do calendário ${canal === "Booking" ? "Booking.com" : canal}.`
      );
      return;
    }
    setSyncing(true);
    setError(null);
    setSuccess(null);
    try {
      const result = await sincronizarCalendarioServer(feedForCanal.id);
      if (pousadaId != null) await reloadData();
      if (selectedQuartoId !== "") await reloadFeeds(selectedQuartoId, canal);

      const parts = [
        `${result.criados} criada(s)`,
        `${result.atualizados} atualizada(s)`,
        `${result.cancelados} cancelada(s)`,
      ];
      let msg = `Sincronização concluída: ${parts.join(", ")}.`;
      if (result.ignorados > 0) {
        msg += ` ${result.ignorados} ignorada(s) por conflito ou reserva manual com o mesmo UID.`;
      }
      setSuccess(msg);
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível sincronizar.");
      if (msg) setError(msg);
      if (selectedQuartoId !== "") await reloadFeeds(selectedQuartoId, canal);
    } finally {
      setSyncing(false);
    }
  }

  async function handleCopyExport() {
    if (!selectedQuarto?.tokenExportacao) {
      setError("Token de exportação indisponível para este quarto.");
      return;
    }
    setCopyingExport(true);
    try {
      const link = urlExportacaoIcs(
        selectedQuarto.id,
        selectedQuarto.tokenExportacao
      );
      await navigator.clipboard.writeText(link);
      setSuccess(
        "Link de exportação copiado. Cole no Airbnb ou Booking em “Importar calendário”."
      );
    } catch {
      setError("Não foi possível copiar o link. Verifique NEXT_PUBLIC_API_URL.");
    } finally {
      setCopyingExport(false);
    }
  }

  async function confirmCancelReserva() {
    if (!cancelTarget) return;
    setCancelling(true);
    setError(null);
    try {
      await cancelReservaServer(cancelTarget.id);
      setCancelTarget(null);
      if (pousadaId != null) await reloadData();
      setSuccess("Reserva importada cancelada.");
    } catch (err) {
      const msg = apiErrorMessage(
        err,
        "Não foi possível cancelar a reserva."
      );
      if (msg) setError(msg);
    } finally {
      setCancelling(false);
    }
  }

  async function handleRemoveFeed() {
    if (selectedQuartoId === "" || !feedForCanal) return;
    setError(null);
    try {
      await deleteCalendarioServer(feedForCanal.id);
      await reloadFeeds(selectedQuartoId, canal);
      if (pousadaId != null) await reloadData();
      setSuccess(
        `Integração ${canal === "Booking" ? "Booking.com" : canal} removida.`
      );
    } catch (err) {
      const msg = apiErrorMessage(err, "Não foi possível remover a integração.");
      if (msg) setError(msg);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  if (error && quartos.length === 0 && pousadaId != null) {
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
      {success ? (
        <p className="mb-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {success}
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Importar calendário externo
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Cada canal tem sua própria URL: uma do Airbnb e outra do Booking para
            o mesmo quarto, se você usar os dois.
          </p>

          <form onSubmit={(e) => void handleSaveFeed(e)} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="ical-quarto"
                className="block text-sm font-medium text-slate-700"
              >
                Selecionar quarto
              </label>
              <select
                id="ical-quarto"
                value={selectedQuartoId}
                onChange={(e) => {
                  const v = e.target.value;
                  setSelectedQuartoId(v === "" ? "" : Number.parseInt(v, 10));
                  setSuccess(null);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              >
                {quartos.length === 0 ? (
                  <option value="">Nenhum quarto cadastrado</option>
                ) : (
                  quartos.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.numeroOuNome} — {q.capacidade} hóspede
                      {q.capacidade === 1 ? "" : "s"} ·{" "}
                      {formatCurrencyBRL(q.valorDiaria)} / diária
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label
                htmlFor="ical-canal"
                className="block text-sm font-medium text-slate-700"
              >
                Canal
              </label>
              <select
                id="ical-canal"
                value={canal}
                onChange={(e) =>
                  handleCanalChange(e.target.value as CanalUi)
                }
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              >
                {CANAIS.map((c) => (
                  <option key={c} value={c}>
                    {c === "Booking" ? "Booking.com" : c}
                  </option>
                ))}
              </select>
              <ul className="mt-2 flex flex-wrap gap-2">
                {CANAIS.map((c) => {
                  const configured = !!findFeedForCanal(feeds, c);
                  const active = canal === c;
                  return (
                    <li key={c}>
                      <button
                        type="button"
                        onClick={() => handleCanalChange(c)}
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                          active
                            ? "bg-blue-50 text-blue-800 ring-blue-600/30"
                            : configured
                              ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
                              : "bg-slate-50 text-slate-600 ring-slate-500/20"
                        }`}
                      >
                        {c === "Booking" ? "Booking.com" : c}
                        {configured ? " · configurado" : " · pendente"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div>
              <label
                htmlFor="ical-url"
                className="block text-sm font-medium text-slate-700"
              >
                URL do calendário (.ics) — {canal === "Booking" ? "Booking.com" : canal}
              </label>
              <input
                id="ical-url"
                type="url"
                required
                placeholder={urlPlaceholderForCanal(canal)}
                value={urlImportacao}
                onChange={(e) => setUrlImportacao(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {!feedForCanal && urlImportacao === "" ? (
                <p className="mt-1 text-xs text-slate-500">
                  Nenhum link salvo para este canal. Cole a URL que a plataforma
                  forneceu e clique em Salvar.
                </p>
              ) : null}
            </div>

            <p className="text-xs text-slate-500">
              A importação pode atualizar reservas do período conforme o feed
              externo. Reservas manuais com o mesmo identificador não são
              sobrescritas.
            </p>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={savingFeed || selectedQuartoId === ""}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {savingFeed ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : null}
                {feedForCanal ? "Atualizar link" : "Salvar link"}
              </button>
              {feedForCanal ? (
                <button
                  type="button"
                  onClick={() => void handleRemoveFeed()}
                  className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
                >
                  Remover link deste canal
                </button>
              ) : null}
            </div>
          </form>

          <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50/80 p-4">
            <div className="flex gap-2">
              <Info className="size-5 shrink-0 text-blue-600" aria-hidden />
              <div className="text-sm text-blue-900">
                <p className="font-medium">Como obter o link iCal?</p>
                <p className="mt-1 text-blue-800/90">
                  No Airbnb ou Booking, abra as configurações de calendário do
                  anúncio e copie o link de exportação do calendário (formato
                  .ics). Cole esse endereço no campo acima.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-900">
              Exportar para plataforma
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              Copie o link abaixo e cole no Airbnb/Booking em “Importar
              calendário” para bloquear datas das suas reservas manuais.
            </p>
            <button
              type="button"
              disabled={!selectedQuarto?.tokenExportacao || copyingExport}
              onClick={() => void handleCopyExport()}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-60"
            >
              {copyingExport ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              Copiar link de exportação
            </button>
          </div>
        </section>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Sincronização</h2>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Sincronizando: {canal === "Booking" ? "Booking.com" : canal}
          </p>
          {feedForCanal ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-slate-500">Última sincronização</dt>
                <dd className="font-medium text-slate-900">
                  {formatDateTime(feedForCanal.ultimaSincronizacao)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Próxima sincronização</dt>
                <dd className="text-slate-900">Automática (aprox. a cada 30 min)</dd>
              </div>
              <div>
                <dt className="text-slate-500">Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                      feedForCanal.ativo
                        ? "bg-emerald-50 text-emerald-800 ring-emerald-600/20"
                        : "bg-slate-50 text-slate-600 ring-slate-500/20"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        feedForCanal.ativo ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                      aria-hidden
                    />
                    {feedForCanal.ativo ? "Ativa" : "Inativa"}
                  </span>
                </dd>
              </div>
              {feedForCanal.ultimoErro ? (
                <div>
                  <dt className="text-slate-500">Último erro</dt>
                  <dd className="text-red-700">{feedForCanal.ultimoErro}</dd>
                </div>
              ) : null}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-600">
              Salve a URL deste canal para habilitar a sincronização.
            </p>
          )}
          <button
            type="button"
            disabled={!feedForCanal || syncing}
            onClick={() => void handleSync()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {syncing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <RefreshCw className="size-4" aria-hidden />
            )}
            Sincronizar agora
          </button>
        </aside>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Períodos importados
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Reservas trazidas dos calendários externos para o quarto selecionado.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium text-slate-700">Início</th>
                <th className="px-4 py-3 font-medium text-slate-700">Fim</th>
                <th className="px-4 py-3 font-medium text-slate-700">Tipo</th>
                <th className="px-4 py-3 font-medium text-slate-700">Origem</th>
                <th className="px-4 py-3 font-medium text-slate-700">
                  Hóspede / descrição
                </th>
                <th className="px-4 py-3 font-medium text-slate-700">Noites</th>
                <th className="px-4 py-3 font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-right font-medium text-slate-700">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {selectedQuartoId === "" ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Selecione um quarto.
                  </td>
                </tr>
              ) : importedReservas.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                    Nenhum período importado. Salve a URL e sincronize.
                  </td>
                </tr>
              ) : (
                importedReservas.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(r.dataEntrada)}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {formatDate(r.dataSaida)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 ring-1 ring-inset ring-blue-600/20">
                        Reserva
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${origemBadgeClass(r.origem)}`}
                      >
                        {origemLabel(r.origem)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {r.tituloExterno?.trim() ||
                        hospedeNomeById.get(r.hospedeId) ||
                        "—"}
                    </td>
                    <td className="px-4 py-3 tabular-nums text-slate-700">
                      {nightsBetween(r.dataEntrada, r.dataSaida)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 ring-1 ring-inset ring-emerald-600/20">
                        <Check className="size-3" aria-hidden />
                        Importado
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setCancelTarget(r)}
                        className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        title="Cancelar reserva importada"
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <p className="border-t border-slate-100 px-6 py-3 text-sm text-slate-500">
          {importedReservas.length === 0
            ? "Nenhum período"
            : `Mostrando ${importedReservas.length} ${
                importedReservas.length === 1 ? "período" : "períodos"
              }`}
        </p>
      </section>

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
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-red-50 p-2 text-red-600">
                <AlertTriangle className="size-5" aria-hidden />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Cancelar reserva importada?
                </h2>
                <p className="mt-2 text-sm text-slate-600">
                  A reserva de {origemLabel(cancelTarget.origem)} será cancelada
                  no sistema (período liberado na ocupação).
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelTarget(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void confirmCancelReserva()}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
              >
                {cancelling ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
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
