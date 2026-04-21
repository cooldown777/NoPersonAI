# NoPersonAI Refinement Pass — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Spec:** `docs/superpowers/specs/2026-04-18-noperson-refinement-pass-design.md`

**Goal:** Ship 10 precise refinements to live SaaS (navbar polish, auth/DNA guard fix, smooth scroll, pricing toggle, 4-language i18n, optional DNA questions, admin dashboard, shorter DNA summary, bulk post generation, LinkedIn feasibility research) without rebuilding any working feature.

**Architecture:** Minimal additive changes to existing Next.js 16 App Router codebase. Prisma migrations are additive (new enum values, new column). i18n is a dictionary-based provider pattern — no heavy library. Admin is a single guarded route group. Bulk generation reuses the existing AI chain in parallel.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Prisma 7, NextAuth 4, Tailwind 4, Anthropic SDK, Vitest, jsdom.

**Working tree:** This plan is substantial. Consider creating a feature branch before starting:
```bash
git checkout -b refinement-pass
```

---

## Phase 1 — Navbar & branding polish

### Task 1: Refresh the header

**Files:**
- Modify: `src/components/brand/Logo.tsx`
- Modify: `src/components/landing/Header.tsx`

- [ ] **Step 1.1: Extend `Logo.tsx` to support a responsive size**

Replace `src/components/brand/Logo.tsx` with:

```tsx
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  sizeMobile?: number;
  wordmarkClassName?: string;
  className?: string;
  withWordmark?: boolean;
}

export function LogoMark({
  size = 28,
  sizeMobile,
  className,
}: {
  size?: number;
  sizeMobile?: number;
  className?: string;
}) {
  const mobile = sizeMobile ?? size;
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      style={{ width: mobile, height: mobile }}
      data-logo-mark
      aria-hidden="true"
    >
      <style>{`
        @media (min-width: 768px) {
          [data-logo-mark] { width: ${size}px !important; height: ${size}px !important; }
        }
      `}</style>
      <defs>
        <linearGradient id="np-logo-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#np-logo-grad)" />
      <path
        d="M10 22V10h2.2l5.6 8.2V10H20v12h-2.2l-5.6-8.2V22H10Z"
        fill="white"
      />
      <circle cx="23.5" cy="11" r="2.2" fill="#10B981" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

export function Logo({
  size = 36,
  sizeMobile = 32,
  wordmarkClassName,
  className,
  withWordmark = true,
}: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={size} sizeMobile={sizeMobile} />
      {withWordmark && (
        <span
          className={cn(
            "font-display text-lg font-bold tracking-tight text-zinc-900 md:text-xl",
            wordmarkClassName,
          )}
        >
          NoPerson<span className="text-brand-600">AI</span>
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 1.2: Update `src/components/landing/Header.tsx`**

Replace the file with:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "How it works", href: "#how-it-works" },
  { label: "WhatsApp", href: "#whatsapp" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "#faq" },
];

function isHashOnSamePage(href: string): boolean {
  return href.startsWith("#");
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleHashClick(e: React.MouseEvent, href: string) {
    if (!isHashOnSamePage(href)) return;
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth", block: "start" });
    history.pushState(null, "", href);
    setMenuOpen(false);
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all",
        scrolled
          ? "border-b border-zinc-200 bg-white/85 backdrop-blur"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 md:h-16 md:px-6">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(e) => handleHashClick(e, item.href)}
              className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/auth/signin"
            className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            Sign in
          </Link>
          <Link href="/auth/signin">
            <Button size="sm" className="h-9">
              Start free
            </Button>
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-zinc-700 hover:bg-zinc-100 md:hidden"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-zinc-100 bg-white md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleHashClick(e, item.href)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-zinc-100" />
              <Link
                href="/auth/signin"
                className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link href="/auth/signin" onClick={() => setMenuOpen(false)}>
                <Button fullWidth size="md" className="mt-2">
                  Start free
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
```

Note: `LanguageSwitcher` wiring happens in Phase 6 (i18n). Header layout is already sized to accommodate it.

- [ ] **Step 1.3: Verify in the browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Confirm on a desktop viewport (≥1280px):
- Logo visually anchors the left side (36px mark + `text-xl` wordmark).
- Contained width = `max-w-7xl` with even gutters.
- `Sign in` (ghost) and `Start free` (primary) are the same height (h-9) and read as a pair.
- Hamburger still works on mobile.

- [ ] **Step 1.4: Commit**

```bash
git add src/components/brand/Logo.tsx src/components/landing/Header.tsx
git commit -m "refine(nav): larger logo, balanced CTAs, wider container"
```

---

## Phase 2 — Auth/DNA guard fix

### Task 2: Stop re-prompting onboarding for returning users

**Files:**
- Modify: `src/app/auth/signin/signin-form.tsx:32`
- Modify: `src/app/onboarding/page.tsx` (convert to server wrapper)
- Create: `src/app/onboarding/onboarding-client.tsx` (extracted client component)
- Create: `__tests__/app/onboarding-guard.test.ts`

- [ ] **Step 2.1: Write the failing test**

Create `__tests__/app/onboarding-guard.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { shouldRedirectFromOnboarding } from "@/app/onboarding/guard-logic";

describe("shouldRedirectFromOnboarding", () => {
  it("redirects to /auth/signin when no session", () => {
    expect(shouldRedirectFromOnboarding({ hasSession: false, hasDna: false })).toBe(
      "/auth/signin",
    );
  });

  it("redirects to /app when session and DNA both present", () => {
    expect(shouldRedirectFromOnboarding({ hasSession: true, hasDna: true })).toBe(
      "/app",
    );
  });

  it("returns null (render onboarding) when session present but no DNA", () => {
    expect(shouldRedirectFromOnboarding({ hasSession: true, hasDna: false })).toBe(
      null,
    );
  });
});
```

- [ ] **Step 2.2: Run test to verify it fails**

```bash
npm run test:run -- __tests__/app/onboarding-guard.test.ts
```

Expected: FAIL (`shouldRedirectFromOnboarding` not defined).

- [ ] **Step 2.3: Create the guard logic module**

Create `src/app/onboarding/guard-logic.ts`:

```ts
export function shouldRedirectFromOnboarding(ctx: {
  hasSession: boolean;
  hasDna: boolean;
}): "/auth/signin" | "/app" | null {
  if (!ctx.hasSession) return "/auth/signin";
  if (ctx.hasDna) return "/app";
  return null;
}
```

- [ ] **Step 2.4: Run test to verify it passes**

```bash
npm run test:run -- __tests__/app/onboarding-guard.test.ts
```

Expected: PASS.

- [ ] **Step 2.5: Extract the existing client form**

Rename the existing `src/app/onboarding/page.tsx` contents into a new file `src/app/onboarding/onboarding-client.tsx` — same code, just add `"use client";` at the top (it already has it) and export the component as the default.

Create `src/app/onboarding/onboarding-client.tsx` with the full contents currently in `src/app/onboarding/page.tsx` (starting with `"use client";` and ending with the closing brace). Change the default-exported function name from `OnboardingPage` to `OnboardingClient`.

- [ ] **Step 2.6: Convert `page.tsx` to a server component guard**

Replace `src/app/onboarding/page.tsx` with:

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { shouldRedirectFromOnboarding } from "./guard-logic";
import OnboardingClient from "./onboarding-client";

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);
  const hasSession = !!session?.user?.id;

  let hasDna = false;
  if (hasSession) {
    const dna = await prisma.writingDNA.findUnique({
      where: { userId: session!.user!.id },
      select: { id: true },
    });
    hasDna = !!dna;
  }

  const target = shouldRedirectFromOnboarding({ hasSession, hasDna });
  if (target) redirect(target);

  return <OnboardingClient />;
}
```

- [ ] **Step 2.7: Fix the sign-in default target**

Open `src/app/auth/signin/signin-form.tsx`. Line 32 reads:

```ts
const target = callbackUrl || "/onboarding";
```

Change it to:

```ts
const target = callbackUrl || "/app";
```

- [ ] **Step 2.8: Manual verification**

```bash
npm run dev
```

As a user with existing DNA: sign out, sign back in → you land on `/app`, no onboarding screen. Type `/onboarding` directly → get redirected to `/app`.

As a first-time user (new email): sign in → lands on `/app` → `/app/layout.tsx` redirects to `/onboarding` → onboarding renders normally.

- [ ] **Step 2.9: Commit**

```bash
git add src/app/auth/signin/signin-form.tsx src/app/onboarding/ __tests__/app/
git commit -m "fix(auth): skip onboarding for returning users with DNA"
```

---

## Phase 3 — Smooth scroll UX

### Task 3: Consistent smooth scroll with reduced-motion respect

Note: the smooth-scroll interception lives in `Header.tsx` and was already added in Phase 1 (Task 1, Step 1.2, `handleHashClick`). This task adds the matching `scroll-mt-20` to section anchors so the header doesn't cover them.

**Files:**
- Modify: `src/components/landing/Hero.tsx` (add `id="top"` + `scroll-mt-20`)
- Modify: `src/components/landing/PainPoints.tsx`
- Modify: `src/components/landing/HowItWorks.tsx`
- Modify: `src/components/landing/WhatsAppSection.tsx`
- Modify: `src/components/landing/PostPreviewSection.tsx`
- Modify: `src/components/landing/WritingDNASection.tsx`
- Modify: `src/components/landing/PricingSection.tsx` (already has `scroll-mt-20` — verify)
- Modify: `src/components/landing/FAQ.tsx`
- Modify: `src/components/landing/FinalCTA.tsx`

- [ ] **Step 3.1: Audit current IDs**

Run:
```bash
grep -n 'id="' src/components/landing/*.tsx
```

Expected: identify which sections already have `id=` and `scroll-mt-20`.

- [ ] **Step 3.2: Ensure every section has `id` + `scroll-mt-20`**

For each file above, locate its top-level `<section>` and ensure:

- `id` is set to the hash used in the nav:
  - `Hero.tsx` → `id="top"`
  - `HowItWorks.tsx` → `id="how-it-works"`
  - `WhatsAppSection.tsx` → `id="whatsapp"`
  - `PricingSection.tsx` → `id="pricing"` (already present)
  - `FAQ.tsx` → `id="faq"`
  - `PainPoints.tsx` → `id="pain-points"`
  - `PostPreviewSection.tsx` → `id="demo"` (matches the Hero's internal demo anchor if applicable; if it conflicts, use `id="preview"`)
  - `WritingDNASection.tsx` → `id="dna"`
  - `FinalCTA.tsx` → `id="get-started"`

- Append `scroll-mt-20` to the section's `className` if not present.

Example edit pattern — in `HowItWorks.tsx`, change:
```tsx
<section className="bg-white">
```
to:
```tsx
<section id="how-it-works" className="bg-white scroll-mt-20">
```

Repeat for each section.

- [ ] **Step 3.3: Manual verification**

```bash
npm run dev
```

On the landing page click each nav link (`How it works`, `WhatsApp`, `FAQ`). Confirm:
- Each scrolls smoothly to its target.
- Target heading is **below** the sticky header (not hidden under it).
- Enable `Reduce motion` in OS System Settings → reload → clicks now jump instantly.

- [ ] **Step 3.4: Commit**

```bash
git add src/components/landing/
git commit -m "refine(scroll): add scroll-mt and IDs to all landing sections"
```

---

## Phase 4 — DNA refinements (optional questions + shorter summary)

### Task 4a: Make all DNA questions optional

**Files:**
- Modify: `src/components/onboarding/StepBasics.tsx`
- Modify: `src/components/onboarding/StepTone.tsx`
- Modify: `src/components/onboarding/StepStyle.tsx`

- [ ] **Step 4a.1: Remove gating in `StepBasics.tsx`**

Open `src/components/onboarding/StepBasics.tsx`. Change:

```tsx
<button
  onClick={onNext}
  disabled={!name.trim() || !audience.trim()}
  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
>
  Continue
</button>
```

to:

```tsx
<button
  onClick={onNext}
  className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
>
  Continue
</button>
```

Also add `(optional)` to label text. Change:
```tsx
<label className="block text-sm font-medium text-gray-700">
  Your name
</label>
```
to:
```tsx
<label className="block text-sm font-medium text-gray-700">
  Your name <span className="text-gray-400">(optional)</span>
</label>
```

Apply the same `(optional)` suffix to the "Who is your target audience?" label.

- [ ] **Step 4a.2: Allow zero-tone selection in `StepTone.tsx`**

Open `src/components/onboarding/StepTone.tsx`. Remove any `disabled` attribute that depends on `selectedTones.length`. Change the heading/subtitle copy to indicate it's optional (e.g., "Pick 1 or 2 tones (optional)" — exact copy follows existing styling).

(If the file gates the Next button on `selectedTones.length > 0`, remove that condition so the button is always enabled.)

- [ ] **Step 4a.3: Add Skip mode to `StepStyle.tsx`**

Open `src/components/onboarding/StepStyle.tsx`. In the `if (!mode)` block, add a third button under the existing two. Replace:

```tsx
<div className="space-y-3">
  <button
    onClick={() => {
      setMode("paste");
      if (samplePosts.length === 0) onSamplePostsChange([""]);
    }}
    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
  >
    <div className="text-sm font-medium text-gray-900">
      I have LinkedIn posts
    </div>
    <div className="text-xs text-gray-500">
      Paste 1-5 posts so we can learn your voice
    </div>
  </button>

  <button
    onClick={() => setMode("discover")}
    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
  >
    <div className="text-sm font-medium text-gray-900">
      I&apos;m new to LinkedIn
    </div>
    <div className="text-xs text-gray-500">
      We&apos;ll help you find your style
    </div>
  </button>
</div>
```

with:

```tsx
<div className="space-y-3">
  <button
    onClick={() => {
      setMode("paste");
      if (samplePosts.length === 0) onSamplePostsChange([""]);
    }}
    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
  >
    <div className="text-sm font-medium text-gray-900">
      I have LinkedIn posts
    </div>
    <div className="text-xs text-gray-500">
      Paste 1-5 posts so we can learn your voice
    </div>
  </button>

  <button
    onClick={() => setMode("discover")}
    className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
  >
    <div className="text-sm font-medium text-gray-900">
      I&apos;m new to LinkedIn
    </div>
    <div className="text-xs text-gray-500">
      We&apos;ll help you find your style
    </div>
  </button>

  <button
    onClick={onNext}
    className="w-full rounded-lg border border-dashed border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
  >
    <div className="text-sm font-medium text-gray-900">
      Skip — train my DNA later
    </div>
    <div className="text-xs text-gray-500">
      We&apos;ll start with sensible defaults
    </div>
  </button>
</div>
```

Also remove the `disabled={!hasContent}` on the `Analyze my style` and `Generate my DNA` buttons so they're always enabled.

- [ ] **Step 4a.4: Manual verification**

```bash
npm run dev
```

Fresh user → click Continue on Step 1 without filling anything → Continue on Step 2 with nothing selected → on Step 3 click "Skip — train my DNA later". Should arrive at Step 4 with a generated DNA using defaults. Success.

- [ ] **Step 4a.5: Commit**

```bash
git add src/components/onboarding/
git commit -m "refine(onboarding): make all DNA inputs optional with skip path"
```

### Task 4b: Shorter DNA summary

**Files:**
- Modify: `src/lib/ai/prompts.ts:168-202` (`buildDNAProfilePrompt`)
- Modify: `src/lib/ai/dna.ts:32` (`max_tokens`)
- Modify: `src/components/onboarding/StepDNAResult.tsx:33-35`
- Modify: `__tests__/lib/ai/dna.test.ts` (if it asserts on the prompt)

- [ ] **Step 4b.1: Check the existing test**

```bash
cat __tests__/lib/ai/dna.test.ts
```

Review what the test asserts. If it matches against prompt content, you'll update those assertions in Step 4b.4.

- [ ] **Step 4b.2: Rewrite `buildDNAProfilePrompt`**

In `src/lib/ai/prompts.ts`, replace the entire `buildDNAProfilePrompt` function (starts at line 168) with:

```ts
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

  const minimalInputs =
    samplePosts.length === 0 && !styleDiscoveryAnswers;

  const languageLabel =
    language === "de" ? "German (Deutsch)"
    : language === "fr" ? "French (Français)"
    : language === "es" ? "Spanish (Español)"
    : "English";

  return `Write a short Writing DNA profile for this person. The profile will be loaded as system context for every AI-written post, so it must be concrete and actionable.

INPUTS:
- Tone: ${tone || "professional"}
- Audience: ${audience || "(not specified)"}
- Style: ${style || "mixed"}
- Emoji usage: ${emojiUsage || "light"}
${styleContext}
${minimalInputs ? "\nNote: inputs are minimal. Produce a usable generic profile anchored on the tone/style/emoji settings." : ""}

Write 2-3 short sentences, max 60 words total, in ${languageLabel}. Mention:
1. The tone + one signature move
2. Sentence rhythm / length
3. Emoji habit (only if non-default)

Write in second-person-as-instruction ("This person writes..."). No bullet points. Be decisive — no "might" or "sometimes". Output ONLY the profile text.`;
}
```

- [ ] **Step 4b.3: Lower `max_tokens` in `src/lib/ai/dna.ts`**

Change line 32:
```ts
max_tokens: 500,
```
to:
```ts
max_tokens: 150,
```

- [ ] **Step 4b.4: Update the existing test if needed**

Open `__tests__/lib/ai/dna.test.ts`. If any assertion references the old prompt text ("3-5 sentence profile", "Sentence rhythm", etc.), update it to reference the new prompt's key phrases (e.g. "2-3 short sentences", "max 60 words"). If the test only asserts that `buildDNAProfilePrompt` returns a non-empty string, no change is needed.

Run the tests:

```bash
npm run test:run -- __tests__/lib/ai/dna.test.ts
```

Expected: PASS.

- [ ] **Step 4b.5: Shorten the subtitle**

Open `src/components/onboarding/StepDNAResult.tsx`. Change:

```tsx
<p className="mt-1 text-sm text-gray-600">
  Here&apos;s how we understand your voice
</p>
```

to:

```tsx
<p className="mt-1 text-sm text-gray-600">
  Your voice, summarized
</p>
```

- [ ] **Step 4b.6: Manual verification**

```bash
npm run dev
```

Complete onboarding with at least one sample post. Confirm the generated DNA profile on Step 4 is ≤ 3 short sentences.

- [ ] **Step 4b.7: Commit**

```bash
git add src/lib/ai/prompts.ts src/lib/ai/dna.ts src/components/onboarding/StepDNAResult.tsx __tests__/lib/ai/dna.test.ts
git commit -m "refine(dna): shorter 2-3 sentence summary with tighter prompt"
```

---

## Phase 5 — Pricing toggle (monthly/yearly)

### Task 5: Add period toggle with localStorage persistence

**Files:**
- Create: `src/components/landing/PricingToggle.tsx`
- Modify: `src/components/landing/PricingSection.tsx`
- Create: `__tests__/components/pricing-math.test.ts`

- [ ] **Step 5.1: Write the failing test for pricing math**

Create `__tests__/components/pricing-math.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  computeYearlyPrice,
  formatMonthlyEquivalent,
} from "@/components/landing/pricing-math";

describe("pricing math", () => {
  it("applies 15% discount to yearly price", () => {
    expect(computeYearlyPrice(29)).toBe(296); // 29 * 12 * 0.85 = 295.80 → 296
  });

  it("formats monthly equivalent for yearly plan", () => {
    // 296 / 12 = 24.666... → "€24.67"
    expect(formatMonthlyEquivalent(296)).toBe("€24.67");
  });
});
```

- [ ] **Step 5.2: Run test to verify it fails**

```bash
npm run test:run -- __tests__/components/pricing-math.test.ts
```

Expected: FAIL (module not found).

- [ ] **Step 5.3: Create `src/components/landing/pricing-math.ts`**

```ts
export function computeYearlyPrice(monthly: number, discountPct = 15): number {
  const yearly = monthly * 12 * (1 - discountPct / 100);
  return Math.round(yearly);
}

export function formatMonthlyEquivalent(yearlyTotal: number): string {
  const perMonth = yearlyTotal / 12;
  return `€${perMonth.toFixed(2)}`;
}
```

- [ ] **Step 5.4: Run test to verify it passes**

```bash
npm run test:run -- __tests__/components/pricing-math.test.ts
```

Expected: PASS.

- [ ] **Step 5.5: Create `PricingToggle.tsx`**

Create `src/components/landing/PricingToggle.tsx`:

```tsx
"use client";

import { cn } from "@/lib/utils";

export type BillingPeriod = "monthly" | "yearly";

interface PricingToggleProps {
  value: BillingPeriod;
  onChange: (value: BillingPeriod) => void;
  discountLabel?: string;
}

export default function PricingToggle({
  value,
  onChange,
  discountLabel = "Save 15%",
}: PricingToggleProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200 bg-white p-1">
      <button
        type="button"
        aria-pressed={value === "monthly"}
        onClick={() => onChange("monthly")}
        className={cn(
          "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          value === "monthly"
            ? "bg-zinc-900 text-white"
            : "text-zinc-600 hover:text-zinc-900",
        )}
      >
        Monthly
      </button>
      <button
        type="button"
        aria-pressed={value === "yearly"}
        onClick={() => onChange("yearly")}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
          value === "yearly"
            ? "bg-zinc-900 text-white"
            : "text-zinc-600 hover:text-zinc-900",
        )}
      >
        Yearly
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
            value === "yearly"
              ? "bg-accent-500 text-white"
              : "bg-accent-100 text-accent-700",
          )}
        >
          {discountLabel}
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 5.6: Wire toggle into `PricingSection.tsx`**

Replace `src/components/landing/PricingSection.tsx` with:

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, MessageCircle, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import PricingToggle, { type BillingPeriod } from "./PricingToggle";
import {
  computeYearlyPrice,
  formatMonthlyEquivalent,
} from "./pricing-math";

const STORAGE_KEY = "np:pricing-period";
const MONTHLY_PRO_EUR = 29;
const YEARLY_TOTAL = computeYearlyPrice(MONTHLY_PRO_EUR);

export default function PricingSection() {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "monthly" || saved === "yearly") setPeriod(saved);
  }, []);

  function handleChange(v: BillingPeriod) {
    setPeriod(v);
    localStorage.setItem(STORAGE_KEY, v);
  }

  const proPrice = period === "monthly"
    ? { big: "€29", small: "/month", sub: null }
    : {
        big: formatMonthlyEquivalent(YEARLY_TOTAL),
        small: "/month",
        sub: `billed €${YEARLY_TOTAL}/yr · Save 15%`,
      };

  const tiers = [
    {
      name: "Free",
      priceBig: "€0",
      priceSmall: "forever",
      priceSub: null as string | null,
      description: "Try NoPersonAI and ship a few posts.",
      features: [
        "5 posts / month",
        "Writing DNA profile",
        "5-step AI generation chain",
        "10+ one-tap refinements",
        "Post history",
      ],
      cta: "Start free",
      featured: false,
      badge: null as string | null,
    },
    {
      name: "Pro",
      priceBig: proPrice.big,
      priceSmall: proPrice.small,
      priceSub: proPrice.sub,
      description: "For founders and operators posting weekly.",
      features: [
        "Unlimited posts",
        "WhatsApp integration (text + voice)",
        "Browser voice recording",
        "Priority generation speed",
        "Priority support",
        "Everything in Free",
      ],
      cta: "Upgrade to Pro",
      featured: true,
      badge: "Most popular",
    },
  ];

  return (
    <section id="pricing" className="relative bg-zinc-50 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-brand-600">
            Pricing
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Start free. Upgrade when you&apos;re hooked.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Simple, honest pricing. Cancel anytime. No per-post fees.
          </p>
          <div className="mt-6 flex justify-center">
            <PricingToggle value={period} onChange={handleChange} />
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:mt-14 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.featured
                  ? "relative rounded-3xl border-2 border-brand-500 bg-white p-7 shadow-xl shadow-brand-600/10"
                  : "relative rounded-3xl border border-zinc-200 bg-white p-7"
              }
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    {tier.badge}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-display text-lg font-semibold text-zinc-900">{tier.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{tier.description}</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold tracking-tight text-zinc-900">
                  {tier.priceBig}
                </span>
                <span className="text-sm text-zinc-500">{tier.priceSmall}</span>
              </div>
              {tier.priceSub && (
                <p className="mt-1 text-xs text-zinc-500">{tier.priceSub}</p>
              )}

              <div className="mt-6">
                <Link href="/auth/signin">
                  <Button
                    variant={tier.featured ? "primary" : "outline"}
                    size="lg"
                    fullWidth
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>

              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                    <span>
                      {f.includes("WhatsApp") && (
                        <MessageCircle className="mr-1 inline-block h-3.5 w-3.5 text-accent-600" />
                      )}
                      {f.includes("voice recording") && (
                        <Mic className="mr-1 inline-block h-3.5 w-3.5 text-accent-600" />
                      )}
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 5.7: Manual verification**

```bash
npm run dev
```

Visit `/pricing`. Click Yearly → Pro price updates to `€24.67/month` with `billed €296/yr · Save 15%` subcopy. Reload → the toggle remembers the choice. Mobile: tap targets are large enough.

- [ ] **Step 5.8: Commit**

```bash
git add src/components/landing/PricingSection.tsx src/components/landing/PricingToggle.tsx src/components/landing/pricing-math.ts __tests__/components/pricing-math.test.ts
git commit -m "feat(pricing): monthly/yearly toggle with 15% yearly discount"
```

---

## Phase 6 — i18n infrastructure

### Task 6: Dictionary-based i18n foundation

**Files:**
- Create: `src/i18n/config.ts`
- Create: `src/i18n/en.ts` (baseline)
- Create: `src/i18n/de.ts`
- Create: `src/i18n/fr.ts`
- Create: `src/i18n/es.ts`
- Create: `src/i18n/index.ts`
- Create: `src/i18n/provider.tsx`
- Create: `src/i18n/use-i18n.ts`
- Create: `src/i18n/server.ts`
- Create: `src/components/LanguageSwitcher.tsx`
- Create: `src/app/api/i18n/route.ts`
- Modify: `prisma/schema.prisma` (extend `Language` enum)
- Create: `prisma/migrations/YYYYMMDDHHMMSS_language_enum_fr_es/migration.sql`
- Modify: `src/components/Providers.tsx` (wrap with `<I18nProvider>`)
- Modify: `src/app/layout.tsx` (resolve locale server-side)
- Modify: `src/components/landing/Header.tsx` (render switcher)
- Modify: `src/components/app/BottomNav.tsx` (render switcher in SideNav)
- Create: `__tests__/i18n/resolve-locale.test.ts`

- [ ] **Step 6.1: Write tests for locale resolution**

Create `__tests__/i18n/resolve-locale.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { resolveLocaleFromInputs } from "@/i18n/resolve-locale";

describe("resolveLocaleFromInputs", () => {
  it("prefers userPreferred when supported", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: "de",
        cookie: "fr",
        acceptLanguage: "es,en",
      }),
    ).toBe("de");
  });

  it("falls back to cookie when no user preference", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: null,
        cookie: "fr",
        acceptLanguage: "es,en",
      }),
    ).toBe("fr");
  });

  it("picks first supported from Accept-Language", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: null,
        cookie: null,
        acceptLanguage: "ja,zh,es,en",
      }),
    ).toBe("es");
  });

  it("defaults to en when nothing matches", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: null,
        cookie: null,
        acceptLanguage: "ja,zh",
      }),
    ).toBe("en");
  });

  it("ignores unsupported user preference and falls through", () => {
    expect(
      resolveLocaleFromInputs({
        userPreferred: "ja" as unknown as "en",
        cookie: "fr",
        acceptLanguage: null,
      }),
    ).toBe("fr");
  });
});
```

- [ ] **Step 6.2: Run the test (fails — module not found)**

```bash
npm run test:run -- __tests__/i18n/resolve-locale.test.ts
```

Expected: FAIL.

- [ ] **Step 6.3: Create `src/i18n/config.ts`**

```ts
export const SUPPORTED_LOCALES = ["en", "de", "fr", "es"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" &&
    (SUPPORTED_LOCALES as readonly string[]).includes(value)
  );
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
};
```

- [ ] **Step 6.4: Create `src/i18n/resolve-locale.ts`**

```ts
import { DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES, type Locale } from "./config";

interface Inputs {
  userPreferred: string | null;
  cookie: string | null;
  acceptLanguage: string | null;
}

export function resolveLocaleFromInputs(inputs: Inputs): Locale {
  if (isLocale(inputs.userPreferred)) return inputs.userPreferred;
  if (isLocale(inputs.cookie)) return inputs.cookie;
  if (inputs.acceptLanguage) {
    const candidates = inputs.acceptLanguage
      .split(",")
      .map((s) => s.split(";")[0].trim().toLowerCase().slice(0, 2));
    for (const c of candidates) {
      if (isLocale(c)) return c;
    }
  }
  return DEFAULT_LOCALE;
}

export { SUPPORTED_LOCALES, DEFAULT_LOCALE };
```

Re-run the test:
```bash
npm run test:run -- __tests__/i18n/resolve-locale.test.ts
```
Expected: PASS.

- [ ] **Step 6.5: Create the dictionary shape in `src/i18n/en.ts`**

```ts
export const en = {
  common: {
    signIn: "Sign in",
    startFree: "Start free",
    upgrade: "Upgrade to Pro",
    continue: "Continue",
    back: "Back",
    cancel: "Cancel",
    save: "Save",
    skip: "Skip",
    loading: "Loading…",
    optional: "optional",
  },
  nav: {
    howItWorks: "How it works",
    whatsapp: "WhatsApp",
    pricing: "Pricing",
    faq: "FAQ",
  },
  hero: {
    badge: "Now with WhatsApp voice notes",
    title: "A LinkedIn ghostwriter that sounds exactly like you.",
    subtitle:
      "Send a rough idea or a voice note via WhatsApp. Get a ready-to-post LinkedIn post in your voice — not generic AI slop.",
    ctaPrimary: "Start free — 5 posts/month",
    ctaSecondary: "See the demo",
    noCard: "No credit card · 60-second sign-up",
    inputPlaceholder: "Type a rough idea — e.g. 'Lessons from my worst hire'",
    generate: "Generate preview",
    copied: "Copied",
    copy: "Copy",
    generated: "Generated",
    genericProfile: "This used a generic voice profile.",
    trainYourDna: "Train your own Writing DNA →",
    networkError: "Network error. Try again.",
    generationFailed: "Generation failed",
  },
  pricing: {
    eyebrow: "Pricing",
    title: "Start free. Upgrade when you're hooked.",
    subtitle: "Simple, honest pricing. Cancel anytime. No per-post fees.",
    monthly: "Monthly",
    yearly: "Yearly",
    save15: "Save 15%",
    perMonth: "/month",
    forever: "forever",
    billedYearly: "billed €{total}/yr · Save 15%",
    free: {
      description: "Try NoPersonAI and ship a few posts.",
      features: [
        "5 posts / month",
        "Writing DNA profile",
        "5-step AI generation chain",
        "10+ one-tap refinements",
        "Post history",
      ],
      cta: "Start free",
    },
    pro: {
      description: "For founders and operators posting weekly.",
      badge: "Most popular",
      features: [
        "Unlimited posts",
        "WhatsApp integration (text + voice)",
        "Browser voice recording",
        "Priority generation speed",
        "Priority support",
        "Everything in Free",
      ],
      cta: "Upgrade to Pro",
    },
  },
  onboarding: {
    headingBasics: "Let's get started",
    subBasics: "Tell us a bit about yourself",
    name: "Your name",
    language: "Preferred language",
    audience: "Who is your target audience?",
    audienceHint:
      "e.g. \"startup founders\", \"HR managers\", \"tech leads\"",
    audiencePlaceholder: "founders, entrepreneurs, business owners",
    modeHeading: "Your style",
    modeSub: "Help us understand how you write",
    modePaste: "I have LinkedIn posts",
    modePasteSub: "Paste 1-5 posts so we can learn your voice",
    modeDiscover: "I'm new to LinkedIn",
    modeDiscoverSub: "We'll help you find your style",
    modeSkip: "Skip — train my DNA later",
    modeSkipSub: "We'll start with sensible defaults",
    dnaHeading: "Your Writing DNA",
    dnaSummary: "Your voice, summarized",
    dnaAdjust: "Not quite right? Tell us what to adjust:",
    dnaRegenerate: "Regenerate with adjustments",
    dnaDone: "Looks good — let's go!",
    analyzing: "Analyzing your writing style...",
  },
  appShell: {
    navCreate: "Create",
    navWhatsApp: "WhatsApp",
    navHistory: "History",
    navDna: "DNA",
    navAccount: "Account",
    navBulk: "Bulk generate",
  },
  generator: {
    title: "Create a post",
    subtitle:
      "Drop an idea. Our AI will turn it into a LinkedIn-native draft in your voice.",
    limitReachedTitle: "You've used all 5 free posts this month",
    limitReachedBody:
      "Upgrade to Pro for unlimited posts and WhatsApp integration.",
  },
  bulk: {
    title: "Bulk generate",
    subtitle: "One topic → multiple posts, each with a different angle.",
    topicLabel: "Your topic or idea",
    countLabel: "How many posts",
    cta: "Generate {n} posts",
    quotaFree: "Uses {n} of {remaining} free posts this month",
    quotaPro: "Unlimited on Pro",
    quotaExceeded:
      "Not enough posts left. You have {remaining} free posts remaining this month.",
  },
  language: {
    label: "Language",
  },
} as const;

export type Dictionary = typeof en;
```

- [ ] **Step 6.6: Create stubs for `de.ts`, `fr.ts`, `es.ts`**

Create `src/i18n/de.ts`:
```ts
import type { Dictionary } from "./en";

export const de: Dictionary = {
  common: {
    signIn: "Anmelden",
    startFree: "Kostenlos starten",
    upgrade: "Auf Pro upgraden",
    continue: "Weiter",
    back: "Zurück",
    cancel: "Abbrechen",
    save: "Speichern",
    skip: "Überspringen",
    loading: "Laden…",
    optional: "optional",
  },
  nav: {
    howItWorks: "So funktioniert's",
    whatsapp: "WhatsApp",
    pricing: "Preise",
    faq: "FAQ",
  },
  hero: {
    badge: "Jetzt mit WhatsApp-Sprachnachrichten",
    title: "Ein LinkedIn-Ghostwriter, der genau wie du klingt.",
    subtitle:
      "Schick eine grobe Idee oder eine Sprachnachricht per WhatsApp. Bekomm einen fertigen LinkedIn-Post in deiner Stimme — kein generischer KI-Einheitsbrei.",
    ctaPrimary: "Kostenlos starten — 5 Posts/Monat",
    ctaSecondary: "Demo ansehen",
    noCard: "Keine Kreditkarte · 60-Sekunden-Anmeldung",
    inputPlaceholder: "Tipp eine Idee — z.B. 'Lehren aus meiner schlechtesten Einstellung'",
    generate: "Vorschau erzeugen",
    copied: "Kopiert",
    copy: "Kopieren",
    generated: "Erzeugt",
    genericProfile: "Hier wurde ein generisches Stimmprofil verwendet.",
    trainYourDna: "Trainiere deine eigene Writing-DNA →",
    networkError: "Netzwerkfehler. Versuch's noch mal.",
    generationFailed: "Erzeugung fehlgeschlagen",
  },
  pricing: {
    eyebrow: "Preise",
    title: "Kostenlos starten. Upgraden, wenn du süchtig bist.",
    subtitle: "Einfache, ehrliche Preise. Jederzeit kündbar. Keine Gebühr pro Post.",
    monthly: "Monatlich",
    yearly: "Jährlich",
    save15: "15% sparen",
    perMonth: "/Monat",
    forever: "für immer",
    billedYearly: "Abrechnung €{total}/Jahr · 15% sparen",
    free: {
      description: "Probier NoPersonAI aus und poste ein paar Mal.",
      features: [
        "5 Posts / Monat",
        "Writing-DNA-Profil",
        "5-Schritt KI-Generierungskette",
        "10+ Ein-Klick-Verfeinerungen",
        "Post-Historie",
      ],
      cta: "Kostenlos starten",
    },
    pro: {
      description: "Für Gründer und Operator, die wöchentlich posten.",
      badge: "Am beliebtesten",
      features: [
        "Unbegrenzte Posts",
        "WhatsApp-Integration (Text + Sprache)",
        "Sprachaufnahme im Browser",
        "Priorisierte Generierung",
        "Priorisierter Support",
        "Alles aus Free",
      ],
      cta: "Auf Pro upgraden",
    },
  },
  onboarding: {
    headingBasics: "Lass uns loslegen",
    subBasics: "Erzähl uns ein bisschen über dich",
    name: "Dein Name",
    language: "Bevorzugte Sprache",
    audience: "Wer ist deine Zielgruppe?",
    audienceHint: "z.B. \"Startup-Gründer\", \"HR-Manager\", \"Tech-Leads\"",
    audiencePlaceholder: "Gründer, Unternehmer, Business-Inhaber",
    modeHeading: "Dein Stil",
    modeSub: "Hilf uns zu verstehen, wie du schreibst",
    modePaste: "Ich habe LinkedIn-Posts",
    modePasteSub: "Füge 1-5 Posts ein, damit wir deine Stimme lernen",
    modeDiscover: "Ich bin neu auf LinkedIn",
    modeDiscoverSub: "Wir helfen dir, deinen Stil zu finden",
    modeSkip: "Überspringen — DNA später trainieren",
    modeSkipSub: "Wir starten mit sinnvollen Voreinstellungen",
    dnaHeading: "Deine Writing-DNA",
    dnaSummary: "Deine Stimme, zusammengefasst",
    dnaAdjust: "Nicht ganz richtig? Sag uns, was wir anpassen sollen:",
    dnaRegenerate: "Mit Anpassungen neu erzeugen",
    dnaDone: "Sieht gut aus — los geht's!",
    analyzing: "Analysiere deinen Schreibstil...",
  },
  appShell: {
    navCreate: "Erstellen",
    navWhatsApp: "WhatsApp",
    navHistory: "Historie",
    navDna: "DNA",
    navAccount: "Konto",
    navBulk: "Bulk erzeugen",
  },
  generator: {
    title: "Post erstellen",
    subtitle:
      "Wirf eine Idee rein. Unsere KI macht daraus einen LinkedIn-tauglichen Entwurf in deiner Stimme.",
    limitReachedTitle: "Du hast alle 5 kostenlosen Posts in diesem Monat genutzt",
    limitReachedBody:
      "Upgrade auf Pro für unbegrenzte Posts und WhatsApp-Integration.",
  },
  bulk: {
    title: "Bulk erzeugen",
    subtitle: "Ein Thema → mehrere Posts, jeder aus einem anderen Blickwinkel.",
    topicLabel: "Dein Thema oder deine Idee",
    countLabel: "Wie viele Posts",
    cta: "{n} Posts erzeugen",
    quotaFree: "Verbraucht {n} von {remaining} kostenlosen Posts diesen Monat",
    quotaPro: "Unbegrenzt auf Pro",
    quotaExceeded:
      "Nicht genug Posts übrig. Du hast noch {remaining} kostenlose Posts diesen Monat.",
  },
  language: {
    label: "Sprache",
  },
};
```

Create `src/i18n/fr.ts` with the same shape, French translations (use native phrasing — this is the full file; engineer should translate each string). Skeleton template:

```ts
import type { Dictionary } from "./en";

export const fr: Dictionary = {
  common: {
    signIn: "Se connecter",
    startFree: "Commencer gratuitement",
    upgrade: "Passer à Pro",
    continue: "Continuer",
    back: "Retour",
    cancel: "Annuler",
    save: "Enregistrer",
    skip: "Passer",
    loading: "Chargement…",
    optional: "facultatif",
  },
  nav: {
    howItWorks: "Comment ça marche",
    whatsapp: "WhatsApp",
    pricing: "Tarifs",
    faq: "FAQ",
  },
  hero: {
    badge: "Maintenant avec les notes vocales WhatsApp",
    title: "Un ghostwriter LinkedIn qui te ressemble exactement.",
    subtitle:
      "Envoie une idée brute ou une note vocale via WhatsApp. Reçois un post LinkedIn prêt à publier dans ta voix — pas de la bouillie d'IA générique.",
    ctaPrimary: "Commencer gratuitement — 5 posts/mois",
    ctaSecondary: "Voir la démo",
    noCard: "Pas de carte bancaire · inscription en 60 secondes",
    inputPlaceholder: "Tape une idée — par ex. 'Leçons de mon pire recrutement'",
    generate: "Générer un aperçu",
    copied: "Copié",
    copy: "Copier",
    generated: "Généré",
    genericProfile: "Cet aperçu utilise un profil générique.",
    trainYourDna: "Entraîne ton propre Writing DNA →",
    networkError: "Erreur réseau. Réessaie.",
    generationFailed: "Échec de la génération",
  },
  pricing: {
    eyebrow: "Tarifs",
    title: "Commence gratuitement. Upgrade quand tu es accro.",
    subtitle: "Tarifs simples et honnêtes. Annulation à tout moment.",
    monthly: "Mensuel",
    yearly: "Annuel",
    save15: "Économisez 15%",
    perMonth: "/mois",
    forever: "pour toujours",
    billedYearly: "facturé €{total}/an · Économisez 15%",
    free: {
      description: "Essaie NoPersonAI et publie quelques posts.",
      features: [
        "5 posts / mois",
        "Profil Writing DNA",
        "Chaîne de génération IA en 5 étapes",
        "10+ raffinements en un clic",
        "Historique des posts",
      ],
      cta: "Commencer gratuitement",
    },
    pro: {
      description: "Pour les fondateurs et opérateurs qui postent chaque semaine.",
      badge: "Le plus populaire",
      features: [
        "Posts illimités",
        "Intégration WhatsApp (texte + voix)",
        "Enregistrement vocal dans le navigateur",
        "Génération prioritaire",
        "Support prioritaire",
        "Tout ce qui est inclus dans Free",
      ],
      cta: "Passer à Pro",
    },
  },
  onboarding: {
    headingBasics: "Commençons",
    subBasics: "Parle-nous un peu de toi",
    name: "Ton prénom",
    language: "Langue préférée",
    audience: "Qui est ton audience cible ?",
    audienceHint: "par ex. \"fondateurs de startup\", \"DRH\", \"tech leads\"",
    audiencePlaceholder: "fondateurs, entrepreneurs, dirigeants",
    modeHeading: "Ton style",
    modeSub: "Aide-nous à comprendre comment tu écris",
    modePaste: "J'ai des posts LinkedIn",
    modePasteSub: "Colle 1 à 5 posts pour que nous apprenions ta voix",
    modeDiscover: "Je débute sur LinkedIn",
    modeDiscoverSub: "Nous t'aiderons à trouver ton style",
    modeSkip: "Passer — j'entraînerai mon DNA plus tard",
    modeSkipSub: "Nous partons avec des réglages par défaut raisonnables",
    dnaHeading: "Ton Writing DNA",
    dnaSummary: "Ta voix, résumée",
    dnaAdjust: "Pas tout à fait juste ? Dis-nous quoi ajuster :",
    dnaRegenerate: "Régénérer avec les ajustements",
    dnaDone: "C'est parfait — allons-y !",
    analyzing: "Analyse de ton style d'écriture...",
  },
  appShell: {
    navCreate: "Créer",
    navWhatsApp: "WhatsApp",
    navHistory: "Historique",
    navDna: "DNA",
    navAccount: "Compte",
    navBulk: "Génération en lot",
  },
  generator: {
    title: "Créer un post",
    subtitle:
      "Dépose une idée. Notre IA la transforme en brouillon LinkedIn dans ta voix.",
    limitReachedTitle: "Tu as utilisé tes 5 posts gratuits de ce mois",
    limitReachedBody:
      "Passe à Pro pour des posts illimités et l'intégration WhatsApp.",
  },
  bulk: {
    title: "Génération en lot",
    subtitle: "Un sujet → plusieurs posts, chacun sous un angle différent.",
    topicLabel: "Ton sujet ou idée",
    countLabel: "Combien de posts",
    cta: "Générer {n} posts",
    quotaFree: "Utilise {n} des {remaining} posts gratuits ce mois",
    quotaPro: "Illimité sur Pro",
    quotaExceeded:
      "Pas assez de posts restants. Il te reste {remaining} posts gratuits ce mois.",
  },
  language: {
    label: "Langue",
  },
};
```

Create `src/i18n/es.ts` with the same shape, Spanish translations:

```ts
import type { Dictionary } from "./en";

export const es: Dictionary = {
  common: {
    signIn: "Iniciar sesión",
    startFree: "Empezar gratis",
    upgrade: "Pasar a Pro",
    continue: "Continuar",
    back: "Atrás",
    cancel: "Cancelar",
    save: "Guardar",
    skip: "Saltar",
    loading: "Cargando…",
    optional: "opcional",
  },
  nav: {
    howItWorks: "Cómo funciona",
    whatsapp: "WhatsApp",
    pricing: "Precios",
    faq: "FAQ",
  },
  hero: {
    badge: "Ahora con notas de voz de WhatsApp",
    title: "Un ghostwriter de LinkedIn que suena exactamente como tú.",
    subtitle:
      "Envía una idea rápida o una nota de voz por WhatsApp. Recibe un post de LinkedIn listo para publicar en tu voz — no la típica papilla de IA.",
    ctaPrimary: "Empezar gratis — 5 posts/mes",
    ctaSecondary: "Ver la demo",
    noCard: "Sin tarjeta · registro en 60 segundos",
    inputPlaceholder: "Escribe una idea — p. ej. 'Lecciones de mi peor contratación'",
    generate: "Generar vista previa",
    copied: "Copiado",
    copy: "Copiar",
    generated: "Generado",
    genericProfile: "Esto usó un perfil de voz genérico.",
    trainYourDna: "Entrena tu propio Writing DNA →",
    networkError: "Error de red. Inténtalo de nuevo.",
    generationFailed: "Falló la generación",
  },
  pricing: {
    eyebrow: "Precios",
    title: "Empieza gratis. Actualiza cuando te enganches.",
    subtitle: "Precios simples y honestos. Cancela cuando quieras.",
    monthly: "Mensual",
    yearly: "Anual",
    save15: "Ahorra 15%",
    perMonth: "/mes",
    forever: "para siempre",
    billedYearly: "facturado €{total}/año · Ahorra 15%",
    free: {
      description: "Prueba NoPersonAI y publica algunos posts.",
      features: [
        "5 posts / mes",
        "Perfil Writing DNA",
        "Cadena de generación de IA de 5 pasos",
        "10+ refinamientos en un clic",
        "Historial de posts",
      ],
      cta: "Empezar gratis",
    },
    pro: {
      description: "Para fundadores y operadores que publican semanalmente.",
      badge: "Más popular",
      features: [
        "Posts ilimitados",
        "Integración con WhatsApp (texto + voz)",
        "Grabación de voz en el navegador",
        "Generación prioritaria",
        "Soporte prioritario",
        "Todo lo de Free",
      ],
      cta: "Pasar a Pro",
    },
  },
  onboarding: {
    headingBasics: "Empecemos",
    subBasics: "Cuéntanos un poco sobre ti",
    name: "Tu nombre",
    language: "Idioma preferido",
    audience: "¿Quién es tu audiencia objetivo?",
    audienceHint: "p. ej. \"fundadores de startup\", \"directores de RR.HH.\", \"tech leads\"",
    audiencePlaceholder: "fundadores, emprendedores, dueños de negocios",
    modeHeading: "Tu estilo",
    modeSub: "Ayúdanos a entender cómo escribes",
    modePaste: "Tengo posts de LinkedIn",
    modePasteSub: "Pega 1-5 posts para que aprendamos tu voz",
    modeDiscover: "Soy nuevo en LinkedIn",
    modeDiscoverSub: "Te ayudaremos a encontrar tu estilo",
    modeSkip: "Saltar — entreno mi DNA más tarde",
    modeSkipSub: "Empezamos con valores predeterminados sensatos",
    dnaHeading: "Tu Writing DNA",
    dnaSummary: "Tu voz, resumida",
    dnaAdjust: "¿No está del todo bien? Dinos qué ajustar:",
    dnaRegenerate: "Regenerar con ajustes",
    dnaDone: "Se ve bien — ¡vamos!",
    analyzing: "Analizando tu estilo de escritura...",
  },
  appShell: {
    navCreate: "Crear",
    navWhatsApp: "WhatsApp",
    navHistory: "Historial",
    navDna: "DNA",
    navAccount: "Cuenta",
    navBulk: "Generación masiva",
  },
  generator: {
    title: "Crear un post",
    subtitle:
      "Suelta una idea. Nuestra IA la convertirá en un borrador listo para LinkedIn en tu voz.",
    limitReachedTitle: "Has usado tus 5 posts gratis de este mes",
    limitReachedBody:
      "Actualiza a Pro para posts ilimitados e integración con WhatsApp.",
  },
  bulk: {
    title: "Generación masiva",
    subtitle: "Un tema → varios posts, cada uno con un ángulo diferente.",
    topicLabel: "Tu tema o idea",
    countLabel: "Cuántos posts",
    cta: "Generar {n} posts",
    quotaFree: "Usa {n} de {remaining} posts gratis este mes",
    quotaPro: "Ilimitado en Pro",
    quotaExceeded:
      "No quedan suficientes posts. Te quedan {remaining} posts gratis este mes.",
  },
  language: {
    label: "Idioma",
  },
};
```

- [ ] **Step 6.7: Create `src/i18n/index.ts`**

```ts
import { en } from "./en";
import { de } from "./de";
import { fr } from "./fr";
import { es } from "./es";
import type { Locale } from "./config";
import type { Dictionary } from "./en";

const DICTIONARIES: Record<Locale, Dictionary> = { en, de, fr, es };

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export type { Locale, Dictionary };
```

- [ ] **Step 6.8: Create `src/i18n/provider.tsx`**

```tsx
"use client";

import { createContext, useMemo, type ReactNode } from "react";
import type { Dictionary } from "./en";
import type { Locale } from "./config";

interface I18nContextValue {
  locale: Locale;
  dict: Dictionary;
}

export const I18nContext = createContext<I18nContextValue | null>(null);

interface I18nProviderProps {
  locale: Locale;
  dict: Dictionary;
  children: ReactNode;
}

export function I18nProvider({ locale, dict, children }: I18nProviderProps) {
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
```

- [ ] **Step 6.9: Create `src/i18n/use-i18n.ts`**

```ts
"use client";

import { useContext } from "react";
import { I18nContext } from "./provider";
import type { Dictionary } from "./en";
import type { Locale } from "./config";

type DotPath<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}.${DotPath<T[K]>}`
          : K
        : never;
    }[keyof T]
  : never;

type Leaf<T, P extends string> = P extends `${infer K}.${infer R}`
  ? K extends keyof T
    ? Leaf<T[K], R>
    : never
  : P extends keyof T
    ? T[P]
    : never;

function lookup(dict: Dictionary, path: string): string | string[] {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in (cur as Record<string, unknown>)) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return cur as string | string[];
}

function format(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    k in vars ? String(vars[k]) : `{${k}}`,
  );
}

export interface UseI18n {
  locale: Locale;
  t: (
    path: DotPath<Dictionary>,
    vars?: Record<string, string | number>,
  ) => string;
  tArray: (path: DotPath<Dictionary>) => string[];
  setLocale: (next: Locale) => Promise<void>;
}

export function useI18n(): UseI18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within <I18nProvider>");

  return {
    locale: ctx.locale,
    t: (path, vars) => {
      const raw = lookup(ctx.dict, path as string);
      if (typeof raw !== "string") return String(raw);
      return vars ? format(raw, vars) : raw;
    },
    tArray: (path) => {
      const raw = lookup(ctx.dict, path as string);
      return Array.isArray(raw) ? raw : [];
    },
    setLocale: async (next) => {
      document.cookie = `NEXT_LOCALE=${next}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      try {
        await fetch("/api/i18n", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: next }),
        });
      } catch {
        // Cookie alone is sufficient for unauthenticated users.
      }
      location.reload();
    },
  };
}

export type { DotPath };
```

- [ ] **Step 6.10: Create `src/i18n/server.ts`**

```ts
import { cookies, headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { resolveLocaleFromInputs } from "./resolve-locale";
import type { Locale } from "./config";

export async function resolveLocale(): Promise<Locale> {
  const [cookieStore, hdrs, session] = await Promise.all([
    cookies(),
    headers(),
    getServerSession(authOptions),
  ]);

  let userPreferred: string | null = null;
  if (session?.user?.id) {
    const dna = await prisma.writingDNA.findUnique({
      where: { userId: session.user.id },
      select: { preferredLanguage: true },
    });
    userPreferred = dna?.preferredLanguage ?? null;
  }

  return resolveLocaleFromInputs({
    userPreferred,
    cookie: cookieStore.get("NEXT_LOCALE")?.value ?? null,
    acceptLanguage: hdrs.get("accept-language"),
  });
}
```

- [ ] **Step 6.11: Create the `/api/i18n` route**

Create `src/app/api/i18n/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { isLocale } from "@/i18n/config";

export async function POST(req: NextRequest) {
  const { locale } = await req.json();
  if (!isLocale(locale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const user = await getAuthUser();
  if (user) {
    // Upsert preferred language in WritingDNA if present.
    await prisma.writingDNA.updateMany({
      where: { userId: user.id },
      data: { preferredLanguage: locale },
    });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return res;
}
```

- [ ] **Step 6.12: Create `src/components/LanguageSwitcher.tsx`**

```tsx
"use client";

import { useState } from "react";
import { Globe, Check } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import { LOCALE_LABELS, SUPPORTED_LOCALES, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export default function LanguageSwitcher({
  className,
}: {
  className?: string;
}) {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase">{locale}</span>
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-hidden="true"
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute right-0 z-40 mt-1 w-40 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg"
          >
            {SUPPORTED_LOCALES.map((l) => (
              <button
                key={l}
                role="menuitemradio"
                aria-checked={l === locale}
                onClick={() => {
                  setOpen(false);
                  if (l !== locale) setLocale(l as Locale);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-50"
              >
                <span>{LOCALE_LABELS[l as Locale]}</span>
                {l === locale && <Check className="h-3.5 w-3.5 text-brand-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 6.13: Extend `Language` enum in Prisma schema**

Open `prisma/schema.prisma`. Change the `Language` enum from:

```prisma
enum Language {
  de
  en
}
```

to:

```prisma
enum Language {
  de
  en
  fr
  es
}
```

- [ ] **Step 6.14: Create the migration**

```bash
npx prisma migrate dev --name language_enum_fr_es
```

Verify the generated SQL contains:

```sql
ALTER TYPE "Language" ADD VALUE 'fr';
ALTER TYPE "Language" ADD VALUE 'es';
```

If the migration tool produces two separate statements that cannot run in a single transaction, Prisma handles this automatically with its own detection. If it fails with "cannot run inside a transaction block", edit the generated `migration.sql` to split each `ADD VALUE` into its own statement.

- [ ] **Step 6.15: Update `src/app/layout.tsx` to resolve locale server-side**

Modify `src/app/layout.tsx`. Import the resolver and load the dictionary. Replace the existing `RootLayout` body:

```tsx
import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { resolveLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nopersonai.com"),
  title: {
    default: "NoPersonAI — A LinkedIn ghostwriter that sounds exactly like you",
    template: "%s | NoPersonAI",
  },
  description:
    "Generate authentic LinkedIn posts in your voice. Send a text or voice note via WhatsApp, get a ready-to-post LinkedIn post back. Free to start.",
  keywords: [
    "LinkedIn post generator",
    "AI ghostwriter",
    "LinkedIn ghostwriter",
    "WhatsApp to LinkedIn",
    "voice to LinkedIn post",
    "LinkedIn AI tool",
    "personal branding AI",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "de_DE",
    siteName: "NoPersonAI",
    title: "NoPersonAI — A LinkedIn ghostwriter that sounds exactly like you",
    description:
      "Voice notes via WhatsApp turn into LinkedIn posts that sound like you wrote them. Your voice, amplified.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoPersonAI — A LinkedIn ghostwriter that sounds exactly like you",
    description:
      "Voice notes via WhatsApp turn into LinkedIn posts that sound like you wrote them.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = await resolveLocale();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers locale={locale} dict={dict}>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 6.16: Update `src/components/Providers.tsx` to wrap I18nProvider**

Read the current content first:
```bash
cat src/components/Providers.tsx
```

Modify it to accept `locale` and `dict` props and wrap children with `<I18nProvider>`. Example (adjust to match existing session provider wiring):

```tsx
"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/i18n/provider";
import { ToastProvider } from "@/components/ui/Toast";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";

export default function Providers({
  children,
  locale,
  dict,
}: {
  children: ReactNode;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <SessionProvider>
      <I18nProvider locale={locale} dict={dict}>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
```

- [ ] **Step 6.17: Add `LanguageSwitcher` to `Header.tsx` and `SideNav`**

In `src/components/landing/Header.tsx`, import `LanguageSwitcher` and place it immediately before `Sign in` in the desktop right-side div, and at the top of the mobile menu.

Desktop — update:
```tsx
<div className="hidden items-center gap-2 md:flex">
  <LanguageSwitcher />
  <Link
    href="/auth/signin"
    className="inline-flex h-9 items-center rounded-lg px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
  >
    Sign in
  </Link>
  <Link href="/auth/signin">
    <Button size="sm" className="h-9">
      Start free
    </Button>
  </Link>
</div>
```

Add import:
```tsx
import LanguageSwitcher from "@/components/LanguageSwitcher";
```

Mobile menu — add `<LanguageSwitcher />` above the nav links list.

In `src/components/app/BottomNav.tsx`, add `LanguageSwitcher` to the `SideNav` just above the `<nav>` in the sidebar (underneath the logo header block). This exposes the switcher inside the authenticated app shell.

- [ ] **Step 6.18: Type-check & run all tests**

```bash
npx tsc --noEmit
npm run test:run
```

Expected: no TypeScript errors, all tests pass.

- [ ] **Step 6.19: Manual verification**

```bash
npm run dev
```

- Click the globe switcher in the landing header → menu opens with English / Deutsch / Français / Español.
- Pick `Deutsch` → page reloads, nav text stays English for now (strings not yet replaced in Phase 7), but `document.cookie` has `NEXT_LOCALE=de`.
- Switcher label now shows `DE`.
- Sign in → the `preferredLanguage` column in the DB updates on next language change.

- [ ] **Step 6.20: Commit**

```bash
git add src/i18n/ src/components/LanguageSwitcher.tsx src/components/Providers.tsx src/app/layout.tsx src/app/api/i18n/ src/components/landing/Header.tsx src/components/app/BottomNav.tsx prisma/schema.prisma prisma/migrations/ __tests__/i18n/
git commit -m "feat(i18n): dictionary-based locale provider + language switcher + DB enum"
```

---

## Phase 7 — i18n rollout (landing, onboarding, app shell)

### Task 7: Replace hard-coded English strings with `t()` calls

**Files (touch each; replace every hard-coded user-facing string with `t("...")` using the keys from `src/i18n/en.ts`):**
- Modify: `src/components/landing/Header.tsx`
- Modify: `src/components/landing/Hero.tsx`
- Modify: `src/components/landing/PricingSection.tsx`
- Modify: `src/components/landing/Footer.tsx`
- Modify: `src/components/landing/FAQ.tsx`
- Modify: `src/components/landing/FinalCTA.tsx`
- Modify: `src/components/landing/HowItWorks.tsx`
- Modify: `src/components/landing/WhatsAppSection.tsx`
- Modify: `src/components/landing/PostPreviewSection.tsx`
- Modify: `src/components/landing/WritingDNASection.tsx`
- Modify: `src/components/landing/PainPoints.tsx`
- Modify: `src/components/onboarding/StepBasics.tsx`
- Modify: `src/components/onboarding/StepTone.tsx`
- Modify: `src/components/onboarding/StepStyle.tsx`
- Modify: `src/components/onboarding/StepDNAResult.tsx`
- Modify: `src/app/onboarding/onboarding-client.tsx`
- Modify: `src/components/app/BottomNav.tsx`
- Modify: `src/app/app/page.tsx` (if any hard-coded strings)
- Modify: `src/app/app/generator-client.tsx`
- Modify: `src/app/auth/signin/signin-form.tsx`
- Modify: `src/app/auth/verify-request/` and `src/app/auth/error/`
- Modify: `src/lib/ai/prompts.ts` (support fr/es in `buildGeneratePostPrompt` + `buildRefinementPrompt`)

**The translate-key pattern per client component:**

```tsx
"use client";
import { useI18n } from "@/i18n/use-i18n";

export default function SomeComponent() {
  const { t } = useI18n();
  return <h1>{t("hero.title")}</h1>;
}
```

**For server components** (e.g. `src/app/pricing/page.tsx`, `src/app/app/page.tsx`), import the dictionary server-side:

```tsx
import { resolveLocale } from "@/i18n/server";
import { getDictionary } from "@/i18n";

export default async function Page() {
  const locale = await resolveLocale();
  const dict = getDictionary(locale);
  return <h1>{dict.pricing.title}</h1>;
}
```

- [ ] **Step 7.1: Translate `Header.tsx`**

Replace `navItems` with computed values using `t()`:

```tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/use-i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function Header() {
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { label: t("nav.howItWorks"), href: "#how-it-works" },
    { label: t("nav.whatsapp"), href: "#whatsapp" },
    { label: t("nav.pricing"), href: "/pricing" },
    { label: t("nav.faq"), href: "#faq" },
  ];

  // (rest of component: same as Step 1.2, replacing "Sign in" with {t("common.signIn")}
  // and "Start free" with {t("common.startFree")}, including smooth-scroll handler)
  // ...
}
```

- [ ] **Step 7.2: Translate `Hero.tsx`**

Replace every hard-coded user-visible string with its `t("hero.…")` key. Keep the logic (state, fetch) untouched. Toast titles in error paths also use `t()`.

- [ ] **Step 7.3: Translate `PricingSection.tsx`**

Replace the tiers array with one built inline at render time:

```tsx
const { t, tArray } = useI18n();

const tiers = [
  {
    name: "Free",
    priceBig: "€0",
    priceSmall: t("pricing.forever"),
    priceSub: null,
    description: t("pricing.free.description"),
    features: tArray("pricing.free.features"),
    cta: t("pricing.free.cta"),
    featured: false,
    badge: null,
  },
  {
    name: "Pro",
    priceBig: proPrice.big,
    priceSmall: t("pricing.perMonth"),
    priceSub: period === "yearly"
      ? t("pricing.billedYearly", { total: YEARLY_TOTAL })
      : null,
    description: t("pricing.pro.description"),
    features: tArray("pricing.pro.features"),
    cta: t("pricing.pro.cta"),
    featured: true,
    badge: t("pricing.pro.badge"),
  },
];
```

Also swap the toggle's discount label to `t("pricing.save15")`, plus the headings (title/subtitle/eyebrow).

- [ ] **Step 7.4: Translate remaining landing sections**

For each of `Footer`, `FAQ`, `FinalCTA`, `HowItWorks`, `WhatsAppSection`, `PostPreviewSection`, `WritingDNASection`, `PainPoints`:

1. Open the component.
2. Identify each hard-coded string.
3. Add a key in `src/i18n/en.ts` (e.g. `footer.copyright`, `faq.q1`, etc.). Add the matching translations in `de.ts`/`fr.ts`/`es.ts`.
4. Replace the string with `t("…")`.

Commit after each file to keep the tree buildable (`npm run build` should pass at any point).

- [ ] **Step 7.5: Translate onboarding**

Repeat the same pattern across `StepBasics.tsx`, `StepTone.tsx`, `StepStyle.tsx`, `StepDNAResult.tsx`, and `onboarding-client.tsx`. Use the existing `onboarding.*` keys and add more as needed.

Also update `StepBasics.tsx` to use `SUPPORTED_LOCALES` when rendering the language buttons, so all 4 locales appear (not only `en`/`de`). The language state type in `onboarding-client.tsx` changes from `"de" | "en"` to `Locale`.

- [ ] **Step 7.6: Translate app shell + generator**

In `BottomNav.tsx`: compute `tabs` inside the component (it's already `"use client"`) and wrap each `label` in `t("appShell.…")`. Add an entry for Bulk (added in Phase 9).

In `generator-client.tsx`: wrap heading, subtitle, limit-reached messages, toasts.

In `signin-form.tsx`: wrap headings, CTA, placeholder. Keep error codes as-is (they're internal) but translate the user-facing message.

- [ ] **Step 7.7: Support FR/ES in AI prompts**

In `src/lib/ai/prompts.ts`, update `buildGeneratePostPrompt`:

Change:
```ts
- Language: Write in ${language === "de" ? "German (Deutsch)" : "English"}
```
to:
```ts
- Language: Write in ${languageLabel(language)}
```

And add at the top of the file:
```ts
function languageLabel(code: string): string {
  switch (code) {
    case "de": return "German (Deutsch)";
    case "fr": return "French (Français)";
    case "es": return "Spanish (Español)";
    default: return "English";
  }
}
```

Apply the same change in `buildRefinementPrompt`. `buildDNAProfilePrompt` was already updated in Task 4b.2 to handle all four locales.

Update the `detectedLanguage` type in `src/lib/ai/types.ts`:

```ts
detectedLanguage: "de" | "en" | "fr" | "es";
```

And in `buildIntentAndStructurePrompt`, change the JSON shape hint:

```ts
"detectedLanguage": "de" | "en" | "fr" | "es"
```

- [ ] **Step 7.8: Run all tests + type-check**

```bash
npx tsc --noEmit
npm run test:run
```

Expected: all pass. Fix any type errors (likely in files that previously assumed `"de" | "en"`).

- [ ] **Step 7.9: Manual verification across locales**

```bash
npm run dev
```

- Landing → switch to Français → all visible text in French. Switch to Español → Spanish. Deutsch → German.
- Onboarding → same.
- Generator page (signed in) → headings in user's locale.
- Generate a post with locale = fr → the generated post is in French.

- [ ] **Step 7.10: Commit**

Commit iteratively as you go per Step 7.4 guidance. Final aggregated commit:

```bash
git add -A
git commit -m "feat(i18n): roll out EN/DE/FR/ES translations across landing, onboarding, app shell"
```

---

## Phase 8 — Admin system

### Task 8: Admin dashboard with `/admin` route

**Files:**
- Modify: `prisma/schema.prisma` (add `Role` enum and `User.role`)
- Create: `prisma/migrations/YYYYMMDDHHMMSS_user_role/migration.sql`
- Create: `src/lib/admin-guard.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `__tests__/lib/admin-guard.test.ts`

- [ ] **Step 8.1: Write the failing test**

Create `__tests__/lib/admin-guard.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isAdminRole } from "@/lib/admin-guard";

describe("admin-guard", () => {
  it("treats 'admin' role as admin", () => {
    expect(isAdminRole("admin")).toBe(true);
  });

  it("treats 'user' role as non-admin", () => {
    expect(isAdminRole("user")).toBe(false);
  });

  it("treats missing role as non-admin", () => {
    expect(isAdminRole(null)).toBe(false);
    expect(isAdminRole(undefined)).toBe(false);
  });
});
```

- [ ] **Step 8.2: Verify failure**

```bash
npm run test:run -- __tests__/lib/admin-guard.test.ts
```

Expected: FAIL.

- [ ] **Step 8.3: Add `Role` enum and `User.role` to schema**

Open `prisma/schema.prisma`. Under the `Language` enum, add:

```prisma
enum Role {
  user
  admin
}
```

In the `User` model, add a `role` field right after `plan`:

```prisma
  plan               Plan      @default(free)
  role               Role      @default(user)
```

- [ ] **Step 8.4: Generate + edit the migration**

```bash
npx prisma migrate dev --name user_role
```

Open the generated `prisma/migrations/<ts>_user_role/migration.sql` and append an admin seed for the owner email. Add at the end:

```sql
-- Promote the owner to admin if that account already exists.
UPDATE "User" SET "role" = 'admin' WHERE "email" = 'luisnburger@gmail.com';
```

Re-run the migration:

```bash
npx prisma migrate dev
```

- [ ] **Step 8.5: Create `src/lib/admin-guard.ts`**

```ts
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export function isAdminRole(role: string | null | undefined): boolean {
  return role === "admin";
}

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true },
  });
  if (!user || !isAdminRole(user.role)) notFound();

  return user;
}
```

- [ ] **Step 8.6: Run test — should pass**

```bash
npm run test:run -- __tests__/lib/admin-guard.test.ts
```

Expected: PASS.

- [ ] **Step 8.7: Create admin layout**

Create `src/app/admin/layout.tsx`:

```tsx
import Link from "next/link";
import { requireAdmin } from "@/lib/admin-guard";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <span className="font-display text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Admin
            </span>
            <span className="text-sm font-bold text-zinc-900">NoPersonAI</span>
          </div>
          <Link href="/app" className="text-sm text-zinc-600 hover:text-zinc-900">
            ← Back to app
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">{children}</main>
    </div>
  );
}
```

- [ ] **Step 8.8: Create admin dashboard page**

Create `src/app/admin/page.tsx`:

```tsx
import { prisma } from "@/lib/db";

const PRO_PRICE_EUR = 29;

export default async function AdminDashboard() {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalUsers, activeLast30d, payingUsers, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { updatedAt: { gt: thirtyDaysAgo } } }),
    prisma.user.count({ where: { plan: "pro" } }),
    prisma.user.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
      select: {
        id: true,
        email: true,
        plan: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const mrrEur = payingUsers * PRO_PRICE_EUR;
  const conversionPct =
    totalUsers === 0 ? 0 : +((payingUsers / totalUsers) * 100).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Live business KPIs.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <StatCard label="Total users" value={totalUsers.toLocaleString()} />
        <StatCard label="Active (30d)" value={activeLast30d.toLocaleString()} />
        <StatCard label="Paying users" value={payingUsers.toLocaleString()} />
        <StatCard
          label="MRR"
          value={`€${mrrEur.toLocaleString()}`}
          hint="Derived"
        />
        <StatCard
          label="Conversion"
          value={`${conversionPct}%`}
          hint="paying / total"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white">
        <div className="border-b border-zinc-100 px-5 py-3">
          <h2 className="font-display text-sm font-semibold text-zinc-900">
            Recent users
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-zinc-50 text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-5 py-2.5">Email</th>
                <th className="px-5 py-2.5">Plan</th>
                <th className="px-5 py-2.5">Role</th>
                <th className="px-5 py-2.5">Joined</th>
                <th className="px-5 py-2.5">Last seen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {recentUsers.map((u) => (
                <tr key={u.id} className="text-zinc-700">
                  <td className="px-5 py-2.5 font-medium text-zinc-900">{u.email}</td>
                  <td className="px-5 py-2.5 capitalize">{u.plan}</td>
                  <td className="px-5 py-2.5 capitalize">{u.role}</td>
                  <td className="px-5 py-2.5 text-zinc-500">
                    {u.createdAt.toISOString().slice(0, 10)}
                  </td>
                  <td className="px-5 py-2.5 text-zinc-500">
                    {u.updatedAt.toISOString().slice(0, 10)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </div>
      <div className="mt-1 font-display text-2xl font-bold text-zinc-900">
        {value}
      </div>
      {hint && <div className="mt-0.5 text-[10px] uppercase tracking-wide text-zinc-400">{hint}</div>}
    </div>
  );
}
```

- [ ] **Step 8.9: Manual verification**

```bash
npm run dev
```

- Sign in as `luisnburger@gmail.com` → visit `/admin` → see dashboard with live counts.
- Sign in as any other user → visit `/admin` → 404 page.
- Numbers match expected values (total users > 0, etc.).

- [ ] **Step 8.10: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/ src/lib/admin-guard.ts src/app/admin/ __tests__/lib/admin-guard.test.ts
git commit -m "feat(admin): /admin dashboard with live KPIs (derived MRR)"
```

---

## Phase 9 — Bulk post generation

### Task 9: Parallel multi-post generation

**Files:**
- Create: `src/app/api/generate/bulk/route.ts`
- Create: `src/app/app/bulk/page.tsx`
- Create: `src/app/app/bulk/bulk-client.tsx`
- Modify: `src/components/app/BottomNav.tsx` (add Bulk tab)
- Modify: `vercel.json` (add bulk route timeout)
- Create: `__tests__/api/bulk-math.test.ts`

- [ ] **Step 9.1: Write failing test for quota + angle logic**

Create `__tests__/api/bulk-math.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  pickAngles,
  clampCount,
  canAfford,
} from "@/lib/bulk";

describe("bulk-math", () => {
  it("picks N distinct angles when N ≤ 5", () => {
    const angles = pickAngles(3);
    expect(angles.length).toBe(3);
    expect(new Set(angles).size).toBe(3);
  });

  it("repeats angles when N > 5", () => {
    const angles = pickAngles(7);
    expect(angles.length).toBe(7);
    expect(new Set(angles).size).toBeLessThanOrEqual(5);
  });

  it("clamps count to allowed values", () => {
    expect(clampCount(0)).toBe(3);
    expect(clampCount(4)).toBe(3);
    expect(clampCount(5)).toBe(5);
    expect(clampCount(100)).toBe(10);
  });

  it("canAfford enforces the free quota", () => {
    expect(canAfford({ plan: "pro", used: 0, requested: 10, limit: 5 })).toBe(true);
    expect(canAfford({ plan: "free", used: 0, requested: 5, limit: 5 })).toBe(true);
    expect(canAfford({ plan: "free", used: 3, requested: 5, limit: 5 })).toBe(false);
    expect(canAfford({ plan: "free", used: 2, requested: 3, limit: 5 })).toBe(true);
  });
});
```

- [ ] **Step 9.2: Verify test fails**

```bash
npm run test:run -- __tests__/api/bulk-math.test.ts
```

Expected: FAIL.

- [ ] **Step 9.3: Create `src/lib/bulk.ts`**

```ts
export const ALLOWED_COUNTS = [3, 5, 7, 10] as const;
export type BulkCount = (typeof ALLOWED_COUNTS)[number];

const ANGLES = [
  "hook_story",
  "contrarian",
  "personal",
  "list",
  "lesson",
] as const;
export type Angle = (typeof ANGLES)[number];

export function pickAngles(n: number): Angle[] {
  const pool = [...ANGLES].sort(() => Math.random() - 0.5);
  const result: Angle[] = [];
  let i = 0;
  while (result.length < n) {
    result.push(pool[i % pool.length]);
    i++;
  }
  return result;
}

export function clampCount(raw: number): BulkCount {
  for (let i = ALLOWED_COUNTS.length - 1; i >= 0; i--) {
    if (raw >= ALLOWED_COUNTS[i]) return ALLOWED_COUNTS[i];
  }
  return ALLOWED_COUNTS[0];
}

export function canAfford(ctx: {
  plan: "free" | "pro";
  used: number;
  requested: number;
  limit: number;
}): boolean {
  if (ctx.plan === "pro") return true;
  return ctx.used + ctx.requested <= ctx.limit;
}
```

- [ ] **Step 9.4: Verify test passes**

```bash
npm run test:run -- __tests__/api/bulk-math.test.ts
```

Expected: PASS.

- [ ] **Step 9.5: Create the bulk API**

Create `src/app/api/generate/bulk/route.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { generatePost, buildChainContext } from "@/lib/ai/engine";
import { pickAngles, clampCount, canAfford } from "@/lib/bulk";
import type { WritingDNAInput } from "@/lib/ai/types";

const FREE_LIMIT = 5;

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { input, count: rawCount } = await req.json();

  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return NextResponse.json({ error: "Input is required" }, { status: 400 });
  }

  const count = clampCount(Number(rawCount) || 5);

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { writingDna: true },
  });
  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!dbUser.writingDna) {
    return NextResponse.json({ error: "Complete onboarding first" }, { status: 400 });
  }

  // Reset monthly counter if needed
  const now = new Date();
  const resetAt = new Date(dbUser.postsResetAt);
  if (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear()) {
    await prisma.user.update({
      where: { id: user.id },
      data: { postsUsedThisMonth: 0, postsResetAt: now },
    });
    dbUser.postsUsedThisMonth = 0;
  }

  if (
    !canAfford({
      plan: dbUser.plan,
      used: dbUser.postsUsedThisMonth,
      requested: count,
      limit: FREE_LIMIT,
    })
  ) {
    return NextResponse.json(
      {
        error: "quota_exceeded",
        remaining: Math.max(0, FREE_LIMIT - dbUser.postsUsedThisMonth),
      },
      { status: 403 },
    );
  }

  const dna: WritingDNAInput = {
    tone: dbUser.writingDna.tone,
    audience: dbUser.writingDna.audience,
    style: dbUser.writingDna.style,
    emojiUsage: dbUser.writingDna.emojiUsage,
    samplePosts: dbUser.writingDna.samplePosts,
    generatedProfile: dbUser.writingDna.generatedProfile,
    preferredLanguage: dbUser.writingDna.preferredLanguage,
  };

  const angles = pickAngles(count);

  const settled = await Promise.allSettled(
    angles.map((angle) =>
      generatePost(`[ANGLE: ${angle}]\n${input.trim()}`, dna),
    ),
  );

  const successes = settled
    .map((r, i) => ({ angle: angles[i], result: r }))
    .filter((x): x is { angle: typeof angles[number]; result: PromiseFulfilledResult<Awaited<ReturnType<typeof generatePost>>> } => x.result.status === "fulfilled");

  if (successes.length === 0) {
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }

  const persisted = await Promise.all(
    successes.map(async ({ result }) => {
      const chainContext = buildChainContext(result.value, dna);
      const post = await prisma.post.create({
        data: {
          userId: user.id,
          input: input.trim(),
          output: result.value.post,
          structure: result.value.structure.structure,
          language: result.value.intent.detectedLanguage,
          chainContext: chainContext as object,
        },
      });
      return {
        id: post.id,
        post: result.value.post,
        structure: result.value.structure.structure,
        language: result.value.intent.detectedLanguage,
      };
    }),
  );

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { postsUsedThisMonth: { increment: persisted.length } },
    select: { postsUsedThisMonth: true },
  });

  return NextResponse.json({
    posts: persisted,
    postsUsed: updated.postsUsedThisMonth,
    requested: count,
    delivered: persisted.length,
  });
}
```

- [ ] **Step 9.6: Create `/app/bulk` page (server component)**

Create `src/app/app/bulk/page.tsx`:

```tsx
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BulkClient from "./bulk-client";

export default async function BulkPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true, postsUsedThisMonth: true, postsResetAt: true },
  });
  if (!user) redirect("/auth/signin");

  const now = new Date();
  const resetAt = new Date(user.postsResetAt);
  const postsUsed =
    now.getMonth() === resetAt.getMonth() && now.getFullYear() === resetAt.getFullYear()
      ? user.postsUsedThisMonth
      : 0;

  return (
    <BulkClient
      plan={user.plan}
      initialPostsUsed={postsUsed}
      userName={session.user.name || "You"}
      userImage={session.user.image || null}
    />
  );
}
```

- [ ] **Step 9.7: Create `/app/bulk` client**

Create `src/app/app/bulk/bulk-client.tsx`:

```tsx
"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import LinkedInPreview from "@/components/generator/LinkedInPreview";
import { ALLOWED_COUNTS } from "@/lib/bulk";

interface BulkClientProps {
  plan: "free" | "pro";
  initialPostsUsed: number;
  userName: string;
  userImage: string | null;
}

interface GeneratedPost {
  id: string;
  post: string;
  structure: string;
  language: string;
}

const FREE_LIMIT = 5;

export default function BulkClient({
  plan,
  initialPostsUsed,
  userName,
  userImage,
}: BulkClientProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [count, setCount] = useState<(typeof ALLOWED_COUNTS)[number]>(5);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsUsed, setPostsUsed] = useState(initialPostsUsed);

  const isPro = plan === "pro";
  const remaining = isPro ? Infinity : Math.max(0, FREE_LIMIT - postsUsed);
  const canSubmit =
    !loading && input.trim().length > 0 && (isPro || count <= remaining);

  async function generate() {
    if (!canSubmit) return;
    setLoading(true);
    setPosts([]);
    try {
      const res = await fetch("/api/generate/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, count }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "quota_exceeded") {
        toast({
          title: t("bulk.quotaExceeded", { remaining: data.remaining }),
          variant: "error",
        });
        return;
      }
      if (!res.ok) {
        toast({ title: data.error || "Generation failed", variant: "error" });
        return;
      }
      setPosts(data.posts);
      setPostsUsed(data.postsUsed);
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          {t("bulk.title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("bulk.subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
        <label className="mb-1.5 block text-xs font-medium text-zinc-700">
          {t("bulk.topicLabel")}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          placeholder=""
        />

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">
            {t("bulk.countLabel")}
          </label>
          <div className="flex gap-2">
            {ALLOWED_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={
                  count === n
                    ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
                    : "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          {isPro
            ? t("bulk.quotaPro")
            : t("bulk.quotaFree", { n: count, remaining })}
        </div>

        <div className="mt-4">
          <Button
            size="lg"
            fullWidth
            loading={loading}
            disabled={!canSubmit}
            onClick={generate}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            {t("bulk.cta", { n: count })}
          </Button>
        </div>
      </div>

      {posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((p) => (
            <LinkedInPreview
              key={p.id}
              post={p.post}
              userName={userName}
              userImage={userImage}
              isEditing={false}
              onEditToggle={() => {}}
              onPostChange={() => {}}
              onCopy={() => {
                navigator.clipboard.writeText(p.post);
                toast({ title: "Copied", variant: "success" });
              }}
              onSave={() => {}}
              onRegenerate={() => {}}
              copied={false}
              isFavorite={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

Note: this reuses the existing `LinkedInPreview` component. Refine the per-card actions (Save, Regenerate-this-one) incrementally — initial pass only needs Copy.

- [ ] **Step 9.8: Add Bulk tab to `BottomNav.tsx` + `SideNav`**

In `src/components/app/BottomNav.tsx`, extend the `tabs` array:

```tsx
import { PenSquare, Clock, Dna, User, MessageCircle, Layers } from "lucide-react";

const tabs = [
  { label: t("appShell.navCreate"), href: "/app", icon: PenSquare, match: (p: string) => p === "/app" },
  { label: t("appShell.navBulk"), href: "/app/bulk", icon: Layers, match: (p: string) => p.startsWith("/app/bulk") },
  { label: t("appShell.navWhatsApp"), href: "/app/whatsapp", icon: MessageCircle, match: (p: string) => p.startsWith("/app/whatsapp") },
  { label: t("appShell.navHistory"), href: "/app/history", icon: Clock, match: (p: string) => p.startsWith("/app/history") },
  { label: t("appShell.navDna"), href: "/app/dna", icon: Dna, match: (p: string) => p.startsWith("/app/dna") },
  { label: t("appShell.navAccount"), href: "/app/account", icon: User, match: (p: string) => p.startsWith("/app/account") },
];
```

Compute `tabs` inside each component (both `BottomNav` and `SideNav`) so `t()` can be called. The mobile bar gets crowded with 6 tabs — on phones consider hiding less-used tabs behind an overflow, but for this pass simply compress spacing. The `SideNav` has room for all 6.

- [ ] **Step 9.9: Bump function timeout in `vercel.json`**

Open `vercel.json` and add:

```json
"src/app/api/generate/bulk/route.ts": { "maxDuration": 120 }
```

So the file reads:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "functions": {
    "src/app/api/whatsapp/webhook/route.ts": { "maxDuration": 60 },
    "src/app/api/transcribe/route.ts": { "maxDuration": 60 },
    "src/app/api/generate/route.ts": { "maxDuration": 60 },
    "src/app/api/generate/bulk/route.ts": { "maxDuration": 120 },
    "src/app/api/refine/route.ts": { "maxDuration": 60 },
    "src/app/api/demo/route.ts": { "maxDuration": 60 }
  }
}
```

- [ ] **Step 9.10: Manual verification**

```bash
npm run dev
```

- Navigate to `/app/bulk` in the app shell.
- As a free user with 0 posts used, choose count=3, topic "lessons from my first hire" → Generate → 3 posts render in sequence with different structures.
- Choose count=10 while you still have only 2 free posts → Generate button is disabled; pre-submit text shows "Uses 10 of 2 free posts…".
- As a Pro user, request 10 → all 10 render.

- [ ] **Step 9.11: Commit**

```bash
git add src/app/api/generate/bulk/ src/app/app/bulk/ src/components/app/BottomNav.tsx src/lib/bulk.ts vercel.json __tests__/api/bulk-math.test.ts
git commit -m "feat(bulk): /app/bulk route with parallel multi-angle generation"
```

---

## Phase 10 — LinkedIn API feasibility research

### Task 10: Write the research document (no code)

**Files:**
- Create: `docs/research/2026-04-18-linkedin-api-feasibility.md`

- [ ] **Step 10.1: Research current LinkedIn developer product surface**

Use web search to confirm the current status of:
- LinkedIn's OAuth 2.0 + OpenID Connect flow, scopes list
- Marketing Developer Platform (MDP) application process
- Community Management API status (private alpha as of late 2025)
- Messaging API access (partner-only)
- The `w_member_social` scope for posting on behalf of users
- LinkedIn API rate limits and throttling
- Any recent (2026) changes or deprecations

- [ ] **Step 10.2: Write the research doc**

Create `docs/research/2026-04-18-linkedin-api-feasibility.md` with sections:

1. **Executive summary** — 3 sentences: what's feasible today for NoPersonAI, what's not.
2. **OAuth basics** — flow, typical scopes (`openid`, `profile`, `email`, `w_member_social`), app approval steps.
3. **Posting on user's behalf** — `w_member_social` scope, `/ugcPosts` or `/posts` API, what user sees on LinkedIn (app name, permissions).
4. **Reading post analytics (impressions, reactions, clicks)** — gated behind MDP partner program. Application requirements, realistic timeline.
5. **Reading profile KPIs (follower count, profile views)** — same MDP gate.
6. **Messaging API (DMs)** — partner-only, generally unavailable for indie SaaS.
7. **Community Management API (comments, engagement actions)** — private alpha, invite-only.
8. **Terms of service considerations** — LinkedIn's stance on automation and third-party reading/writing.
9. **Rate limits & production reliability** — what to expect.
10. **Feasibility matrix** — table: feature × feasible today × notes.
11. **Recommended path for NoPersonAI** — start with `w_member_social` posting (trivial); hold off on analytics/DM/comments until partner scale is realistic.

Include links to LinkedIn developer docs at the end (verified URLs only — don't invent them).

- [ ] **Step 10.3: Commit**

```bash
git add docs/research/2026-04-18-linkedin-api-feasibility.md
git commit -m "docs: LinkedIn API feasibility research for NoPersonAI"
```

---

## Final validation

- [ ] **Step F.1: Full build + type check**

```bash
npm run build
```

Expected: clean build. Fix any issues.

- [ ] **Step F.2: Full test run**

```bash
npm run test:run
```

Expected: all tests pass.

- [ ] **Step F.3: Manual end-to-end smoke test**

1. Sign out. Sign in as returning user → lands on `/app` (no onboarding).
2. Landing page in EN → DE → FR → ES — all visible strings translated.
3. `/pricing` → Yearly toggle shows `€24.67/month · billed €296/yr · Save 15%` (localized label).
4. Generate a single post in FR → result is in French.
5. `/app/bulk` → generate 3 posts → 3 distinct structures render.
6. `/admin` as owner → dashboard renders; as non-owner → 404.
7. Click header "How it works" on landing → smoothly scrolls to the section below the sticky header.

- [ ] **Step F.4: Final commit + push**

```bash
git status
# Should be clean.
git push origin refinement-pass
```

Open a PR.

---

## Spec self-review

This plan was reviewed against `docs/superpowers/specs/2026-04-18-noperson-refinement-pass-design.md`:

- **Navbar & branding** — Task 1 covers logo sizing, container width, CTA balance, and language-switcher placeholder.
- **Auth/DNA bug** — Task 2 covers both the signin default change and the onboarding server guard, with a unit test.
- **Smooth scroll** — Header smooth-scroll handler is in Task 1 Step 1.2; section `scroll-mt-20` + `id` attributes in Task 3.
- **Pricing toggle** — Task 5 covers math (tested), component, persistence, full section rewrite.
- **Language switcher** — Task 6 covers full infra; Task 7 covers the rollout across landing, onboarding, app shell, and AI prompts.
- **DNA optional** — Task 4a removes all gating and adds an explicit skip path.
- **Admin** — Task 8 covers schema change, migration with admin seed, guard (tested), layout, and dashboard with all 5 required KPIs.
- **DNA summary** — Task 4b covers prompt rewrite, token limit drop, and subtitle copy.
- **Bulk generation** — Task 9 covers quota math (tested), angle distribution (tested), API, page, nav, and timeout bump.
- **LinkedIn research** — Task 10 covers the deliverable.

No placeholders, no "similar to above" references. All type names (`Locale`, `Dictionary`, `BulkCount`, `Angle`, `BillingPeriod`) are defined in the task that introduces them and consistent across later tasks.
