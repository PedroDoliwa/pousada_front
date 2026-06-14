import { EsqueciSenhaForm } from "@/features/conta/components/esqueci-senha-form";
import { esqueciSenhaAction } from "@/features/conta";

export default function EsqueciSenhaPage() {
  return <EsqueciSenhaForm action={esqueciSenhaAction} />;
}
