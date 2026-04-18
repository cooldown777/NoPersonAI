import Anthropic from "@anthropic-ai/sdk";
import {
  buildIntentAndStructurePrompt,
  buildGeneratePostPrompt,
  buildSelfEvaluatePrompt,
} from "./prompts";
import { MODELS, type ModelId } from "./models";
import type {
  IntentAndStructure,
  SelfEvaluation,
  GenerationResult,
  WritingDNAInput,
  ChainContext,
} from "./types";

const anthropic = new Anthropic();

interface CallOptions {
  model?: ModelId;
  maxTokens: number;
  system?: string;
  cachedPrefix?: string;
}

async function callClaude(prompt: string, opts: CallOptions): Promise<string> {
  const { model = MODELS.chain, maxTokens, system, cachedPrefix } = opts;

  const messages: Anthropic.MessageParam[] = cachedPrefix
    ? [
        {
          role: "user",
          content: [
            { type: "text", text: cachedPrefix, cache_control: { type: "ephemeral" } },
            { type: "text", text: prompt },
          ],
        },
      ]
    : [{ role: "user", content: prompt }];

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages,
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }
  return textBlock.text;
}

function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}

async function analyzeIntentAndStructure(
  userInput: string,
  dnaProfile: string,
): Promise<IntentAndStructure> {
  const prompt = buildIntentAndStructurePrompt(userInput, dnaProfile);
  const response = await callClaude(prompt, {
    maxTokens: 500,
    cachedPrefix: dnaProfile ? `WRITING PROFILE (cached):\n${dnaProfile}` : undefined,
  });
  return parseJSON<IntentAndStructure>(response);
}

async function generatePostText(
  userInput: string,
  intentAndStructure: IntentAndStructure,
  dna: WritingDNAInput,
  model: ModelId = MODELS.chain,
): Promise<string> {
  const language =
    intentAndStructure.intent.detectedLanguage || dna.preferredLanguage;
  const prompt = buildGeneratePostPrompt(
    userInput,
    JSON.stringify(intentAndStructure.intent),
    intentAndStructure.structure.structure,
    intentAndStructure.structure.reasoning,
    dna,
    language,
  );
  return callClaude(prompt, {
    model,
    maxTokens: 1000,
    cachedPrefix: dna.generatedProfile
      ? `WRITING PROFILE (cached):\n${dna.generatedProfile}\n\nSample posts cache:\n${dna.samplePosts.slice(0, 3).join("\n\n")}`
      : undefined,
  });
}

async function selfEvaluate(
  post: string,
  userInput: string,
  dnaProfile: string,
): Promise<SelfEvaluation> {
  const prompt = buildSelfEvaluatePrompt(post, userInput, dnaProfile);
  const response = await callClaude(prompt, { maxTokens: 200 });
  return parseJSON<SelfEvaluation>(response);
}

export async function generatePost(
  userInput: string,
  dna: WritingDNAInput,
  maxRetries: number = 1,
): Promise<GenerationResult> {
  const intentAndStructure = await analyzeIntentAndStructure(
    userInput,
    dna.generatedProfile,
  );

  let post: string;
  let evaluation: SelfEvaluation;
  let attempt = 0;

  do {
    // Retry with polish model for quality on second attempt
    const modelForAttempt = attempt === 0 ? MODELS.chain : MODELS.polish;
    post = await generatePostText(userInput, intentAndStructure, dna, modelForAttempt);
    evaluation = await selfEvaluate(post, userInput, dna.generatedProfile);
    attempt++;
  } while (evaluation.needsRefinement && attempt <= maxRetries);

  return {
    post,
    intent: intentAndStructure.intent,
    structure: intentAndStructure.structure,
    evaluation,
  };
}

export function buildChainContext(
  result: GenerationResult,
  dna: WritingDNAInput,
): ChainContext {
  return {
    intent: result.intent,
    structure: result.structure,
    dnaSnapshot: dna,
  };
}
