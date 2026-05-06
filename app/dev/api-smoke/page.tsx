"use client";

import { useMemo, useState } from "react";
import {
  ApiError,
  getApiBaseUrl,
  listPousadas,
  login,
  setAuthToken,
} from "@/lib/api";

export default function ApiSmokePage() {
  const baseUrl = useMemo(() => getApiBaseUrl(), []);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [log, setLog] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  function appendLog(title: string, data: unknown) {
    const line = `${new Date().toISOString()} — ${title}\n${JSON.stringify(data, null, 2)}\n\n`;
    setLog((prev) => prev + line);
  }

  async function handleLogin() {
    setLoading("login");
    setLog("");
    try {
      const session = await login({ email, senha });
      setAuthToken(session.token);
      appendLog("POST /api/auth/login (sucesso)", {
        ...session,
        token: `${session.token.slice(0, 24)}…`,
      });
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        appendLog("POST /api/auth/login (erro)", {
          status: e.status,
          message: e.message,
          payload: e.payload,
        });
      } else {
        appendLog("Erro inesperado", String(e));
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleListPousadas() {
    setLoading("pousadas");
    try {
      const rows = await listPousadas();
      appendLog("GET /api/pousadas", rows);
    } catch (e: unknown) {
      if (e instanceof ApiError) {
        appendLog("GET /api/pousadas (erro)", {
          status: e.status,
          message: e.message,
          payload: e.payload,
        });
      } else {
        appendLog("Erro inesperado", String(e));
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">
        Smoke test — API
      </h1>
      <p className="mt-2 text-sm text-slate-600">
        Página interna para validar CORS, URL base e rotas. Configure{" "}
        <code className="rounded bg-slate-100 px-1">NEXT_PUBLIC_API_URL</code> em{" "}
        <code className="rounded bg-slate-100 px-1">.env.local</code> e suba a
        API. Não usar em produção.
      </p>

      <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm">
        <p className="font-medium text-slate-800">URL base atual</p>
        <p className="mt-1 break-all text-slate-600">
          {baseUrl ?? (
            <span className="text-amber-700">
              Não definida — defina NEXT_PUBLIC_API_URL e reinicie o{" "}
              <code>npm run dev</code>.
            </span>
          )}
        </p>
      </div>

      <div className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-slate-700">
          E-mail
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Senha
          <input
            className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
            type="password"
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            disabled={!!loading || !baseUrl}
            onClick={handleLogin}
          >
            {loading === "login" ? "Entrando…" : "Login"}
          </button>
          <button
            type="button"
            className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-800 disabled:opacity-50"
            disabled={!!loading || !baseUrl}
            onClick={handleListPousadas}
          >
            {loading === "pousadas" ? "Carregando…" : "GET pousadas"}
          </button>
        </div>
      </div>

      <pre className="mt-8 max-h-[480px] overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-slate-100">
        {log || "Resultados aparecem aqui."}
      </pre>
    </div>
  );
}
