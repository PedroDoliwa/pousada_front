import { DashboardOverview } from "@/features/dashboard";
import { loadDashboardExtrasServer } from "@/features/dashboard/actions";

export default function DashboardPage() {
  return <DashboardOverview loadExtras={loadDashboardExtrasServer} />;
}

