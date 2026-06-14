import { RedefinirSenhaForm } from "@/features/conta/components/redefinir-senha-form";
import { redefinirSenhaAction } from "@/features/conta";

type Props = {
  searchParams: Promise<{ token?: string }>;
};

export default async function RedefinirSenhaPage({ searchParams }: Props) {
  const { token } = await searchParams;
  return (
    <RedefinirSenhaForm
      action={redefinirSenhaAction}
      token={token?.trim() || null}
    />
  );
}
