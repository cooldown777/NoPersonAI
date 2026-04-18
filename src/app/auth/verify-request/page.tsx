import Link from "next/link";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/brand/Logo";

export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-6">
        <Link href="/" className="inline-block">
          <Logo />
        </Link>

        <div className="w-full text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-50 text-accent-600">
            <Mail className="h-7 w-7" />
          </div>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-zinc-900">
            Check your inbox
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            We emailed you a sign-in link. Click it to continue. The link expires in 24 hours.
          </p>

          <div className="mt-8">
            <Link href="/auth/signin">
              <Button variant="outline" size="lg">
                Use a different email
              </Button>
            </Link>
          </div>
        </div>

        <div />
      </div>
    </div>
  );
}
