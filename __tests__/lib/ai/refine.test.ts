import { describe, it, expect, vi } from "vitest";
import { refinePost } from "@/lib/ai/refine";
import type { ChainContext } from "@/lib/ai/types";

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: function() {
      this.messages = {
        create: vi.fn().mockResolvedValue({
          content: [
            {
              type: "text",
              text: "You won't believe what happened when I hired 3 wrong people.\n\nIt nearly killed my startup.\n\nHere's what changed everything...",
            },
          ],
        }),
      };
    },
  };
});

const mockContext: ChainContext = {
  intent: {
    topic: "hiring mistakes",
    goal: "educate",
    keyMessage: "Hire slow",
    targetEmotion: "recognition",
    detectedLanguage: "en",
  },
  structure: {
    structure: "lesson",
    reasoning: "Lesson learned fits",
  },
  dnaSnapshot: {
    tone: "professional",
    audience: "founders",
    style: "punchy",
    emojiUsage: "light",
    samplePosts: [],
    generatedProfile: "This person writes in short, punchy sentences.",
    preferredLanguage: "en",
  },
};

describe("refinePost", () => {
  it("returns a refined post string", async () => {
    const result = await refinePost(
      "I hired 3 wrong people.\n\nHere's what I learned.",
      "stronger_hook",
      null,
      mockContext
    );

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(10);
  });

  it("passes custom instruction for custom refinement type", async () => {
    const result = await refinePost(
      "Some post text",
      "custom",
      "Mention my company AcmeCorp",
      mockContext
    );

    expect(typeof result).toBe("string");
  });
});
