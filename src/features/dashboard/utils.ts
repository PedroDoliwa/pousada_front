import type { CalendarioExterno, Metricas } from "@/types/entities";

const MS_PER_MINUTE = 60_000;
const SYNC_STALE_MINUTES = 30;

/** Intervalo `[de, ate]` do mês corrente ou deslocado em meses. */
export function monthRange(offsetMonths = 0): { de: string; ate: string } {
  const anchor = new Date();
  anchor.setDate(1);
  anchor.setMonth(anchor.getMonth() + offsetMonths);
  const start = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    1,
    0,
    0,
    0
  );
  const end = new Date(
    anchor.getFullYear(),
    anchor.getMonth() + 1,
    0,
    23,
    59,
    59
  );
  return { de: start.toISOString(), ate: end.toISOString() };
}

export function monthLabel(offsetMonths = 0): string {
  const anchor = new Date();
  anchor.setDate(1);
  anchor.setMonth(anchor.getMonth() + offsetMonths);
  const label = anchor.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

export function formatDeltaCount(delta: number, unit: string): string {
  if (delta === 0) return "igual ao mês anterior";
  const sign = delta > 0 ? "+" : "-";
  const abs = Math.abs(delta);
  const label = abs === 1 ? unit : `${unit}s`;
  return `${sign} ${abs} ${label} em relação ao mês anterior`;
}

export function formatDeltaPercent(delta: number): string {
  const sign = delta > 0 ? "+" : "";
  if (delta === 0) return "igual ao mês anterior";
  return `${sign} ${Math.abs(Math.round(delta))}% em relação ao mês anterior`;
}

export function formatDeltaCurrencyPercent(
  atual: number,
  anterior: number
): string {
  if (anterior === 0) {
    if (atual === 0) return "igual ao mês anterior";
    return "+ 100% em relação ao mês anterior";
  }
  const pct = ((atual - anterior) / anterior) * 100;
  const sign = pct > 0 ? "+" : "";
  if (Math.round(pct) === 0) return "igual ao mês anterior";
  return `${sign} ${Math.abs(Math.round(pct))}% em relação ao mês anterior`;
}

export type MetricDelta = {
  text: string;
  positive: boolean;
};

export function metricDeltas(
  atual: Metricas,
  anterior: Metricas
): {
  reservas: MetricDelta;
  ocupacao: MetricDelta;
  faturamento: MetricDelta;
  hospedes: MetricDelta;
} {
  const reservasDelta = atual.totalReservas - anterior.totalReservas;
  const ocupacaoDelta =
    atual.taxaOcupacaoPercentual - anterior.taxaOcupacaoPercentual;
  const hospedesDelta = atual.hospedesUnicos - anterior.hospedesUnicos;
  const faturamentoPct =
    anterior.faturamentoTotal === 0
      ? atual.faturamentoTotal > 0
        ? 100
        : 0
      : ((atual.faturamentoTotal - anterior.faturamentoTotal) /
          anterior.faturamentoTotal) *
        100;

  return {
    reservas: {
      text: formatDeltaCount(reservasDelta, "reserva"),
      positive: reservasDelta >= 0,
    },
    ocupacao: {
      text: formatDeltaPercent(ocupacaoDelta),
      positive: ocupacaoDelta >= 0,
    },
    faturamento: {
      text: formatDeltaCurrencyPercent(
        atual.faturamentoTotal,
        anterior.faturamentoTotal
      ),
      positive: faturamentoPct >= 0,
    },
    hospedes: {
      text: formatDeltaCount(hospedesDelta, "hóspede"),
      positive: hospedesDelta >= 0,
    },
  };
}

/** Feeds ativos que nunca sincronizaram, falharam ou estão desatualizados. */
export function isCalendarioPendenteSync(feed: CalendarioExterno): boolean {
  if (!feed.ativo) return false;
  if (feed.ultimoErro?.trim()) return true;
  if (!feed.ultimaSincronizacao) return true;
  const last = new Date(feed.ultimaSincronizacao).getTime();
  if (Number.isNaN(last)) return true;
  return Date.now() - last > SYNC_STALE_MINUTES * MS_PER_MINUTE;
}

/** Pontos normalizados (0–1) para mini sparkline decorativa. */
export function sparklinePoints(seed: number, positive: boolean): number[] {
  const base = 0.35 + (seed % 7) * 0.04;
  const trend = positive ? 0.06 : -0.06;
  return Array.from({ length: 8 }, (_, i) => {
    const wave = Math.sin(i * 0.9 + seed) * 0.08;
    const value = base + trend * i + wave;
    return Math.min(0.95, Math.max(0.12, value));
  });
}

export function formatDayMonth(iso: string): { day: string; month: string } {
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    month: d
      .toLocaleDateString("pt-BR", { month: "short" })
      .replace(".", "")
      .toUpperCase(),
  };
}

export function formatTimeBR(iso: string): string {
  return new Date(iso).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function isReservaAtiva(status: string): boolean {
  return !(status ?? "").toLowerCase().includes("cancel");
}
