import { getSessionUserServer } from "@/features/auth/server/get-session-user";
import { DashboardChrome } from "@/features/dashboard";
import { ActivePousadaProvider } from "@/features/pousada";
import { listPousadasServer } from "@/features/pousada/actions";

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [pousadas, user] = await Promise.all([
    listPousadasServer(),
    getSessionUserServer(),
  ]);

  return (
    <ActivePousadaProvider pousadas={pousadas}>
      <DashboardChrome user={user}>{children}</DashboardChrome>
    </ActivePousadaProvider>
  );
}
