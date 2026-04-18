import Anthropic from "@anthropic-ai/sdk";
import { buildDNAProfilePrompt } from "./prompts";
import { MODELS } from "./models";

const anthropic = new Anthropic();

interface GenerateDNAInput {
  tone: string;
  audience: string;
  style: string;
  emojiUsage: string;
  samplePosts: string[];
  styleDiscoveryAnswers: Record<string, unknown> | null;
  language: string;
}

export async function generateDNAProfile(
  input: GenerateDNAInput,
): Promise<string> {
  const prompt = buildDNAProfilePrompt(
    input.tone,
    input.audience,
    input.style,
    input.emojiUsage,
    input.samplePosts,
    input.styleDiscoveryAnswers,
    input.language,
  );

  // Use the polish model — DNA is quality-critical and one-shot per user.
  const response = await anthropic.messages.create({
    model: MODELS.polish,
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}
