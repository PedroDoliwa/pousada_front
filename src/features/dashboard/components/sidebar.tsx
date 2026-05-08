"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, LogOut } from "lucide-react";
import { DASHBOARD_NAV, DashboardMark } from "@/features/dashboard";

type SidebarProps = {
  onLogout: () => void;
};

export function Sidebar({ onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800 bg-[#0F172A] text-slate-200">
      <div className="border-b border-slate-800 px-4 py-5">
        <DashboardMark />
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
        {DASHBOARD_NAV.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname === href || pathname.startsWith(`${href}/`);
          const cls = active
            ? "flex items-center gap-3 rounded-lg bg-blue-600 px-3 py-2.5 text-sm font-medium text-white transition"
            : "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white";

          return (
            <Link key={href} href={href} className={cls}>
              <Icon className="size-5 shrink-0 opacity-90" aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 rounded-lg bg-slate-800/80 px-3 py-2.5">
          <div className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            U
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              Usuário
            </p>
            <p className="truncate text-xs text-slate-400">Sessão ativa</p>
          </div>
          <ChevronDown className="size-4 shrink-0 text-slate-500" aria-hidden />
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <LogOut className="size-4" aria-hidden />
          Sair
        </button>
      </div>
    </aside>
  );
}

