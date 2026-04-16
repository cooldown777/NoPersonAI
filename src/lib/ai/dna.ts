import Anthropic from "@anthropic-ai/sdk";
import { buildDNAProfilePrompt } from "./prompts";

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
  input: GenerateDNAInput
): Promise<string> {
  const prompt = buildDNAProfilePrompt(
    input.tone,
    input.audience,
    input.style,
    input.emojiUsage,
    input.samplePosts,
    input.styleDiscoveryAnswers,
    input.language
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}
