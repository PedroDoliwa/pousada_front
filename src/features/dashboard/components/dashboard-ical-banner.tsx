import { Bell, RefreshCw } from "lucide-react";
import Link from "next/link";

type Props = {
  pendingCount: number;
};

export function DashboardIcalBanner({ pendingCount }: Props) {
  if (pendingCount <= 0) return null;

  const label =
    pendingCount === 1
      ? "1 importação iCal pendente"
      : `${pendingCount} importações iCal pendentes`;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
          <Bell className="size-5" aria-hidden />
        </span>
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">Atenção</span> Você
          possui {label} para sincronização.
        </p>
      </div>
      <Link
        href="/integracoes-ical"
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
      >
        <RefreshCw className="size-4" aria-hidden />
        Sincronizar agora
      </Link>
    </div>
  );
}
