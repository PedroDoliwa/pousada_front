"use client";

import {
  AlertCircle,
  Building2,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { consultarIAServer } from "@/features/consulta-inteligente/actions";
import {
  buildHistoricoParaApi,
  MAX_PERGUNTA_CHARS,
  SUGGESTION_CHIPS,
  type LocalChatMessage,
} from "@/features/consulta-inteligente/constants";
import { useActivePousada, PousadaGateShell, usePousadaGate } from "@/features/pousada";
import { ApiError, handleApiErrorForClient } from "@/services/api";
import type { ConsultaHistoricoItem, ConsultaPeriodo } from "@/types/dto";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  periodoConsultado?: ConsultaPeriodo | null;
  error?: boolean;
};

type PendingRequest = {
  pergunta: string;
  historico: ConsultaHistoricoItem[];
};

type Props = {
  initialPergunta?: string;
};

function formatPeriodo(periodo: ConsultaPeriodo): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  return `${fmt(periodo.de)} – ${fmt(periodo.ate)}`;
}

function toLocalMessages(messages: ChatMessage[]): LocalChatMessage[] {
  return messages
    .filter((message) => !message.error)
    .map(({ role, content }) => ({ role, content }));
}

function createMessageId(): string {
  return crypto.randomUUID();
}

export function ConsultaInteligenteView({ initialPergunta }: Props) {
  const { selectedId: pousadaId, selected } = useActivePousada();
  const gate = usePousadaGate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<PendingRequest | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  const executeConsulta = useCallback(
    async (
      pergunta: string,
      historico: ConsultaHistoricoItem[],
      options: { appendUserMessage: boolean }
    ) => {
      if (!pousadaId) {
        setBannerError("Selecione uma pousada no topo da página.");
        return;
      }

      setBannerError(null);
      setInputError(null);
      setLoading(true);
      setLastRequest({ pergunta, historico });

      if (options.appendUserMessage) {
        setMessages((prev) => [
          ...prev,
          { id: createMessageId(), role: "user", content: pergunta },
        ]);
      }

      try {
        const response = await consultarIAServer({
          pousadaId,
          pergunta,
          historico,
        });

        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: "assistant",
            content: response.resposta,
            periodoConsultado: response.periodoConsultado,
          },
        ]);
        setLastRequest(null);
      } catch (err) {
        if (handleApiErrorForClient(err)) return;

        if (err instanceof ApiError) {
          if (err.status === 404) {
            setBannerError("Pousada não encontrada.");
            return;
          }

          if (err.status === 400) {
            setInputError(err.message || "Pergunta inválida.");
            if (options.appendUserMessage) {
              setMessages((prev) => prev.slice(0, -1));
            }
            return;
          }

          const errorMessage =
            err.status === 503
              ? "Assistente temporariamente indisponível. Tente novamente."
              : err.message || "Não foi possível consultar o assistente.";

          setMessages((prev) => [
            ...prev,
            {
              id: createMessageId(),
              role: "assistant",
              content: errorMessage,
              error: true,
            },
          ]);
          return;
        }

        setMessages((prev) => [
          ...prev,
          {
            id: createMessageId(),
            role: "assistant",
            content: "Não foi possível consultar o assistente.",
            error: true,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [pousadaId]
  );

  const submitPergunta = useCallback(
    async (rawPergunta: string) => {
      const pergunta = rawPergunta.trim();
      if (!pergunta || loading) return;

      if (!pousadaId) {
        setBannerError("Selecione uma pousada no topo da página.");
        return;
      }

      if (pergunta.length > MAX_PERGUNTA_CHARS) {
        setInputError(
          `A pergunta deve ter no máximo ${MAX_PERGUNTA_CHARS} caracteres.`
        );
        return;
      }

      const historico = buildHistoricoParaApi(toLocalMessages(messages));
      setInput("");
      await executeConsulta(pergunta, historico, { appendUserMessage: true });
    },
    [executeConsulta, loading, messages, pousadaId]
  );

  const handleRetry = useCallback(async () => {
    if (!lastRequest || loading) return;

    setMessages((prev) => {
      const last = prev[prev.length - 1];
      return last?.error ? prev.slice(0, -1) : prev;
    });

    await executeConsulta(lastRequest.pergunta, lastRequest.historico, {
      appendUserMessage: false,
    });
  }, [executeConsulta, lastRequest, loading]);

  useEffect(() => {
    const pergunta = initialPergunta?.trim();
    if (!pergunta || initialSentRef.current || !pousadaId) return;
    initialSentRef.current = true;
    void submitPergunta(pergunta);
  }, [initialPergunta, pousadaId, submitPergunta]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    void submitPergunta(input);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submitPergunta(input);
    }
  }

  const showSuggestions = messages.length === 0 && !loading;

  return (
    <PousadaGateShell feature="consulta-ia">
      <div className="flex min-h-0 flex-1 flex-col px-6 py-8">
      <article className="mx-auto flex min-h-0 w-full max-w-3xl flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <header className="shrink-0 border-b border-slate-100 px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="size-5 text-violet-500" aria-hidden />
            <h1 className="text-lg font-semibold text-slate-900">
              Consulta Inteligente
            </h1>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-700">
              Beta
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
            Faça perguntas em linguagem natural e obtenha insights sobre sua
            pousada.
          </p>
          {selected ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <Building2 className="size-3.5 shrink-0" aria-hidden />
              Pousada ativa:{" "}
              <span className="font-medium text-slate-700">{selected.nome}</span>
            </p>
          ) : !gate.blocked ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-700">
              <AlertCircle className="size-3.5 shrink-0" aria-hidden />
              Selecione uma pousada no topo da página.
            </p>
          ) : null}
        </header>

        {bannerError ? (
          <div className="shrink-0 border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-800">
            {bannerError}
          </div>
        ) : null}

        <div
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
          aria-live="polite"
          aria-relevant="additions"
        >
          {showSuggestions ? (
            <div className="mb-4">
              <p className="mb-3 text-sm text-slate-600">
                Experimente uma destas perguntas:
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {SUGGESTION_CHIPS.map(({ id, text, icon: Icon, tone }) => (
                  <button
                    key={id}
                    type="button"
                    disabled={loading || !pousadaId}
                    onClick={() => void submitPergunta(text)}
                    className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-left text-sm leading-snug text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span
                      className={`inline-flex size-7 shrink-0 items-center justify-center rounded-md ${tone}`}
                    >
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                    <span className="min-w-0">{text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-col gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-blue-600 text-white"
                      : message.error
                        ? "border border-red-200 bg-red-50 text-red-900"
                        : "border border-slate-200 bg-slate-50 text-slate-800"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  {message.periodoConsultado ? (
                    <p className="mt-2 text-xs opacity-80">
                      Período consultado:{" "}
                      {formatPeriodo(message.periodoConsultado)}
                    </p>
                  ) : null}
                  {message.error && lastRequest ? (
                    <button
                      type="button"
                      onClick={() => void handleRetry()}
                      disabled={loading}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 text-xs font-medium text-red-800 ring-1 ring-red-200 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      <RefreshCw className="size-3" aria-hidden />
                      Tentar novamente
                    </button>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="flex max-w-[85%] items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
                  <span>Analisando dados da pousada…</span>
                </div>
              </div>
            ) : null}

            <div ref={messagesEndRef} />
          </div>
        </div>

        <footer className="shrink-0 border-t border-slate-100 px-5 py-4">
          {!showSuggestions && input.trim().length === 0 && !loading ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTION_CHIPS.map(({ id, text }) => (
                <button
                  key={id}
                  type="button"
                  disabled={loading || !pousadaId}
                  onClick={() => void submitPergunta(text)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {text}
                </button>
              ))}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (inputError) setInputError(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Faça sua pergunta…"
                rows={2}
                maxLength={MAX_PERGUNTA_CHARS}
                disabled={loading || !pousadaId}
                className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-50"
              />
              {inputError ? (
                <p className="mt-1.5 text-xs text-red-600">{inputError}</p>
              ) : (
                <p className="mt-1.5 text-xs text-slate-400">
                  Enter para enviar · Shift+Enter para nova linha
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading || !pousadaId || !input.trim()}
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Enviar pergunta"
            >
              {loading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
            </button>
          </form>

          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Respostas geradas por IA podem conter imprecisões. Verifique dados
            críticos nos relatórios.
          </p>
        </footer>
      </article>
    </div>
    </PousadaGateShell>
  );
}
