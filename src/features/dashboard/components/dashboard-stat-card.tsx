import type { LucideIcon } from "lucide-react";
import { sparklinePoints } from "@/features/dashboard/utils";

type Props = {
  icon: LucideIcon;
  title: string;
  value: string;
  delta: string;
  positive: boolean;
  tone: string;
  sparkSeed: number;
};

function MiniSparkline({
  points,
  color,
}: {
  points: number[];
  color: string;
}) {
  const w = 120;
  const h = 32;
  const coords = points
    .map((y, i) => {
      const x = (i / (points.length - 1)) * w;
      const py = h - y * h;
      return `${x},${py}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="h-8 w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coords}
        opacity="0.85"
      />
    </svg>
  );
}

export function DashboardStatCard({
  icon: Icon,
  title,
  value,
  delta,
  positive,
  tone,
  sparkSeed,
}: Props) {
  const sparkColor =
    tone.includes("blue")
      ? "#3B82F6"
      : tone.includes("emerald")
        ? "#10B981"
        : tone.includes("violet")
          ? "#8B5CF6"
          : "#F59E0B";

  const points = sparklinePoints(sparkSeed, positive);

  return (
    <article className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${tone}`}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p
            className={`mt-1 text-xs font-medium ${
              positive ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {delta}
          </p>
        </div>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-3">
        <MiniSparkline points={points} color={sparkColor} />
      </div>
    </article>
  );
}
