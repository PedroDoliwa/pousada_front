import { DashboardChrome } from "@/features/dashboard";
import { ActivePousadaProvider } from "@/features/pousada";
import { listPousadasServer } from "@/features/pousada/actions";

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pousadas = await listPousadasServer();

  return (
    <ActivePousadaProvider pousadas={pousadas}>
      <DashboardChrome>
        {children}
      </DashboardChrome>
    </ActivePousadaProvider>
  );
}

