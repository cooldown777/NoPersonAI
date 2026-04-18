import { Suspense } from "react";
import SignInForm from "./signin-form";

interface PageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export default async function SignInPage({ searchParams }: PageProps) {
  const { callbackUrl, error } = await searchParams;
  return (
    <Suspense>
      <SignInForm callbackUrl={callbackUrl} initialError={error} />
    </Suspense>
  );
}
