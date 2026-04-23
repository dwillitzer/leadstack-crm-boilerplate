import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="inline-block h-6 w-6 rounded-md bg-gradient-to-br from-indigo-500 via-violet-500 to-pink-500" />
            <h1 className="text-2xl font-bold">LeadStack</h1>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">
            Start closing with the CRM your team will actually use.
          </p>
        </div>

        <SignupForm />
      </div>
    </div>
  );
}
