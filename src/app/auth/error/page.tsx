import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

const messages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Sign-in is temporarily unavailable",
    description: "There's a server configuration issue. Please try again later.",
  },
  AccessDenied: {
    title: "Access denied",
    description: "You don't have permission to sign in. Contact support if this seems wrong.",
  },
  Verification: {
    title: "Link expired",
    description: "This magic link has expired or was already used. Request a new one.",
  },
  OAuthAccountNotLinked: {
    title: "Use your original sign-in method",
    description:
      "This email is already registered with a different sign-in method. Try signing in the same way you did the first time.",
  },
  Default: {
    title: "Something went wrong",
    description: "We couldn't complete sign-in. Please try again.",
  },
};

export default async function AuthErrorPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const { title, description } = messages[error || "Default"] || messages.Default;

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-6">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>

        <div className="w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-zinc-900">
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{description}</p>

          <div className="mt-8 flex flex-col items-center gap-3">
            <Link href="/auth/signin">
              <Button size="lg">Back to sign in</Button>
            </Link>
            <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-700">
              Back home
            </Link>
          </div>
        </div>

        <div />
      </div>
    </div>
  );
}
