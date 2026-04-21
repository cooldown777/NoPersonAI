import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { disconnectLinkedIn } from "@/lib/linkedin";

export async function POST() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  await disconnectLinkedIn(user.id);
  return NextResponse.json({ ok: true });
}
