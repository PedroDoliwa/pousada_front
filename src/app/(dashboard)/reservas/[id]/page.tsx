import { ReservaFormView } from "@/features/reservas";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function VerReservaPage({ params }: Props) {
  const { id } = await params;
  const reservaId = Number.parseInt(id, 10);
  return <ReservaFormView mode="view" reservaId={reservaId} />;
}
