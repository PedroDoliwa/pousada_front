import { loadRelatoriosDataServer, RelatoriosView } from "@/features/relatorios";

export default function RelatoriosPage() {
  return <RelatoriosView loadData={loadRelatoriosDataServer} />;
}

