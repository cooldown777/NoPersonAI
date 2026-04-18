import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { whatsapp, toE164, generateVerificationCode } from "@/lib/whatsapp";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { plan: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (dbUser.plan !== "pro") {
    return NextResponse.json(
      { error: "WhatsApp is a Pro feature", code: "PRO_REQUIRED" },
      { status: 403 },
    );
  }

  const { phone } = await req.json();
  const phoneE164 = typeof phone === "string" ? toE164(phone) : null;
  if (!phoneE164) {
    return NextResponse.json({ error: "Invalid phone number. Use E.164 format." }, { status: 400 });
  }

  const existingElsewhere = await prisma.user.findFirst({
    where: { phoneE164, id: { not: user.id } },
    select: { id: true },
  });
  if (existingElsewhere) {
    return NextResponse.json(
      { error: "This phone number is already linked to another account." },
      { status: 409 },
    );
  }

  const code = generateVerificationCode();

  const connection = await prisma.whatsAppConnection.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      phoneE164,
      status: "pending",
      verificationCode: code,
    },
    update: {
      phoneE164,
      status: "pending",
      verificationCode: code,
      verifiedAt: null,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { phoneE164 },
  });

  return NextResponse.json({
    connectionId: connection.id,
    phoneE164,
    status: connection.status,
    verificationCode: code,
    sandbox: whatsapp.sandboxInfo(),
  });
}

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const connection = await prisma.whatsAppConnection.findUnique({
    where: { userId: user.id },
    select: {
      id: true,
      phoneE164: true,
      status: true,
      verificationCode: true,
      verifiedAt: true,
      createdAt: true,
    },
  });

  return NextResponse.json({
    connection,
    sandbox: whatsapp.sandboxInfo(),
  });
}
