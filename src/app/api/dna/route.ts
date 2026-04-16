import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { generateDNAProfile } from "@/lib/ai/dna";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const dna = await prisma.writingDNA.findUnique({
    where: { userId: user.id },
  });

  if (!dna) {
    return NextResponse.json({ dna: null });
  }

  return NextResponse.json({ dna });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const {
    tone, audience, style, emojiUsage, samplePosts,
    styleDiscoveryAnswers, onboardingMethod, preferredLanguage, regenerateProfile,
  } = body;

  let generatedProfile: string | undefined;

  if (regenerateProfile) {
    generatedProfile = await generateDNAProfile({
      tone, audience, style, emojiUsage,
      samplePosts: samplePosts || [],
      styleDiscoveryAnswers: styleDiscoveryAnswers || null,
      language: preferredLanguage || "en",
    });
  }

  const dna = await prisma.writingDNA.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tone, audience, style, emojiUsage,
      samplePosts: samplePosts || [],
      styleDiscoveryAnswers: styleDiscoveryAnswers || undefined,
      onboardingMethod: onboardingMethod || "sample_posts",
      generatedProfile: generatedProfile || "",
      preferredLanguage: preferredLanguage || "en",
    },
    update: {
      tone, audience, style, emojiUsage,
      samplePosts: samplePosts || [],
      styleDiscoveryAnswers: styleDiscoveryAnswers || undefined,
      onboardingMethod: onboardingMethod || undefined,
      ...(generatedProfile ? { generatedProfile } : {}),
      preferredLanguage: preferredLanguage || undefined,
    },
  });

  return NextResponse.json({ dna });
}
