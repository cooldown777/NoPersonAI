import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { generatePost, buildChainContext } from "@/lib/ai/engine";
import { pickAngles, clampCount, canAfford } from "@/lib/bulk";
import type { WritingDNAInput } from "@/lib/ai/types";

const FREE_LIMIT = 5;

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { input, count: rawCount } = await req.json();

  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  const count = clampCount(Number(rawCount) || 5);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { writingDna: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!dbUser.writingDna) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  const now = new Date();
  const resetAt = new Date(dbUser.postsResetAt);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { postsUsedThisMonth: 0, postsResetAt: now },
    });
    dbUser.postsUsedThisMonth = 0;
  }

  if (
    !canAfford({
      plan: dbUser.plan,
      used: dbUser.postsUsedThisMonth,
      requested: count,
      limit: FREE_LIMIT,
    })
  ) {
    return NextResponse.json(
      {
        error: "quota_exceeded",
        remaining: Math.max(0, FREE_LIMIT - dbUser.postsUsedThisMonth),
      },
      { status: 403 },
    );
  }

  const dna: WritingDNAInput = {
    tone: dbUser.writingDna.tone,
    audience: dbUser.writingDna.audience,
    style: dbUser.writingDna.style,
    emojiUsage: dbUser.writingDna.emojiUsage,
    samplePosts: dbUser.writingDna.samplePosts,
    generatedProfile: dbUser.writingDna.generatedProfile,
    preferredLanguage: dbUser.writingDna.preferredLanguage,
  };

  const angles = pickAngles(count);

  const settled = await Promise.allSettled(
    angles.map((angle) =>
      generatePost(`[ANGLE: ${angle}]\n${input.trim()}`, dna),
    ),
  );

  const successes = settled
    .map((r, i) => ({ angle: angles[i], result: r }))
    .filter(
      (
        x,
      ): x is {
        angle: (typeof angles)[number];
        result: PromiseFulfilledResult<Awaited<ReturnType<typeof generatePost>>>;
      } => x.result.status === "fulfilled",
    );

  if (successes.length === 0) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }

  const persisted = await Promise.all(
    successes.map(async ({ result }) => {
      const chainContext = buildChainContext(result.value, dna);
      const post = await prisma.post.create({
        data: {
          userId: user.id,
          input: input.trim(),
          output: result.value.post,
          structure: result.value.structure.structure,
          language: result.value.intent.detectedLanguage,
          chainContext: chainContext as object,
        },
      });
      return {
        id: post.id,
        post: result.value.post,
        structure: result.value.structure.structure,
        language: result.value.intent.detectedLanguage,
      };
    }),
  );

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { postsUsedThisMonth: { increment: persisted.length } },
    select: { postsUsedThisMonth: true },
  });

  return NextResponse.json({
    posts: persisted,
    postsUsed: updated.postsUsedThisMonth,
    requested: count,
    delivered: persisted.length,
  });
}
