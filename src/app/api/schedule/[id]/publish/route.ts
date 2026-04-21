import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { publishToLinkedIn } from "@/lib/linkedin";

export async function POST(
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
    data: { status: "publishing", attempts: { increment: 1 } },
  });

  try {
    const urn = await publishToLinkedIn(user.id, existing.content);
    const updated = await prisma.scheduledPost.update({
      where: { id },
      data: {
        status: "published",
        publishedAt: new Date(),
        linkedInUrn: urn,
        failureReason: null,
      },
    });
    return NextResponse.json({ schedule: updated });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    await prisma.scheduledPost.update({
      where: { id },
      data: { status: "failed", failureReason: msg },
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
