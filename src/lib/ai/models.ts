/**
 * Centralized Claude model IDs.
 *
 * - `chain`: fast/cheap model for every step of the 5-step generation chain.
 * - `polish`: higher-capability model for final-attempt retries, DNA profile
 *   generation, and any one-shot quality-critical calls.
 *
 * Change these in one place when newer models ship.
 */
export const MODELS = {
  chain: "claude-sonnet-4-6",
  polish: "claude-opus-4-7",
} as const;

export type ModelId = (typeof MODELS)[keyof typeof MODELS];
