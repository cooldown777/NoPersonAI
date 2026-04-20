import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { shouldRedirectFromOnboarding } from "./guard-logic";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const userId = session.user.id;

  const dna = await prisma.writingDNA.findUnique({
    where: { userId },
    select: { id: true },
  });
  const hasDna = !!dna;

  const target = shouldRedirectFromOnboarding({ hasSession: true, hasDna });
  if (target) redirect(target);

  return <OnboardingClient />;
}
