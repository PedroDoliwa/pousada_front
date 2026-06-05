import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BedDouble,
  CalendarDays,
  CalendarRange,
  LogIn,
  Sparkles,
  Users,
} from "lucide-react";

const FEATURES = [
  {
    icon: CalendarRange,
    title: "Reservas centralizadas",
    description:
      "Cadastre, acompanhe e edite reservas em um só lugar, com visão clara da ocupação.",
  },
  {
    icon: CalendarDays,
    title: "Calendário visual",
    description:
      "Veja disponibilidade por quarto e evite conflitos de hospedagem com poucos cliques.",
  },
  {
    icon: Users,
    title: "Hóspedes organizados",
    description:
      "Mantenha o histórico e os dados dos hóspedes sempre à mão para um atendimento ágil.",
  },
  {
    icon: BedDouble,
    title: "Gestão de quartos",
    description:
      "Configure tipos, capacidades e tarifas para refletir a realidade da sua pousada.",
  },
  {
    icon: Sparkles,
    title: "Consulta inteligente",
    description:
      "Encontre informações rapidamente com busca assistida por IA no dia a dia da operação.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e métricas",
    description:
      "Acompanhe indicadores de ocupação e receita para tomar decisões com mais segurança.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-sm">
              SP
            </span>
            <span className="text-base font-semibold tracking-tight text-slate-900">
              Sistema de Pousada
            </span>
          </Link>

          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <LogIn className="size-4" aria-hidden />
            Entrar
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-slate-200/80 bg-white">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.12),transparent_55%)]"
            aria-hidden
          />
          <div className="pointer-events-none absolute -right-24 top-10 size-72 rounded-full bg-blue-100/60 blur-3xl" aria-hidden />
          <div className="pointer-events-none absolute -left-16 bottom-0 size-56 rounded-full bg-slate-200/70 blur-3xl" aria-hidden />

          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-28">
            <div>
              <p className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
                Gestão completa para pousadas
              </p>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.25rem] lg:leading-tight">
                Sua pousada organizada, do check-in ao relatório.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
                Reservas, calendário, hóspedes e integrações em uma plataforma
                pensada para simplificar a rotina de quem administra hospedagem.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
                >
                  Acessar plataforma
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/registro"
                  className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
                >
                  Criar conta
                </Link>
              </div>

              <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-slate-200 pt-8">
                <div>
                  <dt className="text-2xl font-bold text-slate-900">24/7</dt>
                  <dd className="mt-1 text-sm text-slate-600">Acesso online</dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold text-slate-900">1</dt>
                  <dd className="mt-1 text-sm text-slate-600">Painel unificado</dd>
                </div>
                <div>
                  <dt className="text-2xl font-bold text-slate-900">+6</dt>
                  <dd className="mt-1 text-sm text-slate-600">Módulos integrados</dd>
                </div>
              </dl>
            </div>

            <div className="relative">
              <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 shadow-2xl shadow-slate-900/20">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Visão geral
                    </p>
                    <p className="mt-1 text-lg font-semibold text-white">
                      Painel da pousada
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                    Online
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Reservas hoje", value: "12" },
                    { label: "Taxa de ocupação", value: "87%" },
                    { label: "Check-ins", value: "5" },
                    { label: "Quartos livres", value: "3" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/10 bg-white/5 p-4"
                    >
                      <p className="text-xs text-slate-400">{item.label}</p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs text-slate-400">Próximas chegadas</p>
                  <ul className="mt-3 space-y-2 text-sm text-slate-200">
                    <li className="flex items-center justify-between gap-3">
                      <span>Quarto 03 · Maria Silva</span>
                      <span className="text-slate-400">14:00</span>
                    </li>
                    <li className="flex items-center justify-between gap-3">
                      <span>Quarto 07 · João Pereira</span>
                      <span className="text-slate-400">16:30</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Tudo o que você precisa para operar com tranquilidade
            </h2>
            <p className="mt-3 text-lg text-slate-600">
              Ferramentas práticas para o dia a dia, sem planilhas soltas nem
              informações espalhadas.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-slate-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-slate-200/80 bg-white">
          <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Pronto para entrar na plataforma?
              </h2>
              <p className="mt-2 max-w-xl text-slate-600">
                Faça login com sua conta e comece a gerenciar reservas, hóspedes
                e calendário agora mesmo.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              <LogIn className="size-4" aria-hidden />
              Fazer login
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Sistema de Pousada. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
              Login
            </Link>
            <Link href="/registro" className="font-medium text-slate-600 hover:text-slate-800">
              Criar conta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
