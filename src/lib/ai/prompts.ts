import { WritingDNAInput } from "./types";

export function buildIntentAndStructurePrompt(
  userInput: string,
  dnaProfile: string
): string {
  return `You are analyzing a LinkedIn post idea to determine intent and best structure.

USER'S IDEA:
"${userInput}"

USER'S WRITING PROFILE:
${dnaProfile}

Respond in JSON only. No markdown, no explanation.

{
  "intent": {
    "topic": "the core topic in 3-5 words",
    "goal": "educate" | "inspire" | "sell" | "entertain",
    "keyMessage": "the one thing the reader should take away",
    "targetEmotion": "the emotion this should evoke",
    "detectedLanguage": "de" | "en"
  },
  "structure": {
    "structure": "hook_story" | "contrarian" | "personal" | "list" | "lesson",
    "reasoning": "one sentence why this structure fits"
  }
}`;
}

export function buildGeneratePostPrompt(
  userInput: string,
  intent: string,
  structure: string,
  structureReasoning: string,
  dna: WritingDNAInput,
  language: string
): string {
  const structureGuides: Record<string, string> = {
    hook_story:
      "Start with a bold hook (1 line). Tell a short story (3-5 lines). Draw an insight (2-3 lines). End with a clear CTA.",
    contrarian:
      "Open with a contrarian statement that challenges common belief. Support with evidence or experience. End with your actual position.",
    personal:
      "Start vulnerable — share a real moment. Build the narrative. End with what you learned. Make the reader feel it.",
    list: "Hook with what the list delivers. Number each item (keep them punchy). End with a takeaway or CTA.",
    lesson:
      "Start with the failure or mistake. What happened. What you learned. What the reader can do differently.",
  };

  return `You are a LinkedIn ghostwriter. Write a post that sounds EXACTLY like this person wrote it.

VOICE INSTRUCTIONS (follow these precisely):
${dna.generatedProfile}

STYLE RULES:
- Tone: ${dna.tone}
- Sentence style: ${dna.style}
- Emoji usage: ${dna.emojiUsage}
- Language: Write in ${language === "de" ? "German" : "English"}

LINKEDIN FORMATTING RULES:
- First line must be a hook — it appears before "see more" (max 210 characters)
- Use short lines (1-2 sentences per line)
- Add blank lines between sections for readability
- No hashtags in the body — add 3-5 relevant hashtags at the very end after a blank line
- Keep total length between 800-1500 characters

STRUCTURE: ${structure}
${structureGuides[structure] || structureGuides.hook_story}

USER'S ORIGINAL IDEA:
"${userInput}"

INTENT: ${intent}

${dna.samplePosts.length > 0 ? `EXAMPLE POSTS BY THIS USER (mimic this style):\n${dna.samplePosts.map((p, i) => `--- Example ${i + 1} ---\n${p}`).join("\n\n")}` : ""}

Write the LinkedIn post now. Output ONLY the post text, nothing else.`;
}

export function buildSelfEvaluatePrompt(
  post: string,
  userInput: string,
  dnaProfile: string
): string {
  return `Evaluate this LinkedIn post on 4 criteria. Score each 1-5.

POST:
"""
${post}
"""

ORIGINAL IDEA: "${userInput}"

AUTHOR'S WRITING PROFILE:
${dnaProfile}

Score in JSON only:
{
  "soundsHuman": 1-5,
  "matchesVoice": 1-5,
  "linkedInNative": 1-5,
  "deliversMessage": 1-5,
  "needsRefinement": true if ANY score < 3
}`;
}

export function buildRefinementPrompt(
  currentPost: string,
  action: string,
  customInstruction: string | null,
  dna: WritingDNAInput,
  language: string
): string {
  const actionInstructions: Record<string, string> = {
    stronger_hook:
      "Rewrite ONLY the first 1-2 lines with a more compelling, attention-grabbing hook. Keep the rest unchanged.",
    different_cta:
      "Rewrite ONLY the call-to-action at the end. Keep the rest unchanged.",
    change_takeaway:
      "Change the core lesson or insight of the post while keeping the story/structure.",
    shorter:
      "Condense this post significantly. Remove filler, tighten sentences. Keep the core message.",
    longer:
      "Expand this post with more detail, examples, or story. Keep the same structure.",
    more_casual:
      "Rewrite with a more casual, conversational tone. Like talking to a friend.",
    more_professional:
      "Rewrite with a more polished, professional tone. Keep it warm but authoritative.",
    add_emojis:
      "Add emojis that fit naturally. Use them to emphasize key points, not decorate.",
    remove_emojis: "Remove all emojis from the post.",
    different_angle:
      "Keep the same topic but approach it from a completely different angle or perspective.",
    custom: customInstruction || "Improve this post.",
  };

  return `You are refining a LinkedIn post. Apply this specific change:

CHANGE REQUESTED: ${actionInstructions[action] || actionInstructions.custom}

CURRENT POST:
"""
${currentPost}
"""

VOICE INSTRUCTIONS:
${dna.generatedProfile}
Tone: ${dna.tone} | Style: ${dna.style} | Emojis: ${dna.emojiUsage}
Language: ${language === "de" ? "German" : "English"}

Output ONLY the refined post text, nothing else.`;
}

export function buildDNAProfilePrompt(
  tone: string,
  audience: string,
  style: string,
  emojiUsage: string,
  samplePosts: string[],
  styleDiscoveryAnswers: Record<string, unknown> | null,
  language: string
): string {
  let styleContext = "";
  if (samplePosts.length > 0) {
    styleContext = `\nSAMPLE POSTS BY THIS USER:\n${samplePosts.map((p, i) => `--- Post ${i + 1} ---\n${p}`).join("\n\n")}`;
  }
  if (styleDiscoveryAnswers) {
    styleContext += `\nSTYLE DISCOVERY ANSWERS:\n${JSON.stringify(styleDiscoveryAnswers, null, 2)}`;
  }

  return `Analyze this person's writing style and create a Writing DNA profile. This profile will be used as instructions for an AI ghostwriter to mimic their voice perfectly.

QUESTIONNAIRE ANSWERS:
- Tone: ${tone}
- Target audience: ${audience}
- Writing style preference: ${style}
- Emoji usage preference: ${emojiUsage}
${styleContext}

Write a 3-5 sentence profile in ${language === "de" ? "German" : "English"} that captures:
1. How they structure sentences (short/long, fragments/complete)
2. Their personality in writing (warm/sharp, humble/bold)
3. Patterns in how they open and close posts
4. Vocabulary level and formality
5. Any unique quirks or signatures

Output ONLY the profile text. Write it as instructions to a ghostwriter: "This person writes..."`;
}
