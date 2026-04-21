import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isLinkedInConnected } from "@/lib/linkedin";
import ScheduleClient from "./schedule-client";

export default async function SchedulePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const [connected, schedules] = await Promise.all([
    isLinkedInConnected(session.user.id),
    prisma.scheduledPost.findMany({
      where: { userId: session.user.id },
      orderBy: { scheduledFor: "asc" },
      take: 50,
    }),
  ]);

  return (
    <ScheduleClient
      linkedInConnected={connected}
      initialSchedules={schedules.map((s) => ({
        id: s.id,
        content: s.content,
        scheduledFor: s.scheduledFor.toISOString(),
        status: s.status,
        linkedInUrn: s.linkedInUrn,
        failureReason: s.failureReason,
      }))}
    />
  );
}
