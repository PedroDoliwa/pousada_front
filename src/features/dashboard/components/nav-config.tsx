import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BedDouble,
  Building2,
  CalendarDays,
  CalendarRange,
  LayoutDashboard,
  Plug,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const DASHBOARD_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/pousadas", label: "Pousada", icon: Building2 },
  { href: "/quartos", label: "Quartos", icon: BedDouble },
  { href: "/hospedes", label: "Hóspedes", icon: Users },
  { href: "/reservas", label: "Reservas", icon: CalendarRange },
  { href: "/calendario", label: "Calendário", icon: CalendarDays },
  { href: "/integracoes-ical", label: "Integração", icon: Plug },
  { href: "/consulta-inteligente", label: "Consulta Inteligente", icon: Sparkles },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export function DashboardMark({ className }: { className?: string }) {
  return (
    <div className={className}>
      <span className="text-lg font-semibold leading-tight text-white">
        Sistema de Pousada
      </span>
    </div>
  );
}

