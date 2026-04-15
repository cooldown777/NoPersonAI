# NoPersonAI — Web App + AI Writing Engine Design Spec

**Sub-project 1 of 4** | Date: 2026-04-16

Future sub-projects (in order): **WhatsApp integration** (primary differentiator — send a voice note or text via WhatsApp, get a LinkedIn post back), LinkedIn scraping/posting + scheduling, Payments (Stripe).

---

## 1. Product Overview

A LinkedIn post generator that produces posts indistinguishable from what the user would write themselves. The core differentiator is a "Writing DNA" system that deeply learns each user's tone, style, and formatting patterns, combined with a multi-step AI reasoning chain that decides HOW to write before writing.

**Target users:** Solo professionals, thought leaders, founders — people who want personal brand growth and business leads through LinkedIn content.

**Languages:** German and English. Auto-detect from input with manual override per post.

**Monetization:** Freemium — 5 free posts/month (refinements unlimited), Pro at ~€29/month for unlimited generation.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router) |
| Styling | TailwindCSS |
| Database | PostgreSQL on Neon (serverless) |
| ORM | Prisma |
| Auth | NextAuth.js (Google OAuth + magic link) |
| AI | Claude API (Anthropic SDK, TypeScript) |
| Deployment | Vercel |
| Payments | Stripe (future sub-project, stubbed in MVP) |

Single monolithic Next.js app. Public pages SSR for SEO, app pages client-side behind auth.

---

## 3. Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | string | Unique |
| name | string | From auth provider or user input |
| image | string? | Avatar URL |
| plan | enum (free, pro) | Default: free |
| postsUsedThisMonth | int | Default: 0, resets monthly |
| createdAt | datetime | |
| updatedAt | datetime | |

### WritingDNA (1:1 with User)
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| userId | uuid | Foreign key → User, unique |
| tone | enum | professional, casual, storytelling, controversial |
| audience | text | Free text — who they write for |
| style | enum | punchy, longform, mixed |
| emojiUsage | enum | none, light, heavy |
| samplePosts | text[] | Up to 5 pasted examples |
| styleDiscoveryAnswers | jsonb? | Stores example picks + writing exercise (for new users) |
| onboardingMethod | enum | sample-posts, style-discovery, both |
| generatedProfile | text | AI-generated natural language summary of writing patterns |
| preferredLanguage | enum | de, en |
| createdAt | datetime | |
| updatedAt | datetime | |

### Post
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| userId | uuid | Foreign key → User |
| input | text | Raw user idea |
| output | text | Generated post |
| structure | enum | hook-story, contrarian, personal, list, lesson |
| language | enum | de, en |
| chainContext | jsonb | Stored intent + structure + DNA snapshot for refinements |
| isFavorite | boolean | Default: false |
| createdAt | datetime | |
| updatedAt | datetime | |

### Refinement
| Field | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| postId | uuid | Foreign key → Post |
| type | enum | stronger-hook, different-cta, change-takeaway, shorter, longer, more-casual, more-professional, add-emojis, remove-emojis, different-angle, custom |
| customInstruction | text? | For custom refinement requests |
| output | text | The refined post |
| createdAt | datetime | |

---

## 4. AI Writing Engine

A 5-step chain, not a single prompt. Each step has a clear input/output contract.

### Step 1: Analyze Intent
- **Input:** user's raw idea (1-2 sentences)
- **Output:** structured JSON — topic, goal (educate/inspire/sell/entertain), key message, target emotion
- **Cost:** ~100 tokens output

### Step 2: Select Post Structure
- **Input:** intent analysis + Writing DNA generatedProfile
- **Output:** best-fit structure + reasoning
- **Structures available:**
  - Hook → Story → Insight → CTA (most versatile)
  - Contrarian take ("Everyone says X. Here's why that's wrong.")
  - Personal story (vulnerability-driven)
  - List post ("7 things I learned...")
  - Lesson learned ("I failed at X. Here's what it taught me.")
- **Cost:** ~150 tokens output

Steps 1-2 are combined into a single Claude API call for speed.

### Step 3: Generate Post
- **Input:** intent + structure + full Writing DNA (tone, style, emoji usage, generatedProfile, sample posts)
- **System prompt includes:**
  - Writing DNA summary as "voice instructions"
  - LinkedIn formatting rules (short lines, whitespace, hook before "see more" cutoff at ~210 characters)
  - Selected structure as template
- **Output:** full formatted LinkedIn post
- **Cost:** ~300-500 tokens output

### Step 4: Self-Evaluate
- **Input:** generated post + Writing DNA + original input
- **Scoring checklist (1-5 each):**
  - Does it sound human (not AI-generic)?
  - Does it match the user's voice?
  - Is it LinkedIn-native (formatting, length, hook)?
  - Does it deliver the intended message?
- **If any score < 3:** auto-refine and re-evaluate (max 1 retry)
- **Output:** final post + confidence scores

### Step 5: Prepare Refinement Context
- Store chain context (intent, structure, DNA snapshot) in Post.chainContext
- Refinements reuse this context — only re-run Step 3 with modified instructions
- Refinements take ~1-2 seconds, cost ~$0.005 each

**Total per generation:** 2-3 API calls, ~2-4 seconds, ~$0.01-0.03 per post (Claude Sonnet).
**Cost at scale:** 200 users × 10 posts/mo = $20-60/mo in API costs.

---

## 5. Refinement System

After generation, the user sees quick-action buttons below their post:

| Button (EN) | Button (DE) | Behavior |
|---|---|---|
| Stronger hook | Stärkerer Hook | Rewrites opening 1-2 lines |
| Different CTA | Anderer CTA | Swaps the call-to-action |
| Different takeaway | Andere Erkenntnis | Changes the core lesson/insight |
| Shorter | Kürzer | Condenses without losing message |
| Longer | Länger | Expands with more detail/story |
| More casual | Lockerer | Shifts tone conversational |
| More professional | Professioneller | Shifts tone formal |
| Add emojis | Mehr Emojis | Adds emojis matching user style |
| Remove emojis | Ohne Emojis | Strips all emojis |
| Different angle | Anderer Blickwinkel | Same topic, new perspective |

Plus a **free-text instruction field** ("Tell the AI what to change...") for custom requests.

Each refinement is saved as a Refinement record — user can undo/go back to any version. The post itself is also directly editable as free text in the LinkedIn-style preview.

---

## 6. Onboarding Flow

After signup (Google OAuth or magic link):

### Step 1: Basics
- Name (prefilled from auth)
- Preferred language (DE / EN)
- Target audience (free text with examples: "founders", "HR managers", "tech leads")

### Step 2: Tone
- Visual cards, pick 1-2: Professional & polished / Casual & conversational / Storytelling & personal / Bold & controversial
- Emoji usage: None / Light / Heavy (visual selector)

### Step 3: Style (branched)

**Branch A — "I have LinkedIn posts"**
- Paste 1-5 past posts into text areas
- AI analyzes patterns in background

**Branch B — "I'm new to LinkedIn" (Style Discovery)**
1. Show 3-4 pairs of real LinkedIn post examples (anonymized) — user picks preferred style each time
2. Writing exercise: "Describe a recent win in 2-3 sentences" — AI analyzes natural voice

User can do both branches.

### Step 4: Writing DNA Result
- AI generates the Writing DNA profile (2-3 second loading state)
- Display summary: "Here's how we understand your voice:" with natural language description
- User can approve or adjust ("Not quite right? Tell us what to adjust")

Then → Dashboard, ready to generate first post.

**UX principles:**
- Progress bar visible throughout (reduces drop-off)
- Visual cards over dropdowns (faster on mobile, thumb-friendly)
- Skippable but encouraged — gentle nudge if user tries to skip

---

## 7. App Pages

### Generator (Home — `/app`)
- Large text input: "What's your idea?"
- Rotating placeholder examples
- "Generate" button
- Result: LinkedIn-style post preview (profile pic, name, formatted text)
- Refinement chips (horizontal scroll)
- Free-text instruction field (collapsed, expands on tap)
- Actions: "Copy to clipboard" (primary), "Save", "Regenerate"
- Post counter: "3 of 10 free posts this month"

### History (`/app/history`)
- List of generated posts, newest first
- Each card: first line (hook), date, language flag, favorite star
- Tap to expand → full post + copy button
- Filter by: favorites, language, date

### Writing DNA (`/app/dna`)
- Current DNA summary
- Edit questionnaire answers
- Add/remove sample posts
- "Regenerate DNA" button
- Shows onboarding method used

### Account (`/app/account`)
- Plan status (Free / Pro)
- Posts used this month
- Upgrade to Pro (→ Stripe checkout, stubbed for MVP)
- Language preference
- Sign out

**Navigation:** Bottom tab bar on mobile (4 icons: Generator, History, DNA, Account). Always visible.

---

## 8. Landing Page & SEO

### Landing page structure (`/`)
1. **Hero** — Problem-first headline: "LinkedIn-Posts, die sich anfühlen, als hättest du sie selbst geschrieben" / "LinkedIn posts that sound like you actually wrote them." Primary CTA: "Kostenlos starten" / "Start for free"
2. **Pain points** — 3 cards: Generic AI output / No time to write / Inconsistent posting → how we solve each
3. **How it works** — 3-step visual: Enter idea → AI writes in your voice → Copy & post
4. **WhatsApp teaser** — "Coming soon: Send a voice note via WhatsApp, get a LinkedIn post back." Eye-catching section with WhatsApp icon and early-access signup. This is the #1 differentiator — no competitor offers this. Prominently featured to build anticipation and collect interested leads.
5. **Post preview** — Show a real-looking generated post in LinkedIn-style UI (competitors hide this — we show it)
6. **Writing DNA section** — Explain personalization: "We learn how YOU write"
7. **Pricing** — Side-by-side Free vs Pro with CTAs on both
8. **FAQ** — "Is this just ChatGPT?" / "Will it sound like me?" / "Can I use it in German?" / "What about WhatsApp?"
9. **Final CTA** — Repeat primary action

### SEO strategy
- **Primary keywords:** "LinkedIn Post Generator", "LinkedIn Post erstellen", "KI LinkedIn Posts", "LinkedIn Beitrag schreiben"
- **Blog content** (`/blog`): How-to guides targeting long-tail keywords
- **Technical SEO:** SSR for all public pages, meta tags + Open Graph, JSON-LD (SoftwareApplication schema), sitemap.xml, semantic HTML
- **Bilingual:** German and English landing pages with hreflang tags
- **Performance:** Vercel edge, minimal JS on public pages, next/image optimization

---

## 9. Mobile-First Design Principles

All UI is designed mobile-first, then adapted for desktop.

- **Thumb-friendly:** All tap targets minimum 44px, primary actions in bottom half of screen
- **Bottom tab navigation:** Always visible, no hamburger menus
- **Refinement chips:** Horizontal scrollable, not a grid
- **Post preview:** Full-width card, mimics LinkedIn mobile app
- **Fast loading:** Target < 2s LCP on 3G, minimal JS bundles on public pages
- **Meta ads optimized:** Landing page conversion flow works seamlessly from Instagram/Facebook ad tap → signup

---

## 10. Freemium Gating

- **Free tier:** 5 new post generations per month, unlimited refinements, full Writing DNA access
- **Pro tier (~€29/mo):** Unlimited generations, priority generation speed
- **Counter:** postsUsedThisMonth on User model, checked before each generation
- **Reset:** Monthly reset via check-on-request (compare current month vs last generation date)
- **Upgrade prompt:** When user hits limit, show friendly upgrade screen with "Upgrade to Pro" → Stripe checkout
- **Stripe integration:** Stubbed in MVP (checkout page, webhook for plan update). Full implementation in future sub-project.

---

## 11. Competitor Positioning

### vs. MagicPost
- They promise "AI that knows the algorithm" but don't show how
- We show our output before signup (post preview on landing page)
- Our multi-step chain with self-evaluation produces more authentic results than single-prompt generation

### vs. EasyGen
- They hide pricing and output previews
- Our Writing DNA system is transparent — user sees and approves their voice profile
- We match their voice note feature later (WhatsApp sub-project)

### vs. RedactAI (closest competitor)
- They analyze last 100 posts — we offer style discovery for beginners too
- They generate 3 versions (choice paralysis) — we generate 1 + rich refinement controls
- Our refinement system gives more control than picking from 3 options

### Our unique advantages
1. **WhatsApp integration** (coming in sub-project 2 — the primary differentiator, no competitor has this. Teased on landing page from day one to build anticipation and collect early-access leads)
2. Style Discovery for LinkedIn beginners
3. Transparent Writing DNA the user can see and adjust
4. Multi-step AI chain with self-evaluation
5. Show output quality before signup
6. Bilingual (DE/EN) from day one
