"use client";

import { Loader2, Mail, Save, User } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  solicitarRedefinicaoAction,
  updatePerfilAction,
  type PerfilActionState,
  type SolicitarRedefinicaoState,
} from "@/features/conta/actions";
import { UsuarioFotoSection } from "@/features/conta/components/usuario-foto-section";
import type { UsuarioPerfil } from "@/types/dto";

type Props = {
  initialPerfil: UsuarioPerfil;
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description ? (
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function ConfiguracoesView({ initialPerfil }: Props) {
  const router = useRouter();
  const [nome, setNome] = useState(initialPerfil.nome);
  const [perfil, setPerfil] = useState(initialPerfil);
  const [redefinicaoLoading, setRedefinicaoLoading] = useState(false);
  const [redefinicaoState, setRedefinicaoState] =
    useState<SolicitarRedefinicaoState | null>(null);

  const [perfilState, perfilAction, perfilPending] = useActionState<
    PerfilActionState,
    FormData
  >(updatePerfilAction, {});

  useEffect(() => {
    setNome(initialPerfil.nome);
    setPerfil(initialPerfil);
  }, [initialPerfil]);

  useEffect(() => {
    if (perfilState.perfil) {
      setPerfil(perfilState.perfil);
      setNome(perfilState.perfil.nome);
      router.refresh();
    }
  }, [perfilState.perfil, router]);

  async function handleSolicitarRedefinicao() {
    setRedefinicaoLoading(true);
    setRedefinicaoState(null);
    try {
      const result = await solicitarRedefinicaoAction();
      setRedefinicaoState(result);
    } finally {
      setRedefinicaoLoading(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 lg:p-8">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <UsuarioFotoSection nome={perfil.nome} temFoto={perfil.temFoto} />

        <SectionCard title="Dados da conta">
          <form action={perfilAction} className="space-y-4">
            <div>
              <label
                htmlFor="nome"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Nome
              </label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden
                />
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                />
              </div>
            </div>

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
                  type="email"
                  value={perfil.email}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-slate-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="perfil"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Perfil
              </label>
              <input
                id="perfil"
                type="text"
                value={perfil.perfil}
                disabled
                className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 py-2.5 px-3 text-slate-500"
              />
            </div>

            {perfilState.error ? (
              <p
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
                role="alert"
              >
                {perfilState.error}
              </p>
            ) : null}
            {perfilState.success ? (
              <p
                className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
                role="status"
              >
                {perfilState.success}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={perfilPending}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {perfilPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Save className="size-4" aria-hidden />
              )}
              Salvar nome
            </button>
          </form>
        </SectionCard>

        <SectionCard
          title="Recuperação de senha"
          description="Envia um link de redefinição para o e-mail cadastrado na sua conta."
        >
          {redefinicaoState?.error ? (
            <p
              className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800"
              role="alert"
            >
              {redefinicaoState.error}
            </p>
          ) : null}
          {redefinicaoState?.success ? (
            <p
              className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-800"
              role="status"
            >
              {redefinicaoState.success}
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleSolicitarRedefinicao}
            disabled={redefinicaoLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 disabled:opacity-60"
          >
            {redefinicaoLoading ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Mail className="size-4" aria-hidden />
            )}
            Esqueci minha senha
          </button>
        </SectionCard>
      </div>
    </div>
  );
}
