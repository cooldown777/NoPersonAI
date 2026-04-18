import { WritingDNAInput } from "./types";

export function buildIntentAndStructurePrompt(
  userInput: string,
  dnaProfile: string,
): string {
  return `You are analyzing a LinkedIn post idea to determine intent and best structure.

USER'S IDEA:
"${userInput}"

USER'S WRITING PROFILE:
${dnaProfile}

Respond with a JSON object only — no markdown fences, no prose, no explanation.

Shape:
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
  language: string,
): string {
  const structureGuides: Record<string, string> = {
    hook_story:
      "Open with a one-line hook that makes the reader stop scrolling. Tell a short true-feeling story in 3-5 short lines. Widen to an insight. End with a quiet, reusable one-line takeaway — not a rhetorical question.",
    contrarian:
      "Open with a claim that challenges the default belief on this topic. Do not be edgy for its own sake — be specific. Support with lived experience or a concrete example. End with the nuance you actually hold.",
    personal:
      "Begin with a concrete moment (time, place, what you saw). Narrate plainly. Let the reader feel the stakes. End with what you took from it — not what they should do.",
    list:
      "Hook with what the list delivers or pays off. Number 3-5 items, each a complete thought in 1-2 sentences. Close with a single sentence that ties them together.",
    lesson:
      "Lead with the mistake or failure in 1 line. What actually happened (2-3 lines). What you learned (1-2 lines). Make the lesson transferable without sounding preachy.",
  };

  return `You are a LinkedIn ghostwriter. Write a post that sounds EXACTLY like this person wrote it — not like an AI, not like a template, not like every other LinkedIn post.

VOICE (follow precisely):
${dna.generatedProfile}

HARD STYLE RULES:
- Tone: ${dna.tone}
- Sentence style: ${dna.style}
- Emoji usage: ${dna.emojiUsage} (if "none", use zero emojis — not even in bullets)
- Language: Write in ${language === "de" ? "German (Deutsch)" : "English"}

THINGS THAT MAKE POSTS READ AS AI (avoid all of these):
- Rhetorical questions like "Agree?", "What do you think?", "Sound familiar?"
- Decorative emoji lists (✅ 🚀 💡)
- Three-item lists where every item is exactly one line
- Phrases like "Let me share", "Here are", "key lessons I've learned"
- Closing with 5+ hashtags and a question
- Fortune-cookie wisdom in the final line

LINKEDIN FORMATTING:
- First line must be a hook under 210 characters — what shows before "see more".
- Break paragraphs with a blank line. Short paragraphs.
- No hashtags in the body. Add 3-5 specific hashtags at the very end only if the voice profile suggests hashtags are normal for this author; otherwise zero hashtags.
- Total length: 700-1500 characters.

STRUCTURE: ${structure} — ${structureReasoning}
${structureGuides[structure] || structureGuides.hook_story}

USER'S ORIGINAL IDEA:
"${userInput}"

INTENT JSON: ${intent}

${dna.samplePosts.length > 0 ? `EXAMPLES OF HOW THIS USER ACTUALLY WRITES (mimic this rhythm):\n${dna.samplePosts.slice(0, 3).map((p, i) => `--- Example ${i + 1} ---\n${p}`).join("\n\n")}` : ""}

Output ONLY the post text. No preamble, no explanation, no quotation marks wrapping the post.`;
}

export function buildSelfEvaluatePrompt(
  post: string,
  userInput: string,
  dnaProfile: string,
): string {
  return `Evaluate this LinkedIn post on 4 criteria. Score each 1-5.

POST:
"""
${post}
"""

ORIGINAL IDEA: "${userInput}"

AUTHOR'S WRITING PROFILE:
${dnaProfile}

Be strict. A score of 3 means "acceptable but generic." 5 means "I believe a real human wrote this."

Respond with JSON only. No markdown. Shape:
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
  language: string,
): string {
  const actionInstructions: Record<string, string> = {
    stronger_hook:
      "Rewrite ONLY the first 1-2 lines with a more compelling, scroll-stopping hook. Keep everything after unchanged.",
    different_cta:
      "Rewrite ONLY the closing line / call-to-action. Keep the rest unchanged.",
    change_takeaway:
      "Change the core lesson or insight while keeping the story and structure.",
    shorter:
      "Tighten the post significantly. Remove filler, combine lines, cut anything not load-bearing. Keep the core message and voice.",
    longer:
      "Expand with one more concrete detail, example, or micro-story. Keep the same structure.",
    more_casual:
      "Rewrite with a more casual, conversational register. Shorter words. Contractions. Like talking to a friend.",
    more_professional:
      "Rewrite with a more polished, precise register. Warm but authoritative. No slang.",
    add_emojis:
      "Add emojis that fit the author's voice — to emphasize, never to decorate. Max 4.",
    remove_emojis: "Remove all emojis.",
    different_angle:
      "Keep the same topic but approach it from a completely different angle or perspective.",
    custom: customInstruction || "Improve this post while keeping the voice intact.",
  };

  return `You are refining a LinkedIn post. Apply exactly this change, nothing more:

CHANGE: ${actionInstructions[action] || actionInstructions.custom}

CURRENT POST:
"""
${currentPost}
"""

VOICE (preserve this at all costs):
${dna.generatedProfile}
Tone: ${dna.tone} · Style: ${dna.style} · Emojis: ${dna.emojiUsage}
Language: ${language === "de" ? "German" : "English"}

Output ONLY the refined post. No preamble, no quotes wrapping it.`;
}

export function buildDNAProfilePrompt(
  tone: string,
  audience: string,
  style: string,
  emojiUsage: string,
  samplePosts: string[],
  styleDiscoveryAnswers: Record<string, unknown> | null,
  language: string,
): string {
  let styleContext = "";
  if (samplePosts.length > 0) {
    styleContext = `\nSAMPLE POSTS BY THIS USER:\n${samplePosts.map((p, i) => `--- Post ${i + 1} ---\n${p}`).join("\n\n")}`;
  }
  if (styleDiscoveryAnswers) {
    styleContext += `\n\nSTYLE DISCOVERY ANSWERS:\n${JSON.stringify(styleDiscoveryAnswers, null, 2)}`;
  }

  return `Analyze this person's writing style and create a Writing DNA profile. This profile will be loaded as system context for every future post our AI writes for them, so it must be precise, concrete, and behavioral — not generic.

INPUTS:
- Self-described tone: ${tone}
- Target audience: ${audience}
- Writing style preference: ${style}
- Emoji usage preference: ${emojiUsage}
${styleContext}

Write a 3-5 sentence profile in ${language === "de" ? "German" : "English"} that captures, with specifics:
1. Sentence rhythm (short/long, fragments/complete, declarative/reflective)
2. Personality cues (warm vs sharp, humble vs bold, dry vs playful)
3. How they open and close — specific verbs or moves they use
4. Vocabulary register (technical? plain? literary?) — give concrete word-choices they favor or avoid
5. Any signature quirks (asides, one-word lines, specific punctuation habits)

Output ONLY the profile text. Write in second-person-as-instruction: "This person writes…". Do not use bullet points. Do not hedge ("might", "sometimes"); be decisive.`;
}
