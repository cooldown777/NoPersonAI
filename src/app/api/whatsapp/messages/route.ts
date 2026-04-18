import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const connection = await prisma.whatsAppConnection.findUnique({
    where: { userId: user.id },
    select: { id: true },
  });

  if (!connection) {
    return NextResponse.json({ messages: [] });
  }

  const messages = await prisma.incomingMessage.findMany({
    where: { connectionId: connection.id },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      direction: true,
      bodyText: true,
      transcription: true,
      status: true,
      createdAt: true,
      generatedPostId: true,
    },
  });

  return NextResponse.json({ messages });
}
