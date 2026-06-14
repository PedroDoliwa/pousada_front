"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import type { EsqueciSenhaActionState } from "@/features/conta/actions";

type Props = {
  action: (
    prevState: EsqueciSenhaActionState,
    formData: FormData
  ) => Promise<EsqueciSenhaActionState>;
};

export function EsqueciSenhaForm({ action }: Props) {
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [state, formAction, isPending] = useActionState<
    EsqueciSenhaActionState,
    FormData
  >(action, {});

  useEffect(() => {
    queueMicrotask(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-slate-100">
        <Loader2 className="size-8 animate-spin text-slate-500" aria-hidden />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200/80">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Esqueci minha senha
          </h1>
          <p className="text-sm text-slate-600">
            Informe seu e-mail para receber um link de redefinição.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              E-mail
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!!state.success}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:bg-slate-50"
              />
            </div>
          </div>

          {state.error ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}
          {state.success ? (
            <p
              className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
              role="status"
            >
              {state.success}
            </p>
          ) : null}

          {!state.success ? (
            <button
              type="submit"
              disabled={isPending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : null}
              Enviar link
            </button>
          ) : null}
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Voltar ao login
          </Link>
        </p>
      </div>
    </div>
  );
}
