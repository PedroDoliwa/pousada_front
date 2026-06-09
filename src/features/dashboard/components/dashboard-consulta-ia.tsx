"use client";

import { Send, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { SUGGESTION_CHIPS } from "@/features/consulta-inteligente/constants";

export function DashboardConsultaIa() {
  const router = useRouter();
  const [pergunta, setPergunta] = useState("");

  const navigateToConsulta = useCallback(
    (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) return;
      router.push(`/consulta-inteligente?q=${encodeURIComponent(trimmed)}`);
    },
    [router]
  );

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-violet-500" aria-hidden />
          <h2 className="text-sm font-semibold text-slate-900">
            Consulta Inteligente
          </h2>
          <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-violet-700">
            Beta
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          Faça perguntas em linguagem natural e obtenha insights sobre sua
          pousada.
        </p>
      </div>

      <div className="flex flex-col gap-2.5 px-4 py-3">
        <div className="grid grid-cols-1 gap-1.5">
          {SUGGESTION_CHIPS.map(({ id, icon: Icon, tone, text }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPergunta(text)}
              className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-2 text-left text-[11px] leading-snug text-slate-700 transition hover:border-blue-200 hover:bg-blue-50/40"
            >
              <span
                className={`inline-flex size-6 shrink-0 items-center justify-center rounded-md ${tone}`}
              >
                <Icon className="size-3" aria-hidden />
              </span>
              <span className="min-w-0 truncate">{text}</span>
            </button>
          ))}
        </div>

        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            navigateToConsulta(pergunta);
          }}
        >
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Faça sua pergunta..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-xs text-slate-900 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            type="submit"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white transition hover:bg-blue-700"
            aria-label="Enviar pergunta"
          >
            <Send className="size-3.5" aria-hidden />
          </button>
        </form>

        <p className="text-[10px] leading-relaxed text-slate-400">
          Respostas geradas por IA podem conter imprecisões.{" "}
          <Link
            href="/consulta-inteligente"
            className="text-blue-600 hover:underline"
          >
            Abrir consulta completa
          </Link>
        </p>
      </div>
    </article>
  );
}
