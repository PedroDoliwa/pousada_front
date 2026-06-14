import { getSessionUserServer } from "@/features/auth/server/get-session-user";
import { getPerfilServer } from "@/features/conta";
import { DashboardChrome } from "@/features/dashboard";
import { ActivePousadaProvider } from "@/features/pousada";
import { listPousadasServer } from "@/features/pousada/actions";
import type { SessionUser } from "@/features/auth/session-user";

async function loadSidebarUser(): Promise<SessionUser | null> {
  try {
    const perfil = await getPerfilServer();
    return {
      nome: perfil.nome,
      email: perfil.email,
      perfil: perfil.perfil,
      temFoto: perfil.temFoto,
    };
  } catch {
    return getSessionUserServer();
  }
}

export default async function DashboardGroupLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [pousadas, user] = await Promise.all([
    listPousadasServer(),
    loadSidebarUser(),
  ]);

  return (
    <ActivePousadaProvider pousadas={pousadas}>
      <DashboardChrome user={user}>{children}</DashboardChrome>
    </ActivePousadaProvider>
  );
}
