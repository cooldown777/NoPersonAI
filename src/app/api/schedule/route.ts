import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { isLinkedInConnected } from "@/lib/linkedin";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const schedules = await prisma.scheduledPost.findMany({
    where: { userId: user.id },
    orderBy: { scheduledFor: "asc" },
    take: 100,
  });
  return NextResponse.json({ schedules });
}

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { content, scheduledFor, timezone, postId } = await req.json();

  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (content.length > 3000) {
    return NextResponse.json({ error: "Post exceeds LinkedIn 3000-char limit" }, { status: 400 });
  }

  const when = new Date(scheduledFor);
  if (isNaN(when.getTime())) {
    return NextResponse.json({ error: "Invalid scheduledFor" }, { status: 400 });
  }
  if (when.getTime() < Date.now() - 60_000) {
    return NextResponse.json({ error: "scheduledFor must be in the future" }, { status: 400 });
  }

  if (!(await isLinkedInConnected(user.id))) {
    return NextResponse.json(
      { error: "linkedin_not_connected" },
      { status: 400 },
    );
  }

  const schedule = await prisma.scheduledPost.create({
    data: {
      userId: user.id,
      postId: typeof postId === "string" ? postId : null,
      content: content.trim(),
      scheduledFor: when,
      timezone: typeof timezone === "string" ? timezone : "UTC",
    },
  });

  return NextResponse.json({ schedule });
}
