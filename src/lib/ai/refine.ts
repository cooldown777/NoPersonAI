import Anthropic from "@anthropic-ai/sdk";
import { buildRefinementPrompt } from "./prompts";
import { MODELS } from "./models";
import type { ChainContext, RefinementAction } from "./types";

const anthropic = new Anthropic();

export async function refinePost(
  currentPost: string,
  action: RefinementAction,
  customInstruction: string | null,
  context: ChainContext,
): Promise<string> {
  const prompt = buildRefinementPrompt(
    currentPost,
    action,
    customInstruction,
    context.dnaSnapshot,
    context.intent.detectedLanguage || context.dnaSnapshot.preferredLanguage,
  );

  const response = await anthropic.messages.create({
    model: MODELS.chain,
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}
