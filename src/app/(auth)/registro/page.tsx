import { RegistroForm } from "@/features/auth/components/registro-form";
import { registroAction } from "@/features/auth/actions";
import { safeRedirectPath } from "@/features/auth/schema";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function RegistroPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <RegistroForm
      action={registroAction}
      redirectTo={safeRedirectPath(next)}
    />
  );
}
