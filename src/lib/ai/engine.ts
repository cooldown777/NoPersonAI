import Anthropic from "@anthropic-ai/sdk";
import {
  buildIntentAndStructurePrompt,
  buildGeneratePostPrompt,
  buildSelfEvaluatePrompt,
} from "./prompts";
import type {
  IntentAndStructure,
  SelfEvaluation,
  GenerationResult,
  WritingDNAInput,
  ChainContext,
} from "./types";

const anthropic = new Anthropic();

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
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
  dnaProfile: string
): Promise<IntentAndStructure> {
  const prompt = buildIntentAndStructurePrompt(userInput, dnaProfile);
  const response = await callClaude(prompt, 500);
  return parseJSON<IntentAndStructure>(response);
}

async function generatePostText(
  userInput: string,
  intentAndStructure: IntentAndStructure,
  dna: WritingDNAInput
): Promise<string> {
  const language =
    intentAndStructure.intent.detectedLanguage || dna.preferredLanguage;
  const prompt = buildGeneratePostPrompt(
    userInput,
    JSON.stringify(intentAndStructure.intent),
    intentAndStructure.structure.structure,
    intentAndStructure.structure.reasoning,
    dna,
    language
  );
  return callClaude(prompt, 1000);
}

async function selfEvaluate(
  post: string,
  userInput: string,
  dnaProfile: string
): Promise<SelfEvaluation> {
  const prompt = buildSelfEvaluatePrompt(post, userInput, dnaProfile);
  const response = await callClaude(prompt, 200);
  return parseJSON<SelfEvaluation>(response);
}

export async function generatePost(
  userInput: string,
  dna: WritingDNAInput,
  maxRetries: number = 1
): Promise<GenerationResult> {
  const intentAndStructure = await analyzeIntentAndStructure(
    userInput,
    dna.generatedProfile
  );

  let post: string;
  let evaluation: SelfEvaluation;
  let attempt = 0;

  do {
    post = await generatePostText(userInput, intentAndStructure, dna);
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
  dna: WritingDNAInput
): ChainContext {
  return {
    intent: result.intent,
    structure: result.structure,
    dnaSnapshot: dna,
  };
}
