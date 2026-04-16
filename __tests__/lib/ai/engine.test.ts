import { describe, it, expect, vi, beforeEach } from "vitest";
import { generatePost } from "@/lib/ai/engine";
import type { WritingDNAInput } from "@/lib/ai/types";

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: function() { this.messages = { create: mockCreate }; },
  };
});

const mockDNA: WritingDNAInput = {
  tone: "professional",
  audience: "startup founders",
  style: "punchy",
  emojiUsage: "light",
  samplePosts: [],
  generatedProfile:
    "This person writes in short, punchy sentences. Professional but warm.",
  preferredLanguage: "en",
};

describe("generatePost", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  it("runs the full 5-step chain and returns a GenerationResult", async () => {
    // Step 1-2: Intent + Structure (combined call)
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            intent: {
              topic: "hiring mistakes",
              goal: "educate",
              keyMessage: "Hire slow, fire fast",
              targetEmotion: "recognition",
              detectedLanguage: "en",
            },
            structure: {
              structure: "lesson",
              reasoning: "Personal failure story fits lesson structure",
            },
          }),
        },
      ],
    });

    // Step 3: Generate post
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "I hired 3 wrong people in 6 months.\n\nIt nearly killed my startup.\n\nHere's what I learned about hiring:\n\n1. Speed kills\n2. Culture fit > skills\n3. Trust your gut\n\nSlow down. The right hire is worth the wait.\n\n#hiring #startups #leadership",
        },
      ],
    });

    // Step 4: Self-evaluate
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            soundsHuman: 5,
            matchesVoice: 4,
            linkedInNative: 5,
            deliversMessage: 4,
            needsRefinement: false,
          }),
        },
      ],
    });

    const result = await generatePost("I made bad hires early on", mockDNA);

    expect(result.post).toContain("hired");
    expect(result.intent.topic).toBe("hiring mistakes");
    expect(result.structure.structure).toBe("lesson");
    expect(result.evaluation.needsRefinement).toBe(false);
    expect(mockCreate).toHaveBeenCalledTimes(3);
  });

  it("retries generation when self-evaluation scores below 3", async () => {
    // Step 1-2
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            intent: {
              topic: "remote work",
              goal: "inspire",
              keyMessage: "Remote work is freedom",
              targetEmotion: "excitement",
              detectedLanguage: "en",
            },
            structure: {
              structure: "hook_story",
              reasoning: "Inspirational story fits hook_story",
            },
          }),
        },
      ],
    });

    // Step 3: First generation
    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "Remote work is great. Try it." }],
    });

    // Step 4: Low score — needs refinement
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            soundsHuman: 2,
            matchesVoice: 2,
            linkedInNative: 2,
            deliversMessage: 3,
            needsRefinement: true,
          }),
        },
      ],
    });

    // Step 3 retry: Better generation
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: "I quit my office job 2 years ago.\n\nBest decision I ever made.\n\nHere's why remote work changed everything for me...",
        },
      ],
    });

    // Step 4 retry: Passes
    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            soundsHuman: 4,
            matchesVoice: 4,
            linkedInNative: 5,
            deliversMessage: 4,
            needsRefinement: false,
          }),
        },
      ],
    });

    const result = await generatePost("remote work is amazing", mockDNA);

    expect(result.post).toContain("quit my office job");
    expect(result.evaluation.needsRefinement).toBe(false);
    // 5 calls: intent+structure, gen1, eval1, gen2, eval2
    expect(mockCreate).toHaveBeenCalledTimes(5);
  });
});
