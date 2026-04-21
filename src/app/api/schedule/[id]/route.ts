import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;

  const existing = await prisma.scheduledPost.findUnique({ where: { id } });
  if (!existing || existing.userId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (existing.status !== "pending" && existing.status !== "failed") {
    return NextResponse.json({ error: "Only pending posts can be edited" }, { status: 400 });
  }

  const { content, scheduledFor, timezone } = await req.json();
  const data: { content?: string; scheduledFor?: Date; timezone?: string; status?: "pending" } = {};

  if (content !== undefined) {
    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json({ error: "content is required" }, { status: 400 });
    }
    if (content.length > 3000) {
      return NextResponse.json({ error: "Post exceeds LinkedIn 3000-char limit" }, { status: 400 });
    }
    data.content = content.trim();
  }

  if (scheduledFor !== undefined) {
    const when = new Date(scheduledFor);
    if (isNaN(when.getTime())) {
      return NextResponse.json({ error: "Invalid scheduledFor" }, { status: 400 });
    }
    if (when.getTime() < Date.now() - 60_000) {
      return NextResponse.json({ error: "scheduledFor must be in the future" }, { status: 400 });
    }
    data.scheduledFor = when;
  }

  if (typeof timezone === "string") data.timezone = timezone;
  if (existing.status === "failed") data.status = "pending";

  const schedule = await prisma.scheduledPost.update({ where: { id }, data });
  return NextResponse.json({ schedule });
}

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
