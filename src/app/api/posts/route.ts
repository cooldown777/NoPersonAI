import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const favorites = url.searchParams.get("favorites") === "true";
  const language = url.searchParams.get("language");
  const cursor = url.searchParams.get("cursor");

  const where: Record<string, unknown> = { userId: user.id };
  if (favorites) where.isFavorite = true;
  if (language === "de" || language === "en") where.language = language;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { refinements: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      input: p.input,
      output: p.refinements.length > 0 ? p.refinements[0].output : p.output,
      originalOutput: p.output,
      structure: p.structure,
      language: p.language,
      isFavorite: p.isFavorite,
      refinementCount: p.refinements.length,
      createdAt: p.createdAt.toISOString(),
    })),
    nextCursor: posts.length === 20 ? posts[posts.length - 1].id : null,
  });
}
