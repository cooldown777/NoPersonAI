import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveLocaleFromInputs } from "./resolve-locale";
import type { Locale } from "./config";

export async function resolveLocale(): Promise<Locale> {
  const [cookieStore, hdrs, session] = await Promise.all([
    cookies(),
    headers(),
    getServerSession(authOptions),
  ]);

  let userPreferred: string | null = null;
  if (session?.user?.id) {
    const dna = await prisma.writingDNA.findUnique({
      where: { userId: session.user.id },
      select: { preferredLanguage: true },
    });
    userPreferred = dna?.preferredLanguage ?? null;
  }

  return resolveLocaleFromInputs({
    userPreferred,
    cookie: cookieStore.get("NEXT_LOCALE")?.value ?? null,
    acceptLanguage: hdrs.get("accept-language"),
  });
}
