import type { OcupacaoPeriodo } from "@/types/entities";

export type ViewMode = "mes" | "semana" | "lista";

export type DayCell = {
  date: Date;
  key: string;
  weekdayShort: string;
  dayNum: number;
  isWeekend: boolean;
  isToday: boolean;
};

const WEEKDAYS_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const MS_PER_DAY = 86_400_000;

function atMidnight(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Diferença em dias inteiros entre a meia-noite de `a` e a de `b`. */
export function dayDiff(a: Date, b: Date): number {
  return Math.round((atMidnight(b).getTime() - atMidnight(a).getTime()) / MS_PER_DAY);
}

export function buildDayCell(date: Date, today: Date): DayCell {
  const weekday = date.getDay();
  return {
    date,
    key: dayKey(date),
    weekdayShort: WEEKDAYS_SHORT[weekday]!,
    dayNum: date.getDate(),
    isWeekend: weekday === 0 || weekday === 6,
    isToday: isSameDay(date, today),
  };
}

function monthDays(anchor: Date): Date[] {
  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const count = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: count }, (_, i) => new Date(y, m, i + 1));
}

function weekDays(anchor: Date): Date[] {
  const start = atMidnight(anchor);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

/** Dias visíveis na grade conforme o modo de visualização. */
export function visibleDays(anchor: Date, mode: ViewMode): Date[] {
  return mode === "semana" ? weekDays(anchor) : monthDays(anchor);
}

/** Limites ISO `[de, ate]` cobrindo o período visível. */
export function rangeBounds(days: Date[]): { de: string; ate: string } {
  const first = days[0]!;
  const last = days[days.length - 1]!;
  const start = new Date(
    first.getFullYear(),
    first.getMonth(),
    first.getDate(),
    0,
    0,
    0
  );
  const end = new Date(
    last.getFullYear(),
    last.getMonth(),
    last.getDate(),
    23,
    59,
    59
  );
  return { de: start.toISOString(), ate: end.toISOString() };
}

export function shiftAnchor(anchor: Date, mode: ViewMode, dir: -1 | 1): Date {
  const next = new Date(anchor);
  if (mode === "semana") {
    next.setDate(next.getDate() + dir * 7);
  } else {
    next.setMonth(next.getMonth() + dir);
  }
  return next;
}

export function periodLabel(anchor: Date, mode: ViewMode, days: Date[]): string {
  if (mode === "semana") {
    const fmt = (d: Date) =>
      d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    return `${fmt(days[0]!)} – ${fmt(days[days.length - 1]!)}`;
  }
  const label = anchor.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatDateBR(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function isCancelada(status: string | null | undefined): boolean {
  return (status ?? "").toLowerCase().includes("cancel");
}

export function isImportada(origem: string | null | undefined): boolean {
  return (origem ?? "Manual") !== "Manual";
}

export type OcupacaoTone = {
  /** Classes para a barra (borda + fundo + texto). */
  bar: string;
  /** Classe de cor do indicador na legenda. */
  dot: string;
};

export function ocupacaoTone(o: OcupacaoPeriodo): OcupacaoTone {
  if (isImportada(o.origem)) {
    return { bar: "border-violet-300 bg-violet-100 text-violet-900", dot: "bg-violet-400" };
  }
  if ((o.status ?? "").toLowerCase().includes("pend")) {
    return { bar: "border-amber-300 bg-amber-100 text-amber-900", dot: "bg-amber-400" };
  }
  return { bar: "border-blue-300 bg-blue-100 text-blue-900", dot: "bg-blue-500" };
}

/** Rótulo principal exibido na barra da reserva. */
export function ocupacaoTitulo(o: OcupacaoPeriodo): string {
  const nome = o.hospedeNome?.trim() || "Reserva";
  return isImportada(o.origem) ? `${o.origem} · ${nome}` : nome;
}

/** Rótulo secundário (origem/status) exibido na barra. */
export function ocupacaoSubtitulo(o: OcupacaoPeriodo): string {
  if (isImportada(o.origem)) return "Importado (iCal)";
  return o.status?.trim() || "Reserva";
}

/** Noites de uma ocupação dentro do período visível. */
export function nightsInRange(
  o: OcupacaoPeriodo,
  rangeStart: Date,
  rangeEndExclusive: Date
): number {
  const entrada = new Date(o.dataEntrada);
  const saida = new Date(o.dataSaida);
  const start = entrada > rangeStart ? entrada : rangeStart;
  const end = saida < rangeEndExclusive ? saida : rangeEndExclusive;
  const nights = Math.round((end.getTime() - start.getTime()) / MS_PER_DAY);
  return Math.max(0, nights);
}
