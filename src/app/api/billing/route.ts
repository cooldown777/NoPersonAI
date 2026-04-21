import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

const FIELDS = [
  "billingName",
  "billingCompany",
  "billingEmail",
  "billingAddressLine1",
  "billingAddressLine2",
  "billingCity",
  "billingPostalCode",
  "billingCountry",
  "billingVatId",
] as const;

type BillingField = (typeof FIELDS)[number];

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const row = await prisma.user.findUnique({
    where: { id: user.id },
    select: FIELDS.reduce<Record<string, true>>((acc, f) => ({ ...acc, [f]: true }), {}),
  });
  return NextResponse.json({ billing: row ?? {} });
}

export async function PATCH(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = (await req.json()) as Partial<Record<BillingField, unknown>>;
  const data: Record<string, string | null> = {};

  for (const f of FIELDS) {
    if (!(f in body)) continue;
    const v = body[f];
    if (v === null || v === "") {
      data[f] = null;
      continue;
    }
    if (typeof v !== "string") {
      return NextResponse.json({ error: `${f} must be a string` }, { status: 400 });
    }
    if (v.length > 200) {
      return NextResponse.json({ error: `${f} too long` }, { status: 400 });
    }
    data[f] = v.trim();
  }

  const row = await prisma.user.update({
    where: { id: user.id },
    data,
    select: FIELDS.reduce<Record<string, true>>((acc, f) => ({ ...acc, [f]: true }), {}),
  });

  return NextResponse.json({ billing: row });
}
