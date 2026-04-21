import { NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { isLinkedInConnected } from "@/lib/linkedin";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();
  const connected = await isLinkedInConnected(user.id);
  return NextResponse.json({ connected });
}
