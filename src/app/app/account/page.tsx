import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isLinkedInConnected } from "@/lib/linkedin";
import AccountClient from "./account-client";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, postsUsedThisMonth: true, postsResetAt: true },
  });
  if (!user) redirect("/auth/signin");

  const linkedInConnected = await isLinkedInConnected(session.user.id);

  const now = new Date();
  const resetAt = new Date(user.postsResetAt);
  const postsUsed =
    now.getMonth() === resetAt.getMonth() && now.getFullYear() === resetAt.getFullYear()
      ? user.postsUsedThisMonth
      : 0;

  return (
    <AccountClient
      plan={user.plan}
      postsUsed={postsUsed}
      name={session.user.name || ""}
      email={session.user.email || ""}
      image={session.user.image || null}
      linkedInConnected={linkedInConnected}
    />
  );
}
