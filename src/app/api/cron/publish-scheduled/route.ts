import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { publishToLinkedIn } from "@/lib/linkedin";

const MAX_ATTEMPTS = 3;
const BATCH_SIZE = 10;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const due = await prisma.scheduledPost.findMany({
    where: {
      status: "pending",
      scheduledFor: { lte: now },
      attempts: { lt: MAX_ATTEMPTS },
    },
    orderBy: { scheduledFor: "asc" },
    take: BATCH_SIZE,
  });

  const results: Array<{ id: string; ok: boolean; error?: string }> = [];

  for (const schedule of due) {
    const claimed = await prisma.scheduledPost.updateMany({
      where: { id: schedule.id, status: "pending" },
      data: { status: "publishing", attempts: { increment: 1 } },
    });
    if (claimed.count === 0) continue;

    try {
      const urn = await publishToLinkedIn(schedule.userId, schedule.content);
      await prisma.scheduledPost.update({
        where: { id: schedule.id },
        data: {
          status: "published",
          publishedAt: new Date(),
          linkedInUrn: urn,
          failureReason: null,
        },
      });
      results.push({ id: schedule.id, ok: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      const nextAttempts = schedule.attempts + 1;
      await prisma.scheduledPost.update({
        where: { id: schedule.id },
        data: {
          status: nextAttempts >= MAX_ATTEMPTS ? "failed" : "pending",
          failureReason: msg,
        },
      });
      results.push({ id: schedule.id, ok: false, error: msg });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
