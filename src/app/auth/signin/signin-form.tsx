"use client";

import { signIn, signOut } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowRight, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Logo } from "@/components/brand/Logo";

interface SignInFormProps {
  callbackUrl?: string;
  initialError?: string;
}

const errorMessages: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already associated with a different sign-in method. Try signing in the way you did last time.",
  Verification:
    "The sign-in link has expired or was already used. Request a new one.",
  EmailSignin: "We couldn't send the email. Please try again.",
  AccessDenied: "Access denied. Please contact support if this is unexpected.",
  Default: "Something went wrong. Please try again.",
};

export default function SignInForm({ callbackUrl, initialError }: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError || null);
  const target = callbackUrl || "/app";

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setIsSendingEmail(true);
    setError(null);
    try {
      const res = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: target,
      });
      if (res?.error) {
        setError(errorMessages.EmailSignin);
      } else {
        setEmailSent(true);
      }
    } catch {
      setError(errorMessages.Default);
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-5 py-6">
        <div>
          <Link href="/" className="inline-block">
            <Logo />
          </Link>
        </div>

        <div className="w-full">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Sign in to create LinkedIn posts that sound like you.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessages[error] || errorMessages.Default}</span>
            </div>
          )}

          {emailSent ? (
            <div className="rounded-2xl border border-accent-200 bg-accent-50 p-6 text-center">
              <Mail className="mx-auto h-8 w-8 text-accent-600" />
              <h2 className="mt-3 font-display text-lg font-semibold text-zinc-900">
                Check your inbox
              </h2>
              <p className="mt-1 text-sm text-zinc-600">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in.
              </p>
              <button
                type="button"
                className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
                onClick={() => setEmailSent(false)}
              >
                Wrong email?
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                size="lg"
                fullWidth
                loading={isGoogleLoading}
                onClick={async () => {
                  setIsGoogleLoading(true);
                  await signOut({ redirect: false });
                  signIn("google", { callbackUrl: target });
                }}
                leftIcon={
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                }
              >
                Continue with Google
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-zinc-50 px-3 text-xs uppercase tracking-wider text-zinc-400">
                    or
                  </span>
                </div>
              </div>

              <form onSubmit={handleEmail} className="space-y-3">
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  autoCapitalize="none"
                />
                <Button
                  type="submit"
                  size="lg"
                  fullWidth
                  loading={isSendingEmail}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Send magic link
                </Button>
              </form>
            </div>
          )}

          <p className="mt-8 text-center text-xs text-zinc-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-zinc-700">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-zinc-700">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <div />
      </div>
    </div>
  );
}
