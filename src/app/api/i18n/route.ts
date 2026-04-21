import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { isLocale } from "@/i18n/config";

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const user = await getAuthUser();
  if (user) {
    await prisma.writingDNA.updateMany({
      where: { userId: user.id },
      data: { preferredLanguage: locale },
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
