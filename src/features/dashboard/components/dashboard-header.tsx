"use client";

import { CalendarDays } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

const ROUTE_META: Record<
  string,
  { title: string; subtitleKey?: "greeting"; subtitle?: string }
> = {
  "/dashboard": {
    title: "Dashboard",
    subtitleKey: "greeting",
  },
  "/pousadas": { title: "Pousada" },
  "/quartos": {
    title: "Quartos",
    subtitle: "Gerencie os quartos e suas informações.",
  },
  "/hospedes": {
    title: "Hóspedes",
    subtitle:
      "Cadastre, edite e consulte os hóspedes da sua pousada.",
  },
  "/reservas": {
    title: "Reservas",
    subtitle: "Visualize, edite ou cancele reservas da sua pousada.",
  },
  "/calendario": { title: "Calendário" },
  "/integracoes-ical": {
    title: "Integrações",
    subtitle:
      "Importe reservas do Airbnb ou Booking e exporte bloqueios para as plataformas.",
  },
  "/consulta-inteligente": { title: "Consulta Inteligente" },
  "/relatorios": { title: "Relatórios" },
  "/configuracoes": { title: "Configurações" },
};

type Props = {
  userName: string;
};

function resolveMeta(pathname: string) {
  if (pathname === "/reservas/nova") {
    return {
      title: "Nova reserva",
      subtitle: "Cadastre uma reserva manual com verificação de disponibilidade.",
    };
  }
  if (/^\/reservas\/\d+\/editar$/.test(pathname)) {
    return {
      title: "Editar reserva",
      subtitle: "Altere datas, hóspede ou quarto da reserva manual.",
    };
  }
  if (/^\/reservas\/\d+$/.test(pathname)) {
    return {
      title: "Detalhe da reserva",
      subtitle: "Visualização de reserva importada ou manual.",
    };
  }
  return (
    ROUTE_META[pathname] ?? {
      title: "Painel",
      subtitleKey: "greeting" as const,
    }
  );
}

export function DashboardHeader({ userName }: Props) {
  const pathname = usePathname();
  const meta = resolveMeta(pathname);

  const firstName = useMemo(
    () => userName.split(/\s+/)[0] ?? userName,
    [userName]
  );

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    []
  );

  const subtitle =
    meta.subtitleKey === "greeting"
      ? `Bem-vindo(a), ${firstName}! Veja o resumo da sua pousada hoje.`
      : meta.subtitle ??
        `Gerencie as informações de ${meta.title.toLowerCase()}.`;

  return (
    <header className="flex shrink-0 flex-wrap items-start justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {meta.title}
        </h1>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <CalendarDays className="size-4 text-slate-500" aria-hidden />
          <span className="hidden capitalize sm:inline">{dateLabel}</span>
        </button>
      </div>
    </header>
  );
}

