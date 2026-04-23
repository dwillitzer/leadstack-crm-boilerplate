import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
            <h1 className="text-2xl font-bold">LeadStack</h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome back. Sign in to your workspace.
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
