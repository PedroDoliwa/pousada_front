import { DashboardOverview } from "@/features/dashboard";
import { listPousadasServer, loadDashboardExtrasServer } from "@/features/dashboard/actions";

export default async function DashboardPage() {
  const pousadas = await listPousadasServer();
  return <DashboardOverview pousadas={pousadas} loadExtras={loadDashboardExtrasServer} />;
}

