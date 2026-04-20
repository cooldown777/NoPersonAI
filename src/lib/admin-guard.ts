import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });
  if (!user || !isAdminRole(user.role)) notFound();

  return user;
}
