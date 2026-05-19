import { LoginForm } from "@/features/auth";
import { loginAction } from "@/features/auth/actions";
import { safeRedirectPath } from "@/features/auth/schema";

type Props = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { next } = await searchParams;
  return (
    <LoginForm
      action={loginAction}
      redirectTo={safeRedirectPath(next)}
    />
  );
}

