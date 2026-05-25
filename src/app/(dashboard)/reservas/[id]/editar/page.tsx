import { ReservaFormView } from "@/features/reservas";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditarReservaPage({ params }: Props) {
  const { id } = await params;
  const reservaId = Number.parseInt(id, 10);
  return <ReservaFormView mode="edit" reservaId={reservaId} />;
}
