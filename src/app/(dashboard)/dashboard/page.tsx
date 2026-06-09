import { DashboardOverview } from "@/features/dashboard";
import { loadDashboardDataServer } from "@/features/dashboard/actions";

export default function DashboardPage() {
  return <DashboardOverview loadData={loadDashboardDataServer} />;
}
