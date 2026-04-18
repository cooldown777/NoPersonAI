import { NextRequest, NextResponse } from "next/server";
import { generatePost } from "@/lib/ai/engine";
import type { WritingDNAInput } from "@/lib/ai/types";

const DEMO_DNA: WritingDNAInput = {
  tone: "storytelling",
  audience: "founders and operators building B2B software",
  style: "mixed",
  emojiUsage: "none",
  samplePosts: [],
  generatedProfile:
    "Writes in first person with a grounded, reflective voice. Opens with a concrete moment or small observation, then widens to an insight. Short sentences; avoids corporate language, buzzwords and emojis. Ends with a reusable one-line takeaway rather than a rhetorical question. Comfortable with mild vulnerability but never performative.",
  preferredLanguage: "en",
};

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimit(ip: string): { ok: boolean; retryAfter?: number } {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (bucket.count >= LIMIT) {
    return { ok: false, retryAfter: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  bucket.count += 1;
  return { ok: true };
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "anon";

  const gate = rateLimit(ip);
  if (!gate.ok) {
    return NextResponse.json(
      {
        error: "Demo limit reached. Create a free account to continue.",
        code: "DEMO_LIMIT",
        retryAfter: gate.retryAfter,
      },
      { status: 429 },
    );
  }

  let body: { input?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const input = (body.input || "").trim();
  if (!input || input.length < 4) {
    return NextResponse.json({ error: "Input too short" }, { status: 400 });
  }
  if (input.length > 400) {
    return NextResponse.json({ error: "Input too long (demo)" }, { status: 400 });
  }

  try {
    const result = await generatePost(input, DEMO_DNA, 0);
    return NextResponse.json({
      post: result.post,
      language: result.intent.detectedLanguage,
      structure: result.structure.structure,
    });
  } catch {
    return NextResponse.json(
      { error: "Generation failed. Try again in a moment." },
      { status: 500 },
    );
  }
}
