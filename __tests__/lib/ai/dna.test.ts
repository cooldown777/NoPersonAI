import { describe, it, expect, vi } from "vitest";
import { generateDNAProfile } from "@/lib/ai/dna";

vi.mock("@anthropic-ai/sdk", () => {
  const MockAnthropic = function () {
    return {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [
            {
              type: "text",
              text: "This person writes in short, punchy sentences. Professional but warm. They lead with personal experience and close with actionable advice. Light emoji use. Vocabulary is accessible, not academic.",
            },
          ],
        }),
      },
    };
  };
  return { default: MockAnthropic };
});

describe("generateDNAProfile", () => {
  it("returns a natural language profile string", async () => {
    const result = await generateDNAProfile({
      tone: "professional",
      audience: "founders and startup people",
      style: "punchy",
      emojiUsage: "light",
      samplePosts: ["I failed 3 times before it worked.\n\nHere's what changed."],
      styleDiscoveryAnswers: null,
      language: "en",
    });

    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(50);
    expect(result).toContain("punchy");
  });
});
