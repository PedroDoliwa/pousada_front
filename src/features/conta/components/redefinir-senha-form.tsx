"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, KeyRound, Loader2 } from "lucide-react";
import type { RedefinirSenhaActionState } from "@/features/conta/actions";

type Props = {
  action: (
    prevState: RedefinirSenhaActionState,
    formData: FormData
  ) => Promise<RedefinirSenhaActionState>;
  token: string | null;
};

export function RedefinirSenhaForm({ action, token }: Props) {
  const [senhaNova, setSenhaNova] = useState("");
  const [senhaConfirmacao, setSenhaConfirmacao] = useState("");
  const [showSenhaNova, setShowSenhaNova] = useState(false);
  const [showSenhaConfirmacao, setShowSenhaConfirmacao] = useState(false);
  const [ready, setReady] = useState(false);
  const [state, formAction, isPending] = useActionState<
    RedefinirSenhaActionState,
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

  if (!token) {
    return (
      <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-slate-100 px-4 py-12">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200/80 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Link inválido
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            O link de redefinição de senha é inválido ou expirou. Solicite um
            novo link.
          </p>
          <p className="mt-6 text-sm">
            <Link
              href="/esqueci-senha"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Solicitar novo link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-full flex-1 flex-col items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200/80">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Redefinir senha
          </h1>
          <p className="text-sm text-slate-600">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-5">
          <input type="hidden" name="token" value={token} />

          <div>
            <label
              htmlFor="senhaNova"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Nova senha
            </label>
            <div className="relative">
              <input
                id="senhaNova"
                name="senhaNova"
                type={showSenhaNova ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={senhaNova}
                onChange={(e) => setSenhaNova(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-3 pr-10 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => setShowSenhaNova((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={showSenhaNova ? "Ocultar senha" : "Mostrar senha"}
              >
                {showSenhaNova ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="senhaConfirmacao"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Confirmar nova senha
            </label>
            <div className="relative">
              <input
                id="senhaConfirmacao"
                name="senhaConfirmacao"
                type={showSenhaConfirmacao ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={6}
                value={senhaConfirmacao}
                onChange={(e) => setSenhaConfirmacao(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-3 pr-10 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => setShowSenhaConfirmacao((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={
                  showSenhaConfirmacao ? "Ocultar senha" : "Mostrar senha"
                }
              >
                {showSenhaConfirmacao ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
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

          <button
            type="submit"
            disabled={isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <KeyRound className="size-4" aria-hidden />
            )}
            Redefinir senha
          </button>
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
