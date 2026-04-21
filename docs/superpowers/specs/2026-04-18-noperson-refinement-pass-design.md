# NoPersonAI Refinement Pass — Design Spec

**Date:** 2026-04-18
**Status:** Approved (design) — pending implementation plan
**Author:** Claude (Opus 4.7) with Luis
**Scope:** 10 precise, high-quality refinements to a live SaaS. No rebuilds.

---

## 0. Guiding principles

- Refine, don't rebuild. Keep everything that works.
- Every change must feel intentional, minimal, high-impact.
- No new external services. No schema-wide rewrites. Migrations are additive.
- Honor the existing stack: Next.js 16 App Router, React 19, Prisma 7, NextAuth 4, Tailwind 4, Anthropic + OpenAI. No new heavy deps.

---

## 1. Navbar & branding

### Problem
Logo too small; too much horizontal empty space on desktop; `Sign in` link and `Start free` button feel unbalanced in height/weight.

### Observations
- `src/components/landing/Header.tsx`: container `max-w-6xl`, height `h-16`, nav `gap-8`, right CTAs are a plain link + a `size="sm"` button (different heights).
- `src/components/brand/Logo.tsx`: `LogoMark` default `size={28}`, wordmark `text-base`.
- Competitors (MagicPost, Taplio) use a wider container and visually matched right-side controls.

### Design

| Element | Current | New |
|---|---|---|
| Container | `max-w-6xl` (1152px) | `max-w-7xl` (1280px) |
| Header height | `h-16` desktop / `h-16` mobile | `h-16` desktop / `h-14` mobile |
| Logo mark | 28px | **36px desktop, 32px mobile** (via responsive prop) |
| Wordmark | `text-base font-bold` | `text-lg font-bold tracking-tight` |
| Nav links | 4 links, `gap-8` | 4 links, `gap-7`, slightly denser |
| `Sign in` | plain link | ghost button, `h-9 px-4`, same height as primary |
| `Start free` | `size="sm"` button | `h-9`, primary — matches Sign in height |
| `LanguageSwitcher` | — | compact (globe + 2-letter code), immediately before Sign in |

### Mobile
Same container + padding logic. Hamburger opens a sheet that includes the language switcher, then Sign in, then Start free (full-width buttons stacked).

### Acceptance
- On a 1440px viewport, the header's contained content occupies 1280px with balanced gutters.
- `Sign in` + `Start free` have identical height; visual weight feels like a single control group.
- Logo is the dominant element in the left third without feeling oversized.

---

## 2. Account / DNA bug

### Root cause
`src/app/auth/signin/signin-form.tsx:32`
```ts
const target = callbackUrl || "/onboarding";
```
Every sign-in without an explicit callback URL lands on `/onboarding`. The `/onboarding/page.tsx` has no server-side guard, so returning users with an existing `WritingDNA` see the form and assume they must redo it.

Additional defect: `/onboarding/page.tsx` is a `"use client"` file with no session/DNA check — direct navigation (bookmarks, magic links, back button) exposes the same bug.

### Fix
1. Change default target in `signin-form.tsx`:
   ```ts
   const target = callbackUrl || "/app";
   ```
   `/app/layout.tsx` already redirects to `/onboarding` only when `WritingDNA` is missing. That logic is correct and stays.

2. Add a **server-component guard** for `/onboarding`. Convert `page.tsx` to a wrapper that checks session + existing DNA server-side:
   - If no session → `redirect("/auth/signin")`.
   - If DNA exists → `redirect("/app")`.
   - Otherwise render the existing client form, extracted to `onboarding-client.tsx`.

### Acceptance
- Returning user with completed DNA signing in (Google or magic link) lands on `/app` without any onboarding screen.
- Typing `/onboarding` in the URL as a completed user redirects to `/app`.
- First-time user still flows into onboarding normally.

---

## 3. Smooth scroll UX

### Current state
- Root `<html>` has `data-scroll-behavior="smooth"` (Next.js 16 hint).
- `PricingSection` has `scroll-mt-20`. Other landing sections don't.
- Nav clicks are plain anchor navigations — CSS smooth works but there's no `prefers-reduced-motion` handling and jump offset is inconsistent.

### Design
1. Add `scroll-mt-20` to every landing section: `Hero`, `PainPoints`, `HowItWorks`, `WhatsAppSection`, `PostPreviewSection`, `WritingDNASection`, `PricingSection`, `FAQ`, `FinalCTA`. All get matching `id` attributes where missing.
2. Small helper in `Header.tsx`: intercept in-page hash clicks and call `scrollIntoView({ behavior, block: "start" })` where `behavior = prefers-reduced-motion ? "auto" : "smooth"`.
3. External links (e.g. `/pricing`) stay as normal `Link` navigations — no change.

### Acceptance
- Clicking any header nav link smoothly scrolls with the target's top clear of the sticky header.
- Users with OS "reduce motion" enabled get instant jumps.
- Mobile and desktop behave identically.

---

## 4. Pricing toggle (monthly / yearly)

### Design
- New `PricingToggle.tsx` component: segmented control `Monthly | Yearly` with a `Save 15%` chip to the right of `Yearly` (visible on both states to preserve the frame).
- Pricing math: `€29/mo × 12 × 0.85 = €295.80 → €296/yr`. Display as **`€24.65/mo`** (primary price) with subcopy **`billed €296/yr · Save 15%`** when Yearly is active.
- Toggle state lives in `PricingSection.tsx` via `useState`. Persist chosen period in `localStorage` (`np:pricing-period`) so the user's choice sticks across visits.
- Free tier is unaffected — it shows `€0` in both states; the toggle renders on the Pro card only in effect.

### Copy
- Monthly state: `€29` · `/month`
- Yearly state: `€24.65` · `/month` · `billed €296/yr · Save 15%`
- CTA text unchanged (`Upgrade to Pro`). Future Stripe wiring reads the period from localStorage or a hidden input.

### Acceptance
- Toggle updates prices instantly, no layout shift.
- `localStorage` preference restored on return.
- Mobile toggle is thumb-friendly (min tap target 44px).

---

## 5. Language switcher (EN / DE / FR / ES)

### Architecture — lightweight dictionary

```
src/i18n/
  config.ts          // SUPPORTED_LOCALES, DEFAULT_LOCALE, Locale type
  en.ts de.ts fr.ts es.ts  // typed dictionaries (same shape, enforced by type)
  index.ts           // getDictionary(locale) — simple synchronous lookup
  provider.tsx       // <I18nProvider locale dict> client wrapper
  use-i18n.ts        // client hook: returns { locale, t, setLocale }
  server.ts          // resolveLocale() — reads cookie → Accept-Language → default
```

### Detection + persistence order
1. Authenticated user: `WritingDNA.preferredLanguage` (DB).
2. Cookie `NEXT_LOCALE`.
3. `Accept-Language` header (first match in `SUPPORTED_LOCALES`).
4. Default: `en`.

### Switcher UX
- `<LanguageSwitcher />` component: globe icon + 2-letter code button; click opens a small menu with `English | Deutsch | Français | Español`.
- On change:
  - Unsigned user: set cookie + `router.refresh()`.
  - Signed-in user: `PATCH /api/dna { preferredLanguage }` + cookie + refresh.
- Rendered in `Header.tsx` (landing) and `BottomNav.tsx`/`SideNav` (app shell).

### DB migration
- Extend `Language` enum in `prisma/schema.prisma` from `de | en` to `de | en | fr | es`. Additive.
- No row-level data migration needed (existing values remain valid).

### Translation scope
- **Translate:** landing page (all `src/components/landing/*`), onboarding (`src/app/onboarding/*`, `src/components/onboarding/*`), app shell (`BottomNav`/`SideNav` labels, `/app` page headers, toasts), auth pages, pricing page.
- **Leave English:** admin (`/admin/*`), API error messages, legal pages (terms/privacy), `/app/whatsapp` connection flow copy (ops-heavy).

### AI output
- Existing `src/lib/ai/prompts.ts` reads `language` already. Extend the prompt builder to accept all four locales and instruct Claude to write in that language.
- `generateDNAProfile` and the chain both honor the user's preferred language.

### Acceptance
- Visitor on `/` sees detected locale automatically; switching updates every translated string immediately.
- Signed-in user's choice persists across sessions and devices.
- AI output language matches UI language preference.
- Adding a new locale = add one new dictionary file + enum value. No framework-level changes.

---

## 6. DNA questions — everything optional

### Changes

**`src/components/onboarding/StepBasics.tsx`**
- Remove `disabled={!name.trim() || !audience.trim()}` from the Continue button.
- Add `(optional)` hint next to each label.
- Provide sensible defaults: `name = session.user.name || ""`, `audience = ""`.

**`src/components/onboarding/StepTone.tsx`**
- "Pick 1–2 tones" → "Pick 1 or 2 (optional)".
- Continue always enabled. If nothing selected, `professional` is used as fallback.

**`src/components/onboarding/StepStyle.tsx`**
- Keep `paste` and `discover` modes. Remove the `disabled={!hasContent}` gate on Next buttons.
- Add a third large option at the mode picker: **"Skip — I'll train my DNA later"** that immediately calls `generateDNA()` with empty inputs.

**`src/lib/ai/prompts.ts` — `buildDNAProfilePrompt`**
- Add handling for the minimal-input case: when `samplePosts=[]` and `styleDiscoveryAnswers=null`, generate a generic-but-usable profile anchored on defaults (professional tone, mixed style, light emojis).

**`src/app/api/dna/route.ts`** — already accepts empty arrays; no change.

### Acceptance
- User can press through every step touching nothing and still land on a DNA profile at step 4.
- Partially-filled submissions work (e.g., name only, or tone only).

---

## 7. Admin system

### Access model
- Prisma: add `Role` enum (`user | admin`) and `User.role` field (default `user`).
- Migration seeds `role = admin` for the account with email `luisnburger@gmail.com`.
- Guard: `src/lib/admin-guard.ts` — `requireAdmin()` reads session + role. Non-admin → `notFound()` (404 cloaks existence).

### Routes
```
/admin                     → dashboard (KPI cards + compact users table)
```
(One page in this pass — can grow later.)

### Layout
- `src/app/admin/layout.tsx` — calls `requireAdmin()` server-side, renders a simple shell (page title, maybe a "Back to app" link).
- `src/app/admin/page.tsx` — server component, fetches KPIs in parallel with Prisma.

### KPIs (server-computed)
| KPI | Formula |
|---|---|
| Total users | `prisma.user.count()` |
| Active last 30d | `prisma.user.count({ where: { updatedAt: { gt: thirtyDaysAgo } } })` |
| Paying users | `prisma.user.count({ where: { plan: "pro" } })` |
| MRR (derived) | `payingUsers × 29` — labeled "Derived" |
| Conversion | `payingUsers / totalUsers × 100` |

### Users table (compact)
Columns: `Email · Plan · Role · Created · Last seen`. Default ordering: `updatedAt desc`. Limit 50 + pagination later. No edit actions in this pass.

### UI
Tailwind only — 5 stat cards in a responsive grid (`grid-cols-1 md:grid-cols-5`), then a table below. No chart library. Match the existing design tokens (`font-display`, `text-zinc-900`, brand accents).

### Acceptance
- `luisnburger@gmail.com` sees `/admin` dashboard after sign-in.
- Any other user hitting `/admin` gets a 404.
- Numbers update live with each page load; no mock data.
- MRR card visibly reads `Derived` so it can't be misread once Stripe is wired.

---

## 8. DNA summary — shorter

### Target
Max 3 sentences, ~60 words, scannable.

### Changes
- Rewrite `buildDNAProfilePrompt` in `src/lib/ai/prompts.ts` to explicitly require: "Respond in 2–3 short sentences, max 60 words. Mention: tone, one signature move, habits with emojis/length. Do not restate the inputs."
- Drop `max_tokens` from `500` to `150` in `src/lib/ai/dna.ts`.
- `StepDNAResult.tsx` subtitle: change "Here's how we understand your voice" to **"Your voice, summarized"**.
- `/app/dna/page.tsx` card stays as-is visually — shorter body just looks tidier.

### Acceptance
- New profiles are ≤ 3 sentences, ≤ 60 words.
- Existing profiles continue to render (no migration needed).

---

## 9. Bulk post generation

### UX
- New route: `/app/bulk` ("Bulk generate" in SideNav + BottomNav).
- Single-column form:
  - Textarea: "Your topic or idea" (same component as IdeaInput).
  - Count picker: segmented `3 | 5 | 7 | 10` (default 5).
  - Primary button: `Generate <n> posts`.
- Results render as a vertical stack of cards, each with the existing `LinkedInPreview` component. Per-card actions: Copy, Save, Regenerate-this-one (calls `/api/generate` with a hint for that post's angle).
- Pre-submit, show `Uses <n> of <remaining> free posts this month` (Pro users see "Unlimited").

### Backend

**New route:** `POST /api/generate/bulk`
```ts
// body: { input: string, count: 3 | 5 | 7 | 10 }
// returns: { posts: Array<{ id, post, structure, language }>, postsUsed }
```

Logic:
1. Auth via `getAuthUser()`.
2. Check plan + remaining quota. If `!isPro && postsUsed + count > 5` → 403 with `{ error: "quota_exceeded", remaining }`.
3. Build `count` distinct angle seeds from `PostStructure` enum (`hook_story, contrarian, personal, list, lesson` — shuffled, repeated if `count > 5`).
4. Run `count` parallel `runPostChain(...)` calls (reusing existing engine) with each seed.
5. Persist each successful result as a `Post` row with its `chainContext`.
6. Increment `postsUsedThisMonth` by the number of successful generations.
7. Return the posts.

Errors per-post are tolerated: if 4 of 5 succeed, return 4 and only charge for 4.

### Config
- Vercel function timeout: add `/api/generate/bulk` to `vercel.json` with `maxDuration: 120s` (parallel calls but Anthropic latency can stack).

### Acceptance
- Free user with 3 remaining can request 3; requesting 5 shows a gentle block pre-submit.
- Each returned post has a different structure/angle.
- Pro user can run 10 at once without limit.

---

## 10. LinkedIn API — research deliverable

### What
A single markdown file: `docs/research/2026-04-18-linkedin-api-feasibility.md`.

### Covers
- OAuth 2.0 / OpenID Connect basics, typical scopes (`openid`, `profile`, `email`, `w_member_social`).
- User-triggered posting (`ugcPosts` / `posts` endpoints) — feasible with basic developer app.
- Marketing Developer Platform (MDP) — required for analytics, paid post metrics, ads. Partner application, multi-week review, usually B2B SaaS with traction.
- Community Management API — private alpha, invite-only, covers comments and engagements. Practically unavailable to indie SaaS.
- Messaging API — partner-only, largely unavailable.
- LinkedIn's ToS on automation, posting cadence, and reading third-party data.
- Realistic feasibility matrix for NoPersonAI:

| Feature | Feasible today? | Notes |
|---|---|---|
| Connect LinkedIn (OAuth) | Yes | Basic developer app. |
| Post on user's behalf | Yes | `w_member_social`. |
| Read post analytics (impressions, reactions) | No | Requires MDP partner approval. |
| Read KPIs (follower growth, profile views) | No | Requires MDP partner approval. |
| Read/write DMs | No | Partner-only Messaging API. |
| Write comments | No | Community Management API alpha. |

### Not in scope
No implementation. No UI. No partial feasibility POC.

---

## Shipping order

Grouped for safe, self-contained PR-like batches. Details go in the implementation plan.

1. **Quick wins** — auth/DNA bug fix, smooth scroll, navbar polish.
2. **DNA refinements** — optional questions, shorter summary (prompt + UI).
3. **Pricing toggle** — purely self-contained.
4. **i18n infrastructure** — dictionary scaffolding, provider, switcher component, DB enum extension.
5. **i18n rollout** — translate landing, onboarding, app shell.
6. **Admin** — Role enum + migration, `/admin` route, dashboard.
7. **Bulk generation** — new route, new API, quota wiring.
8. **LinkedIn research doc** — research and write; no code.

---

## Out of scope for this pass

- Stripe Checkout wiring (remains a follow-up per `README`).
- Moving off Twilio sandbox.
- Rewriting the AI chain (`src/lib/ai/engine.ts`) — prompt-level tweaks only.
- New design system primitives. Reuse existing UI (`Button`, `Input`, `Card`, `Badge`, etc.).
- Real analytics, cohorts, or chart components in admin.
