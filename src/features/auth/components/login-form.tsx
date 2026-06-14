"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import { Eye, EyeOff, Loader2, Lock, LogIn, Mail } from "lucide-react";
import type { LoginActionState } from "@/features/auth/actions";

type Props = {
  action: (
    prevState: LoginActionState,
    formData: FormData
  ) => Promise<LoginActionState>;
  redirectTo?: string;
};

export function LoginForm({ action, redirectTo = "/dashboard" }: Props) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  /** false enquanto checa storage no cliente (evita flash do formulário). */
  const [ready, setReady] = useState(false);
  const [state, formAction, isPending] = useActionState<
    LoginActionState,
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
            Sistema de Pousada
          </h1>
          <p className="text-sm text-slate-600">
            Gestão inteligente para a sua pousada
          </p>
        </div>

        <form action={formAction} className="mt-8 space-y-5">
          <input type="hidden" name="redirectTo" value={redirectTo} />
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
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="senha"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Senha
            </label>
            <div className="relative">
              <Lock
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden
              />
              <input
                id="senha"
                name="senha"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                placeholder="Digite sua senha"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-10 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 text-sm">
            <Link
              href="/esqueci-senha"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Esqueci a senha
            </Link>
          </div>

          {state?.error ? (
            <p
              className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!email || !senha || isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <LogIn className="size-4" aria-hidden />
            )}
            {isPending ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-slate-600">
          Não tem conta?{" "}
          <a
            href="/registro"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Criar conta
          </a>
        </p>

      <p className="mt-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Sistema de Pousada. Todos os direitos
        reservados.
      </p>
    </div>
  );
}

