import { ConfiguracoesView } from "@/features/conta/components/configuracoes-view";
import { getPerfilServer } from "@/features/conta";

export default async function ConfiguracoesPage() {
  const perfil = await getPerfilServer();
  return <ConfiguracoesView initialPerfil={perfil} />;
}

