import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { whatsapp } from "@/lib/whatsapp";
import { transcribe } from "@/lib/transcription";
import { generatePost, buildChainContext } from "@/lib/ai/engine";
import type { WritingDNAInput } from "@/lib/ai/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const FREE_LIMIT = 5;

function formFromUrlEncoded(raw: string): Record<string, string> {
  const params = new URLSearchParams(raw);
  const obj: Record<string, string> = {};
  for (const [k, v] of params.entries()) obj[k] = v;
  return obj;
}

function twiml(body: string): Response {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(body)}</Message></Response>`;
  return new Response(xml, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function twimlEmpty(): Response {
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><Response/>`, {
    headers: { "Content-Type": "text/xml; charset=utf-8" },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const form = formFromUrlEncoded(rawBody);
  const signature = req.headers.get("x-twilio-signature");
  const url = req.url;

  const valid = await whatsapp.verifySignature({ rawBody, signature, url, form });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
  }

  const message = whatsapp.parseIncoming(form);
  const from = message.from;

  const connection = await prisma.whatsAppConnection.findUnique({
    where: { phoneE164: from },
    include: { user: { include: { writingDna: true } } },
  });

  if (!connection) {
    return twiml(
      "Welcome! We don't have an account for this number yet. Sign up at https://nopersonai.com and connect WhatsApp in Settings.",
    );
  }

  // Handle pending verification
  if (connection.status === "pending") {
    const code = (message.bodyText || "").trim();
    if (code === connection.verificationCode) {
      await prisma.whatsAppConnection.update({
        where: { id: connection.id },
        data: { status: "verified", verifiedAt: new Date(), verificationCode: null },
      });
      return twiml(
        "✅ Connected! Send me a rough idea or a voice note — I'll turn it into a LinkedIn post in your voice.",
      );
    }
    return twiml(
      `Please reply with your 6-digit verification code to complete setup. You can find it in the NoPersonAI app under WhatsApp.`,
    );
  }

  if (connection.status !== "verified") {
    return twiml("This number is no longer connected. Reconnect at https://nopersonai.com/app/whatsapp.");
  }

  // Pro gate
  if (connection.user.plan !== "pro") {
    return twiml(
      "WhatsApp is a Pro feature. Upgrade at https://nopersonai.com/app/account to keep using it.",
    );
  }

  // DNA required
  if (!connection.user.writingDna) {
    return twiml("Finish setting up your Writing DNA at https://nopersonai.com/app to start generating.");
  }

  // Monthly counter check (Pro users have unlimited; we still increment for analytics)
  const now = new Date();
  const resetAt = new Date(connection.user.postsResetAt);
  let postsUsed = connection.user.postsUsedThisMonth;
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.user.update({
      where: { id: connection.userId },
      data: { postsUsedThisMonth: 0, postsResetAt: now },
    });
    postsUsed = 0;
  }
  if (connection.user.plan !== "pro" && postsUsed >= FREE_LIMIT) {
    return twiml("You've reached your monthly post limit. Upgrade to Pro for unlimited posts.");
  }

  // Persist inbound message row
  const inbound = await prisma.incomingMessage.create({
    data: {
      connectionId: connection.id,
      providerMessageId: message.messageId || `inbound-${Date.now()}`,
      direction: "inbound",
      bodyText: message.bodyText,
      mediaUrl: message.mediaUrl,
      status: message.mediaUrl ? "transcribing" : "generating",
    },
  });

  let promptText = message.bodyText?.trim() || "";
  let language: "de" | "en" | undefined;

  if (message.mediaUrl) {
    try {
      const media = await whatsapp.fetchMedia(message.mediaUrl);
      const mime = message.mediaContentType || media.contentType || "audio/ogg";
      const ext = mime.includes("mpeg") ? "mp3" : mime.includes("wav") ? "wav" : "ogg";
      const bytes = new Uint8Array(media.data);
      const file = new File([bytes], `wa.${ext}`, { type: mime });
      const t = await transcribe(file, file.name);
      promptText = promptText ? `${promptText}\n\n${t.text}` : t.text;
      language = t.language;
      await prisma.incomingMessage.update({
        where: { id: inbound.id },
        data: { transcription: t.text, status: "generating" },
      });
    } catch (err) {
      await prisma.incomingMessage.update({
        where: { id: inbound.id },
        data: {
          status: "failed",
          errorReason: err instanceof Error ? err.message : "transcription failed",
        },
      });
      return twiml(
        "I couldn't transcribe that voice note. Try again or send a text message instead.",
      );
    }
  }

  if (!promptText) {
    await prisma.incomingMessage.update({
      where: { id: inbound.id },
      data: { status: "failed", errorReason: "empty input" },
    });
    return twiml("Send me a text message or a voice note with a rough idea and I'll draft a post.");
  }

  const dna: WritingDNAInput = {
    tone: connection.user.writingDna.tone,
    audience: connection.user.writingDna.audience,
    style: connection.user.writingDna.style,
    emojiUsage: connection.user.writingDna.emojiUsage,
    samplePosts: connection.user.writingDna.samplePosts,
    generatedProfile: connection.user.writingDna.generatedProfile,
    preferredLanguage: language || connection.user.writingDna.preferredLanguage,
  };

  try {
    const result = await generatePost(promptText, dna, 0);
    const chainContext = buildChainContext(result, dna);

    const post = await prisma.post.create({
      data: {
        userId: connection.userId,
        input: promptText,
        output: result.post,
        structure: result.structure.structure,
        language: result.intent.detectedLanguage,
        chainContext: chainContext as object,
      },
    });

    await prisma.user.update({
      where: { id: connection.userId },
      data: { postsUsedThisMonth: { increment: 1 } },
    });

    await prisma.incomingMessage.update({
      where: { id: inbound.id },
      data: { status: "sent", generatedPostId: post.id },
    });

    // TwiML auto-reply with the generated post
    return twiml(result.post);
  } catch (err) {
    await prisma.incomingMessage.update({
      where: { id: inbound.id },
      data: {
        status: "failed",
        errorReason: err instanceof Error ? err.message : "generation failed",
      },
    });
    return twiml("Something went wrong generating that post. Try again in a moment.");
  }
}

export async function GET() {
  // Health check / Twilio verification
  return twimlEmpty();
}
