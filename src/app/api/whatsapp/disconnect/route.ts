import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  await prisma.whatsAppConnection.deleteMany({ where: { userId: user.id } });
  await prisma.user.update({
    where: { id: user.id },
    data: { phoneE164: null },
  });

  return NextResponse.json({ success: true });
}
