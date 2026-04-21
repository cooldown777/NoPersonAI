import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const existing = await prisma.scheduledPost.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status === "published") {
    return NextResponse.json({ error: "Already published" }, { status: 400 });
  }

  await prisma.scheduledPost.update({
    where: { id },
    data: { status: "cancelled" },
  });
  return NextResponse.json({ ok: true });
}
