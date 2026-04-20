import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BulkClient from "./bulk-client";

export default async function BulkPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, postsUsedThisMonth: true, postsResetAt: true },
  });
  if (!user) redirect("/auth/signin");

  const now = new Date();
  const resetAt = new Date(user.postsResetAt);
  const postsUsed =
    now.getMonth() === resetAt.getMonth() && now.getFullYear() === resetAt.getFullYear()
      ? user.postsUsedThisMonth
      : 0;

  return (
    <BulkClient
      plan={user.plan}
      initialPostsUsed={postsUsed}
      userName={session.user.name || "You"}
      userImage={session.user.image || null}
    />
  );
}
