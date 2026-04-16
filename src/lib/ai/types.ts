export interface IntentAnalysis {
  topic: string;
  goal: "educate" | "inspire" | "sell" | "entertain";
  keyMessage: string;
  targetEmotion: string;
  detectedLanguage: "de" | "en";
}

export interface StructureSelection {
  structure: "hook_story" | "contrarian" | "personal" | "list" | "lesson";
  reasoning: string;
}

export interface IntentAndStructure {
  intent: IntentAnalysis;
  structure: StructureSelection;
}

export interface SelfEvaluation {
  soundsHuman: number;
  matchesVoice: number;
  linkedInNative: number;
  deliversMessage: number;
  needsRefinement: boolean;
}

export interface GenerationResult {
  post: string;
  intent: IntentAnalysis;
  structure: StructureSelection;
  evaluation: SelfEvaluation;
}

export interface ChainContext {
  intent: IntentAnalysis;
  structure: StructureSelection;
  dnaSnapshot: WritingDNAInput;
}

export interface WritingDNAInput {
  tone: string;
  audience: string;
  style: string;
  emojiUsage: string;
  samplePosts: string[];
  generatedProfile: string;
  preferredLanguage: string;
}

export type RefinementAction =
  | "stronger_hook"
  | "different_cta"
  | "change_takeaway"
  | "shorter"
  | "longer"
  | "more_casual"
  | "more_professional"
  | "add_emojis"
  | "remove_emojis"
  | "different_angle"
  | "custom";
