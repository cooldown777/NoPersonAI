import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { generatePost, buildChainContext } from "@/lib/ai/engine";
import type { WritingDNAInput } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { input, languageOverride } = await req.json();

  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { writingDna: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Reset monthly counter if needed
  const now = new Date();
  const resetAt = new Date(dbUser.postsResetAt);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { postsUsedThisMonth: 0, postsResetAt: now },
    });
    dbUser.postsUsedThisMonth = 0;
  }

  if (dbUser.plan === "free" && dbUser.postsUsedThisMonth >= 5) {
    return NextResponse.json({ error: "Monthly limit reached", code: "LIMIT_REACHED" }, { status: 403 });
  }

  if (!dbUser.writingDna) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  const dna: WritingDNAInput = {
    tone: dbUser.writingDna.tone,
    audience: dbUser.writingDna.audience,
    style: dbUser.writingDna.style,
    emojiUsage: dbUser.writingDna.emojiUsage,
    samplePosts: dbUser.writingDna.samplePosts,
    generatedProfile: dbUser.writingDna.generatedProfile,
    preferredLanguage: languageOverride || dbUser.writingDna.preferredLanguage,
  };

  const result = await generatePost(input.trim(), dna);
  const chainContext = buildChainContext(result, dna);

  const post = await prisma.post.create({
    data: {
      userId: user.id,
      input: input.trim(),
      output: result.post,
      structure: result.structure.structure,
      language: result.intent.detectedLanguage,
      chainContext: chainContext as object,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { postsUsedThisMonth: { increment: 1 } },
  });

  return NextResponse.json({
    id: post.id,
    post: result.post,
    structure: result.structure.structure,
    language: result.intent.detectedLanguage,
    evaluation: result.evaluation,
    postsUsed: dbUser.postsUsedThisMonth + 1,
  });
}
