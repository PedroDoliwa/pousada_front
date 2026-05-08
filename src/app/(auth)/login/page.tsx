import { LoginForm } from "@/features/auth";
import { loginAction } from "@/features/auth/actions";

export default function LoginPage() {
  return <LoginForm action={loginAction} />;
}

