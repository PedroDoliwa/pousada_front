import { ConsultaInteligenteView } from "@/features/consulta-inteligente";

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function ConsultaInteligentePage({ searchParams }: Props) {
  const { q } = await searchParams;
  return <ConsultaInteligenteView initialPergunta={q} />;
}
