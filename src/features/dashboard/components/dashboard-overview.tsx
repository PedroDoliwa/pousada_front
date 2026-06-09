"use client";

import {
  CalendarDays,
  DollarSign,
  Loader2,
  PieChart,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { DashboardData } from "@/features/dashboard/actions";
import { useDashboardUi } from "@/features/dashboard/dashboard-ui-context";
import { DashboardCheckinsPanel } from "@/features/dashboard/components/dashboard-checkins-panel";
import { DashboardConsultaIa } from "@/features/dashboard/components/dashboard-consulta-ia";
import { DashboardIcalBanner } from "@/features/dashboard/components/dashboard-ical-banner";
import { DashboardOcupacaoResumo } from "@/features/dashboard/components/dashboard-ocupacao-resumo";
import { DashboardStatCard } from "@/features/dashboard/components/dashboard-stat-card";
import {
  formatPercent,
  metricDeltas,
  monthLabel,
} from "@/features/dashboard/utils";
import { useActivePousada } from "@/features/pousada";
import { formatCurrencyBRL } from "@/features/reservas/utils";
import { ApiError, handleApiErrorForClient } from "@/services/api";

type Props = {
  loadData: (pousadaId: number) => Promise<DashboardData>;
};

export function DashboardOverview({ loadData }: Props) {
  const { setPendingIcalCount } = useDashboardUi();
  const { pousadas, selectedId, selected } = useActivePousada();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (selectedId == null) return;
    let cancelled = false;
    queueMicrotask(() => setLoading(true));
    (async () => {
      try {
        const result = await loadData(selectedId);
        if (cancelled) return;
        queueMicrotask(() => {
          setData(result);
          setPendingIcalCount(result.calendariosPendentes.length);
          setError(null);
          setLoading(false);
        });
      } catch (e) {
        if (cancelled) return;
        if (handleApiErrorForClient(e)) return;
        setError(
          e instanceof ApiError ? e.message : "Não foi possível carregar o dashboard."
        );
        queueMicrotask(() => {
          setData(null);
          setPendingIcalCount(0);
          setLoading(false);
        });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, loadData, setPendingIcalCount]);

  const deltas = useMemo(
    () =>
      data
        ? metricDeltas(data.metricasAtual, data.metricasAnterior)
        : null,
    [data]
  );

  if (pousadas.length === 0) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-slate-600">
          Nenhuma pousada cadastrada.{" "}
          <Link
            href="/pousadas"
            className="font-medium text-blue-600 hover:text-blue-700"
          >
            Cadastre sua primeira pousada
          </Link>
        </p>
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="px-6 py-8">
        <p className="text-sm text-slate-600">Selecione uma pousada ativa.</p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-10 animate-spin text-slate-400" aria-hidden />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="px-6 py-8">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      </div>
    );
  }

  if (!data || !deltas) return null;

  const { metricasAtual, quartos, ocupacao, reservas, hospedes, calendariosPendentes } =
    data;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-6 overflow-x-hidden px-6 py-6">
      {error ? (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </p>
      ) : null}

      <div className="grid min-w-0 gap-4 sm:grid-cols-2 xl:grid-cols-12">
        <div className="min-w-0 xl:col-span-3">
          <DashboardStatCard
            icon={CalendarDays}
            title="Reservas no mês"
            value={String(metricasAtual.totalReservas)}
            delta={deltas.reservas.text}
            positive={deltas.reservas.positive}
            tone="bg-blue-50 text-blue-600"
            sparkSeed={metricasAtual.totalReservas}
          />
        </div>
        <div className="min-w-0 xl:col-span-3">
          <DashboardStatCard
            icon={PieChart}
            title="Taxa de Ocupação"
            value={formatPercent(metricasAtual.taxaOcupacaoPercentual)}
            delta={deltas.ocupacao.text}
            positive={deltas.ocupacao.positive}
            tone="bg-emerald-50 text-emerald-600"
            sparkSeed={Math.round(metricasAtual.taxaOcupacaoPercentual)}
          />
        </div>
        <div className="min-w-0 xl:col-span-3">
          <DashboardStatCard
            icon={DollarSign}
            title={`Faturamento em ${monthLabel(0)}`}
            value={formatCurrencyBRL(metricasAtual.faturamentoTotal)}
            delta={deltas.faturamento.text}
            positive={deltas.faturamento.positive}
            tone="bg-violet-50 text-violet-600"
            sparkSeed={Math.round(metricasAtual.faturamentoTotal / 100)}
          />
        </div>
        <div className="min-w-0 xl:col-span-3">
          <DashboardStatCard
            icon={Users}
            title="Hóspedes Recebidos"
            value={String(metricasAtual.hospedesUnicos)}
            delta={deltas.hospedes.text}
            positive={deltas.hospedes.positive}
            tone="bg-amber-50 text-amber-600"
            sparkSeed={metricasAtual.hospedesUnicos}
          />
        </div>

        <div className="min-w-0 sm:col-span-2 xl:col-span-6">
          <DashboardOcupacaoResumo quartos={quartos} ocupacao={ocupacao} />
        </div>
        <div className="min-w-0 xl:col-span-3">
          <DashboardCheckinsPanel
            reservas={reservas}
            quartos={quartos}
            hospedes={hospedes}
          />
        </div>
        <div className="min-w-0 xl:col-span-3">
          <DashboardConsultaIa />
        </div>
      </div>

      <DashboardIcalBanner pendingCount={calendariosPendentes.length} />
    </div>
  );
}
