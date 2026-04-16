# NoPersonAI — Web App + AI Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first LinkedIn post generator with Writing DNA personalization and a 5-step AI chain, deployed on Vercel.

**Architecture:** Single Next.js 14+ monolith (App Router). Public pages SSR for SEO, app pages client-side behind auth. PostgreSQL on Neon via Prisma. Claude API for AI generation. NextAuth for Google OAuth + magic link.

**Tech Stack:** Next.js 14+, TailwindCSS, Prisma, PostgreSQL (Neon), NextAuth.js, Anthropic SDK (TypeScript), Vercel

**Spec:** `docs/superpowers/specs/2026-04-16-web-app-ai-engine-design.md`

---

## File Structure

```
├── prisma/
│   └── schema.prisma
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout, fonts, metadata
│   │   ├── page.tsx                            # Landing page (SSR, SEO)
│   │   ├── pricing/page.tsx                    # Pricing page (SSR)
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts     # NextAuth handler
│   │   │   ├── generate/route.ts               # POST: generate post
│   │   │   ├── refine/route.ts                 # POST: refine post
│   │   │   ├── posts/route.ts                  # GET: list posts
│   │   │   ├── posts/[id]/route.ts             # PATCH: toggle favorite, DELETE
│   │   │   └── dna/route.ts                    # GET/PUT: Writing DNA
│   │   ├── auth/
│   │   │   └── signin/page.tsx                 # Custom sign-in page
│   │   ├── onboarding/
│   │   │   └── page.tsx                        # Onboarding wizard
│   │   └── app/
│   │       ├── layout.tsx                      # App shell + bottom nav + auth guard
│   │       ├── page.tsx                        # Generator (home)
│   │       ├── history/page.tsx                # Post history
│   │       ├── dna/page.tsx                    # Writing DNA settings
│   │       └── account/page.tsx                # Account & plan
│   ├── lib/
│   │   ├── db.ts                               # Prisma client singleton
│   │   ├── auth.ts                             # NextAuth config
│   │   ├── auth-guard.ts                       # Server-side auth check helper
│   │   └── ai/
│   │       ├── engine.ts                       # 5-step chain orchestrator
│   │       ├── prompts.ts                      # All prompt templates
│   │       ├── refine.ts                       # Refinement logic
│   │       ├── dna.ts                          # Writing DNA profile generation
│   │       └── types.ts                        # AI-related TypeScript types
│   ├── components/
│   │   ├── landing/
│   │   │   ├── Hero.tsx
│   │   │   ├── PainPoints.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── WhatsAppTeaser.tsx
│   │   │   ├── PostPreviewSection.tsx
│   │   │   ├── WritingDNASection.tsx
│   │   │   ├── PricingSection.tsx
│   │   │   ├── FAQ.tsx
│   │   │   └── FinalCTA.tsx
│   │   ├── onboarding/
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── StepBasics.tsx
│   │   │   ├── StepTone.tsx
│   │   │   ├── StepStyle.tsx
│   │   │   └── StepDNAResult.tsx
│   │   ├── generator/
│   │   │   ├── IdeaInput.tsx
│   │   │   ├── LinkedInPreview.tsx
│   │   │   ├── RefinementChips.tsx
│   │   │   ├── CustomInstruction.tsx
│   │   │   └── PostCounter.tsx
│   │   └── app/
│   │       └── BottomNav.tsx
│   └── data/
│       └── style-discovery-posts.ts            # Example post pairs for onboarding
├── __tests__/
│   ├── lib/ai/
│   │   ├── engine.test.ts
│   │   ├── refine.test.ts
│   │   └── dna.test.ts
│   └── api/
│       ├── generate.test.ts
│       └── posts.test.ts
├── .env.example
├── .env.local                                  # (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── vitest.config.ts
├── tsconfig.json
└── package.json
```

---

### Task 1: Project Scaffold

**Files:**
- Create: `package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `.env.example`, `.gitignore`, `vitest.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`

- [ ] **Step 1: Create Next.js project**

```bash
cd /Users/luis/Documents/NoPersonAI
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```

Select defaults when prompted. This creates the full Next.js + Tailwind scaffold.

- [ ] **Step 2: Install dependencies**

```bash
cd /Users/luis/Documents/NoPersonAI
npm install @prisma/client next-auth @auth/prisma-adapter @anthropic-ai/sdk
npm install -D prisma vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 3: Create `.env.example`**

Create `/Users/luis/Documents/NoPersonAI/.env.example`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:pass@host/dbname?sslmode=require"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Magic Link) — use Resend for easy setup
EMAIL_SERVER_HOST="smtp.resend.com"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="resend"
EMAIL_SERVER_PASSWORD=""
EMAIL_FROM="noreply@nopersonai.com"

# Anthropic
ANTHROPIC_API_KEY=""
```

- [ ] **Step 4: Create Vitest config**

Create `/Users/luis/Documents/NoPersonAI/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

- [ ] **Step 5: Add test script to package.json**

In `/Users/luis/Documents/NoPersonAI/package.json`, add to `"scripts"`:

```json
"test": "vitest",
"test:run": "vitest run"
```

- [ ] **Step 6: Verify setup**

```bash
cd /Users/luis/Documents/NoPersonAI
npm run dev &
sleep 3
curl -s http://localhost:3000 | head -20
kill %1
```

Expected: HTML response from Next.js default page.

- [ ] **Step 7: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add -A
git commit -m "feat: scaffold Next.js project with Tailwind, Vitest, and dependencies"
```

---

### Task 2: Prisma Schema + Database

**Files:**
- Create: `prisma/schema.prisma`, `src/lib/db.ts`

- [ ] **Step 1: Initialize Prisma**

```bash
cd /Users/luis/Documents/NoPersonAI
npx prisma init
```

- [ ] **Step 2: Write the schema**

Replace `/Users/luis/Documents/NoPersonAI/prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Plan {
  free
  pro
}

enum Tone {
  professional
  casual
  storytelling
  controversial
}

enum WritingStyle {
  punchy
  longform
  mixed
}

enum EmojiUsage {
  none
  light
  heavy
}

enum OnboardingMethod {
  sample_posts
  style_discovery
  both
}

enum Language {
  de
  en
}

enum PostStructure {
  hook_story
  contrarian
  personal
  list
  lesson
}

enum RefinementType {
  stronger_hook
  different_cta
  change_takeaway
  shorter
  longer
  more_casual
  more_professional
  add_emojis
  remove_emojis
  different_angle
  custom
}

// NextAuth required tables
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model User {
  id                 String    @id @default(cuid())
  email              String    @unique
  emailVerified      DateTime?
  name               String?
  image              String?
  plan               Plan      @default(free)
  postsUsedThisMonth Int       @default(0)
  postsResetAt       DateTime  @default(now())
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  accounts   Account[]
  sessions   Session[]
  writingDna WritingDNA?
  posts      Post[]
}

model WritingDNA {
  id                    String           @id @default(cuid())
  userId                String           @unique
  tone                  Tone             @default(professional)
  audience              String           @default("")
  style                 WritingStyle     @default(mixed)
  emojiUsage            EmojiUsage       @default(light)
  samplePosts           String[]
  styleDiscoveryAnswers Json?
  onboardingMethod      OnboardingMethod @default(sample_posts)
  generatedProfile      String           @default("")
  preferredLanguage     Language         @default(en)
  createdAt             DateTime         @default(now())
  updatedAt             DateTime         @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Post {
  id           String        @id @default(cuid())
  userId       String
  input        String
  output       String
  structure    PostStructure
  language     Language
  chainContext Json
  isFavorite   Boolean       @default(false)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  user        User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  refinements Refinement[]
}

model Refinement {
  id                String         @id @default(cuid())
  postId            String
  type              RefinementType
  customInstruction String?
  output            String
  createdAt         DateTime       @default(now())

  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)
}
```

- [ ] **Step 3: Create Prisma client singleton**

Create `/Users/luis/Documents/NoPersonAI/src/lib/db.ts`:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

- [ ] **Step 4: Generate Prisma client**

```bash
cd /Users/luis/Documents/NoPersonAI
npx prisma generate
```

Expected: `✔ Generated Prisma Client`

- [ ] **Step 5: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add prisma/schema.prisma src/lib/db.ts
git commit -m "feat: add Prisma schema with User, WritingDNA, Post, Refinement models"
```

---

### Task 3: NextAuth Setup

**Files:**
- Create: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/auth/signin/page.tsx`, `src/lib/auth-guard.ts`

- [ ] **Step 1: Create NextAuth config**

Create `/Users/luis/Documents/NoPersonAI/src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
```

- [ ] **Step 2: Create NextAuth route handler**

Create `/Users/luis/Documents/NoPersonAI/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

- [ ] **Step 3: Create auth type augmentation**

Create `/Users/luis/Documents/NoPersonAI/src/types/next-auth.d.ts`:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
```

- [ ] **Step 4: Create auth guard helper**

Create `/Users/luis/Documents/NoPersonAI/src/lib/auth-guard.ts`:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getAuthUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return null;
  }
  return session.user;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

- [ ] **Step 5: Create custom sign-in page**

Create `/Users/luis/Documents/NoPersonAI/src/app/auth/signin/page.tsx`:

```tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    await signIn("email", { email, redirect: false });
    setEmailSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Sign in to NoPersonAI
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Create LinkedIn posts that sound like you
          </p>
        </div>

        <button
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
          className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-gray-50 px-2 text-gray-500">or</span>
          </div>
        </div>

        {emailSent ? (
          <div className="rounded-lg bg-green-50 p-4 text-center">
            <p className="text-sm text-green-800">
              Check your email for a magic link to sign in.
            </p>
          </div>
        ) : (
          <form onSubmit={handleEmailSignIn} className="space-y-3">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Send magic link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/lib/auth.ts src/lib/auth-guard.ts src/app/api/auth/ src/app/auth/ src/types/
git commit -m "feat: add NextAuth with Google OAuth + magic link email"
```

---

### Task 4: AI Types + Prompt Templates

**Files:**
- Create: `src/lib/ai/types.ts`, `src/lib/ai/prompts.ts`

- [ ] **Step 1: Define AI types**

Create `/Users/luis/Documents/NoPersonAI/src/lib/ai/types.ts`:

```typescript
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
```

- [ ] **Step 2: Write prompt templates**

Create `/Users/luis/Documents/NoPersonAI/src/lib/ai/prompts.ts`:

```typescript
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
```

- [ ] **Step 3: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/lib/ai/types.ts src/lib/ai/prompts.ts
git commit -m "feat: add AI types and prompt templates for 5-step chain"
```

---

### Task 5: AI Engine — Writing DNA Generation

**Files:**
- Create: `src/lib/ai/dna.ts`, `__tests__/lib/ai/dna.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/luis/Documents/NoPersonAI/__tests__/lib/ai/dna.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { generateDNAProfile } from "@/lib/ai/dna";

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
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
    })),
  };
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/luis/Documents/NoPersonAI
npx vitest run __tests__/lib/ai/dna.test.ts
```

Expected: FAIL — module `@/lib/ai/dna` not found.

- [ ] **Step 3: Implement DNA generation**

Create `/Users/luis/Documents/NoPersonAI/src/lib/ai/dna.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { buildDNAProfilePrompt } from "./prompts";

const anthropic = new Anthropic();

interface GenerateDNAInput {
  tone: string;
  audience: string;
  style: string;
  emojiUsage: string;
  samplePosts: string[];
  styleDiscoveryAnswers: Record<string, unknown> | null;
  language: string;
}

export async function generateDNAProfile(
  input: GenerateDNAInput
): Promise<string> {
  const prompt = buildDNAProfilePrompt(
    input.tone,
    input.audience,
    input.style,
    input.emojiUsage,
    input.samplePosts,
    input.styleDiscoveryAnswers,
    input.language
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/luis/Documents/NoPersonAI
npx vitest run __tests__/lib/ai/dna.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/lib/ai/dna.ts __tests__/lib/ai/dna.test.ts
git commit -m "feat: add Writing DNA profile generation via Claude"
```

---

### Task 6: AI Engine — 5-Step Post Generation Chain

**Files:**
- Create: `src/lib/ai/engine.ts`, `__tests__/lib/ai/engine.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/luis/Documents/NoPersonAI/__tests__/lib/ai/engine.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { generatePost } from "@/lib/ai/engine";
import type { WritingDNAInput } from "@/lib/ai/types";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: mockCreate,
      },
    })),
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/luis/Documents/NoPersonAI
npx vitest run __tests__/lib/ai/engine.test.ts
```

Expected: FAIL — module `@/lib/ai/engine` not found.

- [ ] **Step 3: Implement the 5-step engine**

Create `/Users/luis/Documents/NoPersonAI/src/lib/ai/engine.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import {
  buildIntentAndStructurePrompt,
  buildGeneratePostPrompt,
  buildSelfEvaluatePrompt,
} from "./prompts";
import type {
  IntentAndStructure,
  SelfEvaluation,
  GenerationResult,
  WritingDNAInput,
  ChainContext,
} from "./types";

const anthropic = new Anthropic();

async function callClaude(prompt: string, maxTokens: number): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: maxTokens,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }
  return textBlock.text;
}

function parseJSON<T>(text: string): T {
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned) as T;
}

// Steps 1-2: Analyze intent + select structure (combined)
async function analyzeIntentAndStructure(
  userInput: string,
  dnaProfile: string
): Promise<IntentAndStructure> {
  const prompt = buildIntentAndStructurePrompt(userInput, dnaProfile);
  const response = await callClaude(prompt, 500);
  return parseJSON<IntentAndStructure>(response);
}

// Step 3: Generate post
async function generatePostText(
  userInput: string,
  intentAndStructure: IntentAndStructure,
  dna: WritingDNAInput
): Promise<string> {
  const language =
    intentAndStructure.intent.detectedLanguage || dna.preferredLanguage;
  const prompt = buildGeneratePostPrompt(
    userInput,
    JSON.stringify(intentAndStructure.intent),
    intentAndStructure.structure.structure,
    intentAndStructure.structure.reasoning,
    dna,
    language
  );
  return callClaude(prompt, 1000);
}

// Step 4: Self-evaluate
async function selfEvaluate(
  post: string,
  userInput: string,
  dnaProfile: string
): Promise<SelfEvaluation> {
  const prompt = buildSelfEvaluatePrompt(post, userInput, dnaProfile);
  const response = await callClaude(prompt, 200);
  return parseJSON<SelfEvaluation>(response);
}

// Full 5-step chain
export async function generatePost(
  userInput: string,
  dna: WritingDNAInput,
  maxRetries: number = 1
): Promise<GenerationResult> {
  // Steps 1-2
  const intentAndStructure = await analyzeIntentAndStructure(
    userInput,
    dna.generatedProfile
  );

  let post: string;
  let evaluation: SelfEvaluation;
  let attempt = 0;

  // Steps 3-4 (with retry loop)
  do {
    post = await generatePostText(userInput, intentAndStructure, dna);
    evaluation = await selfEvaluate(post, userInput, dna.generatedProfile);
    attempt++;
  } while (evaluation.needsRefinement && attempt <= maxRetries);

  // Step 5: Return result with chain context for refinements
  return {
    post,
    intent: intentAndStructure.intent,
    structure: intentAndStructure.structure,
    evaluation,
  };
}

// Export for use in API routes
export function buildChainContext(
  result: GenerationResult,
  dna: WritingDNAInput
): ChainContext {
  return {
    intent: result.intent,
    structure: result.structure,
    dnaSnapshot: dna,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/luis/Documents/NoPersonAI
npx vitest run __tests__/lib/ai/engine.test.ts
```

Expected: PASS (both tests)

- [ ] **Step 5: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/lib/ai/engine.ts __tests__/lib/ai/engine.test.ts
git commit -m "feat: add 5-step AI post generation engine with self-evaluation retry"
```

---

### Task 7: AI Engine — Refinement Logic

**Files:**
- Create: `src/lib/ai/refine.ts`, `__tests__/lib/ai/refine.test.ts`

- [ ] **Step 1: Write the failing test**

Create `/Users/luis/Documents/NoPersonAI/__tests__/lib/ai/refine.test.ts`:

```typescript
import { describe, it, expect, vi } from "vitest";
import { refinePost } from "@/lib/ai/refine";
import type { ChainContext } from "@/lib/ai/types";

vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [
            {
              type: "text",
              text: "You won't believe what happened when I hired 3 wrong people.\n\nIt nearly killed my startup.\n\nHere's what changed everything...",
            },
          ],
        }),
      },
    })),
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
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/luis/Documents/NoPersonAI
npx vitest run __tests__/lib/ai/refine.test.ts
```

Expected: FAIL — module `@/lib/ai/refine` not found.

- [ ] **Step 3: Implement refinement**

Create `/Users/luis/Documents/NoPersonAI/src/lib/ai/refine.ts`:

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { buildRefinementPrompt } from "./prompts";
import type { ChainContext, RefinementAction } from "./types";

const anthropic = new Anthropic();

export async function refinePost(
  currentPost: string,
  action: RefinementAction,
  customInstruction: string | null,
  context: ChainContext
): Promise<string> {
  const prompt = buildRefinementPrompt(
    currentPost,
    action,
    customInstruction,
    context.dnaSnapshot,
    context.intent.detectedLanguage || context.dnaSnapshot.preferredLanguage
  );

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return textBlock.text;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
cd /Users/luis/Documents/NoPersonAI
npx vitest run __tests__/lib/ai/refine.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/lib/ai/refine.ts __tests__/lib/ai/refine.test.ts
git commit -m "feat: add post refinement logic using chain context"
```

---

### Task 8: API Routes — Generate + Refine + Posts + DNA

**Files:**
- Create: `src/app/api/generate/route.ts`, `src/app/api/refine/route.ts`, `src/app/api/posts/route.ts`, `src/app/api/posts/[id]/route.ts`, `src/app/api/dna/route.ts`

- [ ] **Step 1: Create generate API route**

Create `/Users/luis/Documents/NoPersonAI/src/app/api/generate/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { generatePost, buildChainContext } from "@/lib/ai/engine";
import type { WritingDNAInput } from "@/lib/ai/types";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { input, languageOverride } = await req.json();

  if (!input || typeof input !== "string" || input.trim().length === 0) {
    return NextResponse.json(
      { error: "Input is required" },
      { status: 400 }
    );
  }

  // Check freemium limit
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { writingDna: true },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Reset monthly counter if needed
  const now = new Date();
  const resetAt = new Date(dbUser.postsResetAt);
  if (
    now.getMonth() !== resetAt.getMonth() ||
    now.getFullYear() !== resetAt.getFullYear()
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { postsUsedThisMonth: 0, postsResetAt: now },
    });
    dbUser.postsUsedThisMonth = 0;
  }

  // Check limit (free = 5, pro = unlimited)
  if (dbUser.plan === "free" && dbUser.postsUsedThisMonth >= 5) {
    return NextResponse.json(
      { error: "Monthly limit reached", code: "LIMIT_REACHED" },
      { status: 403 }
    );
  }

  if (!dbUser.writingDna) {
    return NextResponse.json(
      { error: "Complete onboarding first" },
      { status: 400 }
    );
  }

  const dna: WritingDNAInput = {
    tone: dbUser.writingDna.tone,
    audience: dbUser.writingDna.audience,
    style: dbUser.writingDna.style,
    emojiUsage: dbUser.writingDna.emojiUsage,
    samplePosts: dbUser.writingDna.samplePosts,
    generatedProfile: dbUser.writingDna.generatedProfile,
    preferredLanguage:
      languageOverride || dbUser.writingDna.preferredLanguage,
  };

  const result = await generatePost(input.trim(), dna);
  const chainContext = buildChainContext(result, dna);

  // Save post and increment counter
  const post = await prisma.post.create({
    data: {
      userId: user.id,
      input: input.trim(),
      output: result.post,
      structure: result.structure.structure,
      language: result.intent.detectedLanguage,
      chainContext: chainContext as object,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { postsUsedThisMonth: { increment: 1 } },
  });

  return NextResponse.json({
    id: post.id,
    post: result.post,
    structure: result.structure.structure,
    language: result.intent.detectedLanguage,
    evaluation: result.evaluation,
    postsUsed: dbUser.postsUsedThisMonth + 1,
  });
}
```

- [ ] **Step 2: Create refine API route**

Create `/Users/luis/Documents/NoPersonAI/src/app/api/refine/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { refinePost } from "@/lib/ai/refine";
import type { ChainContext, RefinementAction } from "@/lib/ai/types";

const VALID_ACTIONS: RefinementAction[] = [
  "stronger_hook",
  "different_cta",
  "change_takeaway",
  "shorter",
  "longer",
  "more_casual",
  "more_professional",
  "add_emojis",
  "remove_emojis",
  "different_angle",
  "custom",
];

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { postId, action, customInstruction } = await req.json();

  if (!postId || !action || !VALID_ACTIONS.includes(action)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (action === "custom" && !customInstruction) {
    return NextResponse.json(
      { error: "Custom instruction required" },
      { status: 400 }
    );
  }

  const post = await prisma.post.findFirst({
    where: { id: postId, userId: user.id },
    include: { refinements: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  const chainContext = post.chainContext as unknown as ChainContext;
  const currentText =
    post.refinements.length > 0 ? post.refinements[0].output : post.output;

  const refinedText = await refinePost(
    currentText,
    action,
    customInstruction || null,
    chainContext
  );

  const refinement = await prisma.refinement.create({
    data: {
      postId: post.id,
      type: action,
      customInstruction: customInstruction || null,
      output: refinedText,
    },
  });

  return NextResponse.json({
    id: refinement.id,
    post: refinedText,
  });
}
```

- [ ] **Step 3: Create posts list + favorite/delete routes**

Create `/Users/luis/Documents/NoPersonAI/src/app/api/posts/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const url = new URL(req.url);
  const favorites = url.searchParams.get("favorites") === "true";
  const language = url.searchParams.get("language");
  const cursor = url.searchParams.get("cursor");

  const where: Record<string, unknown> = { userId: user.id };
  if (favorites) where.isFavorite = true;
  if (language === "de" || language === "en") where.language = language;

  const posts = await prisma.post.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      refinements: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return NextResponse.json({
    posts: posts.map((p) => ({
      id: p.id,
      input: p.input,
      output: p.refinements.length > 0 ? p.refinements[0].output : p.output,
      originalOutput: p.output,
      structure: p.structure,
      language: p.language,
      isFavorite: p.isFavorite,
      refinementCount: p.refinements.length,
      createdAt: p.createdAt.toISOString(),
    })),
    nextCursor: posts.length === 20 ? posts[posts.length - 1].id : null,
  });
}
```

Create `/Users/luis/Documents/NoPersonAI/src/app/api/posts/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;
  const { isFavorite } = await req.json();

  const post = await prisma.post.updateMany({
    where: { id, userId: user.id },
    data: { isFavorite },
  });

  if (post.count === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { id } = await params;

  const post = await prisma.post.deleteMany({
    where: { id, userId: user.id },
  });

  if (post.count === 0) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Create DNA API route**

Create `/Users/luis/Documents/NoPersonAI/src/app/api/dna/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { generateDNAProfile } from "@/lib/ai/dna";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const dna = await prisma.writingDNA.findUnique({
    where: { userId: user.id },
  });

  if (!dna) {
    return NextResponse.json({ dna: null });
  }

  return NextResponse.json({ dna });
}

export async function PUT(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const {
    tone,
    audience,
    style,
    emojiUsage,
    samplePosts,
    styleDiscoveryAnswers,
    onboardingMethod,
    preferredLanguage,
    regenerateProfile,
  } = body;

  let generatedProfile: string | undefined;

  if (regenerateProfile) {
    generatedProfile = await generateDNAProfile({
      tone,
      audience,
      style,
      emojiUsage,
      samplePosts: samplePosts || [],
      styleDiscoveryAnswers: styleDiscoveryAnswers || null,
      language: preferredLanguage || "en",
    });
  }

  const dna = await prisma.writingDNA.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      tone,
      audience,
      style,
      emojiUsage,
      samplePosts: samplePosts || [],
      styleDiscoveryAnswers: styleDiscoveryAnswers || undefined,
      onboardingMethod: onboardingMethod || "sample_posts",
      generatedProfile: generatedProfile || "",
      preferredLanguage: preferredLanguage || "en",
    },
    update: {
      tone,
      audience,
      style,
      emojiUsage,
      samplePosts: samplePosts || [],
      styleDiscoveryAnswers: styleDiscoveryAnswers || undefined,
      onboardingMethod: onboardingMethod || undefined,
      ...(generatedProfile ? { generatedProfile } : {}),
      preferredLanguage: preferredLanguage || undefined,
    },
  });

  return NextResponse.json({ dna });
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/api/
git commit -m "feat: add API routes for generate, refine, posts CRUD, and DNA"
```

---

### Task 9: App Layout + Bottom Navigation

**Files:**
- Create: `src/app/app/layout.tsx`, `src/components/app/BottomNav.tsx`

- [ ] **Step 1: Create BottomNav component**

Create `/Users/luis/Documents/NoPersonAI/src/components/app/BottomNav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/app",
    label: "Create",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 ${active ? "text-blue-600" : "text-gray-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
        />
      </svg>
    ),
  },
  {
    href: "/app/history",
    label: "History",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 ${active ? "text-blue-600" : "text-gray-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: "/app/dna",
    label: "DNA",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 ${active ? "text-blue-600" : "text-gray-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5"
        />
      </svg>
    ),
  },
  {
    href: "/app/account",
    label: "Account",
    icon: (active: boolean) => (
      <svg
        className={`h-6 w-6 ${active ? "text-blue-600" : "text-gray-500"}`}
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white pb-safe">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 py-2"
            >
              {tab.icon(active)}
              <span
                className={`text-xs ${active ? "font-medium text-blue-600" : "text-gray-500"}`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Create app layout with auth guard**

Create `/Users/luis/Documents/NoPersonAI/src/app/app/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BottomNav from "@/components/app/BottomNav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  // Check if onboarding is complete
  const dna = await prisma.writingDNA.findUnique({
    where: { userId: session.user.id },
  });

  if (!dna || !dna.generatedProfile) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <main className="mx-auto max-w-lg px-4 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/app/layout.tsx src/components/app/BottomNav.tsx
git commit -m "feat: add app layout with auth guard and bottom tab navigation"
```

---

### Task 10: Onboarding Flow

**Files:**
- Create: `src/app/onboarding/page.tsx`, `src/components/onboarding/ProgressBar.tsx`, `src/components/onboarding/StepBasics.tsx`, `src/components/onboarding/StepTone.tsx`, `src/components/onboarding/StepStyle.tsx`, `src/components/onboarding/StepDNAResult.tsx`, `src/data/style-discovery-posts.ts`

- [ ] **Step 1: Create style discovery example posts**

Create `/Users/luis/Documents/NoPersonAI/src/data/style-discovery-posts.ts`:

```typescript
export interface PostPair {
  id: string;
  label: string;
  optionA: { style: string; text: string };
  optionB: { style: string; text: string };
}

export const styleDiscoveryPairs: PostPair[] = [
  {
    id: "pair1",
    label: "Which opening style resonates more?",
    optionA: {
      style: "direct",
      text: "I lost $50,000 in 3 months.\n\nHere's what nobody tells you about bootstrapping.\n\nThread:",
    },
    optionB: {
      style: "reflective",
      text: "Last year I sat in my car for 20 minutes before walking into the office.\n\nI wasn't ready to face my team.\n\nBecause I knew the numbers didn't lie.",
    },
  },
  {
    id: "pair2",
    label: "Which format feels more like you?",
    optionA: {
      style: "list",
      text: "5 lessons from 10 years of hiring:\n\n1. Skills can be taught. Attitude can't.\n2. The best people don't need managing.\n3. Slow down. One bad hire costs 6 months.\n4. Culture add > culture fit.\n5. Trust references more than interviews.",
    },
    optionB: {
      style: "narrative",
      text: "My best hire almost didn't happen.\n\nShe bombed the technical interview. Completely.\n\nBut something about her questions made me pause.\n\nShe asked things nobody else had thought of.\n\nThat was 4 years ago. She's now my CTO.",
    },
  },
  {
    id: "pair3",
    label: "Which ending style do you prefer?",
    optionA: {
      style: "actionable",
      text: "Stop waiting for the perfect moment.\n\nStart today. Ship tomorrow. Learn always.\n\nWhat's one thing you've been putting off? Drop it in the comments.",
    },
    optionB: {
      style: "thoughtful",
      text: "I don't have all the answers.\n\nBut I know this: the people who figure it out aren't smarter.\n\nThey just refuse to stop trying.\n\nAnd maybe that's enough.",
    },
  },
  {
    id: "pair4",
    label: "Which tone feels more natural?",
    optionA: {
      style: "bold",
      text: "Hot take: Most LinkedIn advice is garbage.\n\n\"Post every day\" — burnout recipe\n\"Use hashtags\" — nobody searches those\n\"Network more\" — without strategy, it's noise\n\nHere's what actually works:",
    },
    optionB: {
      style: "warm",
      text: "A mentor told me something 5 years ago that I didn't understand until last week.\n\n\"Your network isn't about numbers. It's about who would answer your call at midnight.\"\n\nI've been thinking about that a lot lately.",
    },
  },
];
```

- [ ] **Step 2: Create ProgressBar component**

Create `/Users/luis/Documents/NoPersonAI/src/components/onboarding/ProgressBar.tsx`:

```tsx
export default function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs text-gray-500">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-200">
        <div
          className="h-2 rounded-full bg-blue-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create StepBasics component**

Create `/Users/luis/Documents/NoPersonAI/src/components/onboarding/StepBasics.tsx`:

```tsx
interface StepBasicsProps {
  name: string;
  audience: string;
  language: "de" | "en";
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

export default function StepBasics({
  name,
  audience,
  language,
  onChange,
  onNext,
}: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Let&apos;s get started
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred language
          </label>
          <div className="mt-2 flex gap-3">
            {(["en", "de"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onChange("language", lang)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  language === lang
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {lang === "en" ? "English" : "Deutsch"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Who is your target audience?
          </label>
          <p className="mt-1 text-xs text-gray-500">
            e.g. &quot;startup founders&quot;, &quot;HR managers&quot;,
            &quot;tech leads&quot;
          </p>
          <input
            type="text"
            value={audience}
            onChange={(e) => onChange("audience", e.target.value)}
            placeholder="founders, entrepreneurs, business owners"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        disabled={!name.trim() || !audience.trim()}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Create StepTone component**

Create `/Users/luis/Documents/NoPersonAI/src/components/onboarding/StepTone.tsx`:

```tsx
interface StepToneProps {
  selectedTones: string[];
  emojiUsage: string;
  onToggleTone: (tone: string) => void;
  onEmojiChange: (usage: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const toneOptions = [
  {
    id: "professional",
    label: "Professional & polished",
    description: "Clear, authoritative, credible",
  },
  {
    id: "casual",
    label: "Casual & conversational",
    description: "Friendly, approachable, relatable",
  },
  {
    id: "storytelling",
    label: "Storytelling & personal",
    description: "Narrative-driven, emotional, authentic",
  },
  {
    id: "controversial",
    label: "Bold & controversial",
    description: "Opinionated, provocative, thought-provoking",
  },
];

const emojiOptions = [
  { id: "none", label: "None", example: "Clean text only" },
  { id: "light", label: "Light", example: "Occasional emphasis" },
  { id: "heavy", label: "Heavy", example: "Expressive & visual" },
];

export default function StepTone({
  selectedTones,
  emojiUsage,
  onToggleTone,
  onEmojiChange,
  onNext,
  onBack,
}: StepToneProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your tone</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pick 1-2 that match how you want to sound
        </p>
      </div>

      <div className="space-y-3">
        {toneOptions.map((tone) => {
          const selected = selectedTones.includes(tone.id);
          return (
            <button
              key={tone.id}
              onClick={() => onToggleTone(tone.id)}
              className={`w-full rounded-lg border-2 px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">
                {tone.label}
              </div>
              <div className="text-xs text-gray-500">{tone.description}</div>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Emoji usage
        </label>
        <div className="mt-2 flex gap-3">
          {emojiOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onEmojiChange(opt.id)}
              className={`flex-1 rounded-lg border-2 px-3 py-3 text-center transition-colors ${
                emojiUsage === opt.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">
                {opt.label}
              </div>
              <div className="text-xs text-gray-500">{opt.example}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={selectedTones.length === 0}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Create StepStyle component**

Create `/Users/luis/Documents/NoPersonAI/src/components/onboarding/StepStyle.tsx`:

```tsx
"use client";

import { useState } from "react";
import {
  styleDiscoveryPairs,
  type PostPair,
} from "@/data/style-discovery-posts";

interface StepStyleProps {
  samplePosts: string[];
  styleDiscoveryAnswers: Record<string, string>;
  onSamplePostsChange: (posts: string[]) => void;
  onStyleDiscoveryAnswer: (pairId: string, choice: string) => void;
  writingExercise: string;
  onWritingExerciseChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepStyle({
  samplePosts,
  styleDiscoveryAnswers,
  onSamplePostsChange,
  onStyleDiscoveryAnswer,
  writingExercise,
  onWritingExerciseChange,
  onNext,
  onBack,
}: StepStyleProps) {
  const [mode, setMode] = useState<"choose" | "paste" | "discover" | null>(
    null
  );

  function updatePost(index: number, value: string) {
    const updated = [...samplePosts];
    updated[index] = value;
    onSamplePostsChange(updated);
  }

  function addPost() {
    if (samplePosts.length < 5) {
      onSamplePostsChange([...samplePosts, ""]);
    }
  }

  const hasContent =
    samplePosts.some((p) => p.trim().length > 0) ||
    Object.keys(styleDiscoveryAnswers).length >= 3 ||
    writingExercise.trim().length > 0;

  if (!mode) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your style</h2>
          <p className="mt-1 text-sm text-gray-600">
            Help us understand how you write
          </p>
        </div>

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

        <button
          onClick={onBack}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  if (mode === "paste") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Paste your LinkedIn posts
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            We&apos;ll analyze your writing patterns
          </p>
        </div>

        <div className="space-y-3">
          {samplePosts.map((post, i) => (
            <textarea
              key={i}
              value={post}
              onChange={(e) => updatePost(i, e.target.value)}
              placeholder={`Post ${i + 1}...`}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ))}
          {samplePosts.length < 5 && (
            <button
              onClick={addPost}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add another post
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setMode(null)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!hasContent}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Analyze my style
          </button>
        </div>
      </div>
    );
  }

  // mode === "discover"
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Find your style
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Pick which post feels more like you
        </p>
      </div>

      <div className="space-y-6">
        {styleDiscoveryPairs.map((pair: PostPair) => (
          <div key={pair.id} className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{pair.label}</p>
            <div className="space-y-2">
              {(["optionA", "optionB"] as const).map((key) => {
                const option = pair[key];
                const selected =
                  styleDiscoveryAnswers[pair.id] === option.style;
                return (
                  <button
                    key={key}
                    onClick={() =>
                      onStyleDiscoveryAnswer(pair.id, option.style)
                    }
                    className={`w-full rounded-lg border-2 px-3 py-3 text-left text-xs whitespace-pre-line transition-colors ${
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="text-sm font-medium text-gray-700">
            Quick exercise: Describe a recent win in 2-3 sentences
          </p>
          <textarea
            value={writingExercise}
            onChange={(e) => onWritingExerciseChange(e.target.value)}
            placeholder="e.g. Last week we landed our biggest client yet..."
            rows={3}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setMode(null)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!hasContent}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          Generate my DNA
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create StepDNAResult component**

Create `/Users/luis/Documents/NoPersonAI/src/components/onboarding/StepDNAResult.tsx`:

```tsx
interface StepDNAResultProps {
  profile: string;
  isLoading: boolean;
  adjustment: string;
  onAdjustmentChange: (text: string) => void;
  onRegenerate: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function StepDNAResult({
  profile,
  isLoading,
  adjustment,
  onAdjustmentChange,
  onRegenerate,
  onComplete,
  onBack,
}: StepDNAResultProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-600">Analyzing your writing style...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Writing DNA</h2>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s how we understand your voice
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm leading-relaxed text-gray-800">{profile}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">
          Not quite right? Tell us what to adjust:
        </p>
        <textarea
          value={adjustment}
          onChange={(e) => onAdjustmentChange(e.target.value)}
          placeholder="e.g. I'm more casual than that, I use a lot of humor..."
          rows={2}
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {adjustment.trim() && (
          <button
            onClick={onRegenerate}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Regenerate with adjustments
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Looks good — let&apos;s go!
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Create onboarding page (orchestrator)**

Create `/Users/luis/Documents/NoPersonAI/src/app/onboarding/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";
import StepBasics from "@/components/onboarding/StepBasics";
import StepTone from "@/components/onboarding/StepTone";
import StepStyle from "@/components/onboarding/StepStyle";
import StepDNAResult from "@/components/onboarding/StepDNAResult";

export default function OnboardingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(session?.user?.name || "");
  const [audience, setAudience] = useState("");
  const [language, setLanguage] = useState<"de" | "en">("en");
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [emojiUsage, setEmojiUsage] = useState("light");
  const [samplePosts, setSamplePosts] = useState<string[]>([]);
  const [styleDiscoveryAnswers, setStyleDiscoveryAnswers] = useState<
    Record<string, string>
  >({});
  const [writingExercise, setWritingExercise] = useState("");
  const [dnaProfile, setDnaProfile] = useState("");
  const [dnaLoading, setDnaLoading] = useState(false);
  const [adjustment, setAdjustment] = useState("");

  function handleBasicChange(field: string, value: string) {
    if (field === "name") setName(value);
    if (field === "audience") setAudience(value);
    if (field === "language") setLanguage(value as "de" | "en");
  }

  function toggleTone(tone: string) {
    setSelectedTones((prev) => {
      if (prev.includes(tone)) return prev.filter((t) => t !== tone);
      if (prev.length >= 2) return prev;
      return [...prev, tone];
    });
  }

  async function generateDNA() {
    setDnaLoading(true);
    setStep(4);

    const hasSamplePosts = samplePosts.some((p) => p.trim().length > 0);
    const hasDiscovery = Object.keys(styleDiscoveryAnswers).length > 0;

    let onboardingMethod = "sample_posts";
    if (hasSamplePosts && hasDiscovery) onboardingMethod = "both";
    else if (hasDiscovery) onboardingMethod = "style_discovery";

    const discoveryData =
      hasDiscovery || writingExercise.trim()
        ? { pairs: styleDiscoveryAnswers, writingExercise }
        : null;

    const res = await fetch("/api/dna", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tone: selectedTones[0] || "professional",
        audience,
        style: "mixed",
        emojiUsage,
        samplePosts: samplePosts.filter((p) => p.trim()),
        styleDiscoveryAnswers: discoveryData,
        onboardingMethod,
        preferredLanguage: language,
        regenerateProfile: true,
      }),
    });

    const data = await res.json();
    setDnaProfile(data.dna.generatedProfile);
    setDnaLoading(false);
  }

  async function handleRegenerate() {
    setDnaLoading(true);
    const res = await fetch("/api/dna", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tone: selectedTones[0] || "professional",
        audience,
        style: "mixed",
        emojiUsage,
        samplePosts: samplePosts.filter((p) => p.trim()),
        styleDiscoveryAnswers: {
          pairs: styleDiscoveryAnswers,
          writingExercise,
          adjustment,
        },
        preferredLanguage: language,
        regenerateProfile: true,
      }),
    });
    const data = await res.json();
    setDnaProfile(data.dna.generatedProfile);
    setDnaLoading(false);
    setAdjustment("");
  }

  function handleComplete() {
    router.push("/app");
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-sm space-y-8">
        <ProgressBar currentStep={step} totalSteps={4} />

        {step === 1 && (
          <StepBasics
            name={name}
            audience={audience}
            language={language}
            onChange={handleBasicChange}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepTone
            selectedTones={selectedTones}
            emojiUsage={emojiUsage}
            onToggleTone={toggleTone}
            onEmojiChange={setEmojiUsage}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepStyle
            samplePosts={samplePosts}
            styleDiscoveryAnswers={styleDiscoveryAnswers}
            onSamplePostsChange={setSamplePosts}
            onStyleDiscoveryAnswer={(pairId, choice) =>
              setStyleDiscoveryAnswers((prev) => ({
                ...prev,
                [pairId]: choice,
              }))
            }
            writingExercise={writingExercise}
            onWritingExerciseChange={setWritingExercise}
            onNext={generateDNA}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepDNAResult
            profile={dnaProfile}
            isLoading={dnaLoading}
            adjustment={adjustment}
            onAdjustmentChange={setAdjustment}
            onRegenerate={handleRegenerate}
            onComplete={handleComplete}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/onboarding/ src/components/onboarding/ src/data/
git commit -m "feat: add 4-step onboarding flow with style discovery and Writing DNA generation"
```

---

### Task 11: Generator Page

**Files:**
- Create: `src/app/app/page.tsx`, `src/components/generator/IdeaInput.tsx`, `src/components/generator/LinkedInPreview.tsx`, `src/components/generator/RefinementChips.tsx`, `src/components/generator/CustomInstruction.tsx`, `src/components/generator/PostCounter.tsx`

- [ ] **Step 1: Create IdeaInput component**

Create `/Users/luis/Documents/NoPersonAI/src/components/generator/IdeaInput.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

const placeholders = [
  "I just closed my first 6-figure deal...",
  "Why cold outreach is broken in 2026...",
  "3 lessons from firing my first employee...",
  "The best advice I ignored for years...",
  "I spent 2 hours on a task AI did in 5 minutes...",
];

interface IdeaInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export default function IdeaInput({
  value,
  onChange,
  onGenerate,
  isGenerating,
  disabled,
}: IdeaInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onGenerate();
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholders[placeholderIndex]}
        rows={3}
        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={onGenerate}
        disabled={!value.trim() || isGenerating || disabled}
        className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating...
          </span>
        ) : (
          "Generate post"
        )}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Create LinkedInPreview component**

Create `/Users/luis/Documents/NoPersonAI/src/components/generator/LinkedInPreview.tsx`:

```tsx
"use client";

import { useState } from "react";

interface LinkedInPreviewProps {
  post: string;
  userName: string;
  userImage?: string | null;
  isEditing: boolean;
  onEditToggle: () => void;
  onPostChange: (text: string) => void;
  onCopy: () => void;
  onSave: () => void;
  onRegenerate: () => void;
  copied: boolean;
}

export default function LinkedInPreview({
  post,
  userName,
  userImage,
  isEditing,
  onEditToggle,
  onPostChange,
  onCopy,
  onSave,
  onRegenerate,
  copied,
}: LinkedInPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const previewLimit = 210;
  const needsTruncation = !isEditing && post.length > previewLimit && !expanded;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
          {userImage ? (
            <img src={userImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-600">
              {userName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{userName}</div>
          <div className="text-xs text-gray-500">Just now</div>
        </div>
      </div>

      {/* Post content */}
      <div className="px-4 py-3">
        {isEditing ? (
          <textarea
            value={post}
            onChange={(e) => onPostChange(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div className="text-sm leading-relaxed text-gray-900 whitespace-pre-line">
            {needsTruncation ? (
              <>
                {post.slice(0, previewLimit)}...
                <button
                  onClick={() => setExpanded(true)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  see more
                </button>
              </>
            ) : (
              post
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
        <button
          onClick={onCopy}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
        <button
          onClick={onEditToggle}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
        <button
          onClick={onSave}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onRegenerate}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Redo
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create RefinementChips component**

Create `/Users/luis/Documents/NoPersonAI/src/components/generator/RefinementChips.tsx`:

```tsx
"use client";

import type { RefinementAction } from "@/lib/ai/types";

interface RefinementChipsProps {
  onRefine: (action: RefinementAction) => void;
  isRefining: boolean;
  language: "de" | "en";
}

const chips: { action: RefinementAction; en: string; de: string }[] = [
  { action: "stronger_hook", en: "Stronger hook", de: "Stärkerer Hook" },
  { action: "different_cta", en: "Different CTA", de: "Anderer CTA" },
  {
    action: "change_takeaway",
    en: "Different takeaway",
    de: "Andere Erkenntnis",
  },
  { action: "shorter", en: "Shorter", de: "Kürzer" },
  { action: "longer", en: "Longer", de: "Länger" },
  { action: "more_casual", en: "More casual", de: "Lockerer" },
  {
    action: "more_professional",
    en: "More professional",
    de: "Professioneller",
  },
  { action: "add_emojis", en: "Add emojis", de: "Mehr Emojis" },
  { action: "remove_emojis", en: "Remove emojis", de: "Ohne Emojis" },
  {
    action: "different_angle",
    en: "Different angle",
    de: "Anderer Blickwinkel",
  },
];

export default function RefinementChips({
  onRefine,
  isRefining,
  language,
}: RefinementChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {chips.map((chip) => (
        <button
          key={chip.action}
          onClick={() => onRefine(chip.action)}
          disabled={isRefining}
          className="shrink-0 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
        >
          {language === "de" ? chip.de : chip.en}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Create CustomInstruction component**

Create `/Users/luis/Documents/NoPersonAI/src/components/generator/CustomInstruction.tsx`:

```tsx
"use client";

import { useState } from "react";

interface CustomInstructionProps {
  onSubmit: (instruction: string) => void;
  isRefining: boolean;
}

export default function CustomInstruction({
  onSubmit,
  isRefining,
}: CustomInstructionProps) {
  const [expanded, setExpanded] = useState(false);
  const [instruction, setInstruction] = useState("");

  function handleSubmit() {
    if (instruction.trim()) {
      onSubmit(instruction.trim());
      setInstruction("");
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-blue-600 hover:text-blue-700"
      >
        Custom instruction...
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Tell the AI what to change..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        disabled={!instruction.trim() || isRefining}
        className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Apply
      </button>
    </div>
  );
}
```

- [ ] **Step 5: Create PostCounter component**

Create `/Users/luis/Documents/NoPersonAI/src/components/generator/PostCounter.tsx`:

```tsx
interface PostCounterProps {
  used: number;
  limit: number;
  plan: "free" | "pro";
}

export default function PostCounter({ used, limit, plan }: PostCounterProps) {
  if (plan === "pro") return null;

  const remaining = limit - used;
  const isLow = remaining <= 1;

  return (
    <div
      className={`text-center text-xs ${isLow ? "text-orange-600" : "text-gray-500"}`}
    >
      {remaining > 0
        ? `${used} of ${limit} free posts used this month`
        : "Monthly limit reached"}
    </div>
  );
}
```

- [ ] **Step 6: Create Generator page (orchestrator)**

Create `/Users/luis/Documents/NoPersonAI/src/app/app/page.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import IdeaInput from "@/components/generator/IdeaInput";
import LinkedInPreview from "@/components/generator/LinkedInPreview";
import RefinementChips from "@/components/generator/RefinementChips";
import CustomInstruction from "@/components/generator/CustomInstruction";
import PostCounter from "@/components/generator/PostCounter";
import type { RefinementAction } from "@/lib/ai/types";

interface GeneratedPost {
  id: string;
  post: string;
  language: "de" | "en";
  postsUsed: number;
}

export default function GeneratorPage() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [currentPost, setCurrentPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [postsUsed, setPostsUsed] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setLimitReached(false);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    if (res.status === 403) {
      setLimitReached(true);
      setIsGenerating(false);
      return;
    }

    const data = await res.json();
    setResult(data);
    setCurrentPost(data.post);
    setPostsUsed(data.postsUsed);
    setIsGenerating(false);
  }, [input]);

  async function refine(action: RefinementAction, customInstruction?: string) {
    if (!result) return;
    setIsRefining(true);

    const res = await fetch("/api/refine", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: result.id,
        action,
        customInstruction: customInstruction || undefined,
      }),
    });

    const data = await res.json();
    setCurrentPost(data.post);
    setIsRefining(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(currentPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Create a post</h1>

      <PostCounter used={postsUsed} limit={5} plan="free" />

      <IdeaInput
        value={input}
        onChange={setInput}
        onGenerate={generate}
        isGenerating={isGenerating}
        disabled={limitReached}
      />

      {limitReached && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
          <p className="text-sm font-medium text-orange-800">
            You&apos;ve reached your monthly limit
          </p>
          <p className="mt-1 text-xs text-orange-600">
            Upgrade to Pro for unlimited posts
          </p>
          <button className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      )}

      {result && currentPost && (
        <div className="space-y-3">
          <LinkedInPreview
            post={currentPost}
            userName={session?.user?.name || "You"}
            userImage={session?.user?.image}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            onPostChange={setCurrentPost}
            onCopy={handleCopy}
            onSave={() => {}}
            onRegenerate={generate}
            copied={copied}
          />

          {!isEditing && (
            <>
              <RefinementChips
                onRefine={(action) => refine(action)}
                isRefining={isRefining}
                language={result.language}
              />
              <CustomInstruction
                onSubmit={(instruction) => refine("custom", instruction)}
                isRefining={isRefining}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/app/page.tsx src/components/generator/
git commit -m "feat: add generator page with LinkedIn preview and refinement controls"
```

---

### Task 12: History Page

**Files:**
- Create: `src/app/app/history/page.tsx`

- [ ] **Step 1: Create History page**

Create `/Users/luis/Documents/NoPersonAI/src/app/app/history/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

interface HistoryPost {
  id: string;
  input: string;
  output: string;
  language: "de" | "en";
  isFavorite: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const [posts, setPosts] = useState<HistoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [langFilter, setLangFilter] = useState<"all" | "de" | "en">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [filter, langFilter]);

  async function fetchPosts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "favorites") params.set("favorites", "true");
    if (langFilter !== "all") params.set("language", langFilter);

    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts);
    setLoading(false);
  }

  async function toggleFavorite(id: string, current: boolean) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !current } : p))
    );
  }

  function copyPost(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getHook(text: string): string {
    const firstLine = text.split("\n")[0];
    return firstLine.length > 80 ? firstLine.slice(0, 80) + "..." : firstLine;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">History</h1>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "favorites"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Favorites
        </button>
        <div className="flex-1" />
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value as "all" | "de" | "en")}
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs"
        >
          <option value="all">All languages</option>
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No posts yet. Create your first one!
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-gray-200 bg-white"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === post.id ? null : post.id)
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {getHook(post.output)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}{" "}
                    <span className="uppercase">{post.language}</span>
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(post.id, post.isFavorite);
                  }}
                  className="shrink-0 text-lg"
                >
                  {post.isFavorite ? (
                    <span className="text-yellow-500">&#9733;</span>
                  ) : (
                    <span className="text-gray-300">&#9734;</span>
                  )}
                </button>
              </button>

              {expandedId === post.id && (
                <div className="border-t border-gray-100 px-4 py-3">
                  <p className="whitespace-pre-line text-sm text-gray-800">
                    {post.output}
                  </p>
                  <button
                    onClick={() => copyPost(post.id, post.output)}
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    {copiedId === post.id ? "Copied!" : "Copy to clipboard"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/app/history/page.tsx
git commit -m "feat: add post history page with filters and favorites"
```

---

### Task 13: Writing DNA Settings Page

**Files:**
- Create: `src/app/app/dna/page.tsx`

- [ ] **Step 1: Create DNA settings page**

Create `/Users/luis/Documents/NoPersonAI/src/app/app/dna/page.tsx`:

```tsx
"use client";

import { useState, useEffect } from "react";

interface DNAData {
  tone: string;
  audience: string;
  style: string;
  emojiUsage: string;
  samplePosts: string[];
  generatedProfile: string;
  onboardingMethod: string;
  preferredLanguage: string;
}

export default function DNAPage() {
  const [dna, setDna] = useState<DNAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [emojiUsage, setEmojiUsage] = useState("");
  const [samplePosts, setSamplePosts] = useState<string[]>([]);

  useEffect(() => {
    fetchDNA();
  }, []);

  async function fetchDNA() {
    const res = await fetch("/api/dna");
    const data = await res.json();
    setDna(data.dna);
    if (data.dna) {
      setTone(data.dna.tone);
      setAudience(data.dna.audience);
      setEmojiUsage(data.dna.emojiUsage);
      setSamplePosts(data.dna.samplePosts);
    }
    setLoading(false);
  }

  async function handleSave(regenerate: boolean) {
    setSaving(true);
    const res = await fetch("/api/dna", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tone,
        audience,
        style: dna?.style || "mixed",
        emojiUsage,
        samplePosts: samplePosts.filter((p) => p.trim()),
        preferredLanguage: dna?.preferredLanguage || "en",
        regenerateProfile: regenerate,
      }),
    });
    const data = await res.json();
    setDna(data.dna);
    setSaving(false);
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!dna) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Complete onboarding first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Your Writing DNA</h1>

      {/* Profile summary */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm leading-relaxed text-gray-800">
          {dna.generatedProfile}
        </p>
      </div>

      {/* Current settings */}
      {!editing ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tone</span>
              <span className="font-medium text-gray-900 capitalize">
                {dna.tone}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Audience</span>
              <span className="font-medium text-gray-900">{dna.audience}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Emojis</span>
              <span className="font-medium text-gray-900 capitalize">
                {dna.emojiUsage}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sample posts</span>
              <span className="font-medium text-gray-900">
                {dna.samplePosts.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-900 capitalize">
                {dna.onboardingMethod.replace("_", " ")}
              </span>
            </div>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit settings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="storytelling">Storytelling</option>
              <option value="controversial">Controversial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target audience
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Emoji usage
            </label>
            <select
              value={emojiUsage}
              onChange={(e) => setEmojiUsage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="none">None</option>
              <option value="light">Light</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sample posts ({samplePosts.length}/5)
            </label>
            {samplePosts.map((post, i) => (
              <textarea
                key={i}
                value={post}
                onChange={(e) => {
                  const updated = [...samplePosts];
                  updated[i] = e.target.value;
                  setSamplePosts(updated);
                }}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            ))}
            {samplePosts.length < 5 && (
              <button
                onClick={() => setSamplePosts([...samplePosts, ""])}
                className="mt-1 text-xs text-blue-600"
              >
                + Add post
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
            >
              Save
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
            >
              {saving ? "..." : "Save & regenerate DNA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/app/dna/page.tsx
git commit -m "feat: add Writing DNA settings page with edit and regenerate"
```

---

### Task 14: Account Page

**Files:**
- Create: `src/app/app/account/page.tsx`

- [ ] **Step 1: Create Account page**

Create `/Users/luis/Documents/NoPersonAI/src/app/app/account/page.tsx`:

```tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export default function AccountPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Account</h1>

      {/* User info */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-300 overflow-hidden">
            {session?.user?.image ? (
              <img
                src={session.user.image}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-bold text-gray-600">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
            )}
          </div>
          <div>
            <div className="text-sm font-semibold text-gray-900">
              {session?.user?.name || "User"}
            </div>
            <div className="text-xs text-gray-500">{session?.user?.email}</div>
          </div>
        </div>
      </div>

      {/* Plan status */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Plan</span>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
            Free
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Posts this month</span>
          <span className="font-medium text-gray-900">— / 5</span>
        </div>
        <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
          Upgrade to Pro — €29/mo
        </button>
        <p className="text-center text-xs text-gray-500">
          Unlimited posts, priority speed
        </p>
      </div>

      {/* Sign out */}
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Sign out
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/app/account/page.tsx
git commit -m "feat: add account page with plan status and upgrade stub"
```

---

### Task 15: NextAuth SessionProvider Setup

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/components/Providers.tsx`

- [ ] **Step 1: Create Providers wrapper**

Create `/Users/luis/Documents/NoPersonAI/src/components/Providers.tsx`:

```tsx
"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Update root layout to wrap with Providers**

Modify `/Users/luis/Documents/NoPersonAI/src/app/layout.tsx` — wrap `{children}` with `<Providers>`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoPersonAI — LinkedIn Posts That Sound Like You",
  description:
    "Generate authentic LinkedIn posts with AI that learns your writing style. No generic content. Your voice, amplified.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/components/Providers.tsx src/app/layout.tsx
git commit -m "feat: add NextAuth SessionProvider to root layout"
```

---

### Task 16: Landing Page

**Files:**
- Create: `src/app/page.tsx` (replace default), `src/components/landing/Hero.tsx`, `src/components/landing/PainPoints.tsx`, `src/components/landing/HowItWorks.tsx`, `src/components/landing/WhatsAppTeaser.tsx`, `src/components/landing/PostPreviewSection.tsx`, `src/components/landing/WritingDNASection.tsx`, `src/components/landing/PricingSection.tsx`, `src/components/landing/FAQ.tsx`, `src/components/landing/FinalCTA.tsx`

- [ ] **Step 1: Create Hero component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/Hero.tsx`:

```tsx
import Link from "next/link";

export default function Hero() {
  return (
    <section className="px-4 py-16 text-center md:py-24">
      <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
        LinkedIn posts that sound like{" "}
        <span className="text-blue-600">you actually wrote them</span>
      </h1>
      <p className="mx-auto mt-4 max-w-lg text-base text-gray-600 md:text-lg">
        AI that learns your voice, not just your topics. No more generic content
        that screams &quot;written by ChatGPT.&quot;
      </p>
      <Link
        href="/auth/signin"
        className="mt-8 inline-block rounded-xl bg-blue-600 px-8 py-4 text-base font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Start for free
      </Link>
      <p className="mt-3 text-sm text-gray-500">
        5 free posts per month. No credit card required.
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Create PainPoints component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/PainPoints.tsx`:

```tsx
const painPoints = [
  {
    problem: "Generic AI output",
    solution: "Our Writing DNA system learns YOUR specific voice and patterns",
  },
  {
    problem: "No time to write",
    solution: "Enter one sentence, get a complete post in seconds",
  },
  {
    problem: "Inconsistent posting",
    solution: "Generate weeks of content in one sitting",
  },
];

export default function PainPoints() {
  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sound familiar?
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {painPoints.map((item) => (
            <div
              key={item.problem}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="text-sm font-semibold text-red-600">
                {item.problem}
              </p>
              <p className="mt-2 text-sm text-gray-600">{item.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create HowItWorks component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/HowItWorks.tsx`:

```tsx
const steps = [
  {
    number: "1",
    title: "Enter your idea",
    description: "Just 1-2 sentences about what you want to share",
  },
  {
    number: "2",
    title: "AI writes in your voice",
    description:
      "Our 5-step engine analyzes, structures, and writes like you would",
  },
  {
    number: "3",
    title: "Copy & post",
    description: "Refine with one tap, then copy straight to LinkedIn",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create WhatsAppTeaser component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/WhatsAppTeaser.tsx`:

```tsx
"use client";

import { useState } from "react";

export default function WhatsAppTeaser() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: Store email for WhatsApp early access (will be implemented in sub-project 2)
    setSubmitted(true);
  }

  return (
    <section className="bg-green-50 px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-500">
          <svg className="h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Coming soon: WhatsApp to LinkedIn
        </h2>
        <p className="mt-3 text-base text-gray-600">
          Send a voice note or text via WhatsApp. Get a ready-to-post LinkedIn
          post back. No app needed.
        </p>

        {submitted ? (
          <p className="mt-6 text-sm font-medium text-green-700">
            You&apos;re on the early access list!
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
            />
            <button
              type="submit"
              className="shrink-0 rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              Get early access
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Create PostPreviewSection component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/PostPreviewSection.tsx`:

```tsx
export default function PostPreviewSection() {
  const examplePost = `I hired 3 wrong people in 6 months.

It nearly killed my startup.

But here's what nobody told me about hiring:

1. Speed kills. Slow down.
2. Culture fit matters more than skills.
3. Trust your gut — it's smarter than your spreadsheet.
4. The best people aren't looking. Go find them.
5. One great hire > three okay ones.

The cost of a bad hire isn't just money.
It's momentum. Morale. Months you can't get back.

Slow down. The right person is worth the wait.

#hiring #startups #leadership`;

  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-lg">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          See the difference
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          A real post generated by our AI. Not a template — written for a
          specific user&apos;s voice.
        </p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 px-4 pt-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-bold text-blue-600">A</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                Alex M.
              </div>
              <div className="text-xs text-gray-500">
                Startup Founder &middot; Just now
              </div>
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="whitespace-pre-line text-sm leading-relaxed text-gray-900">
              {examplePost}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Create WritingDNASection component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/WritingDNASection.tsx`:

```tsx
export default function WritingDNASection() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          We learn how YOU write
        </h2>
        <p className="mt-3 text-base text-gray-600">
          Our Writing DNA system analyzes your tone, sentence patterns, emoji
          usage, and storytelling style to create a unique voice profile.
        </p>
        <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-5 text-left">
          <p className="text-xs font-medium uppercase text-blue-600">
            Example Writing DNA
          </p>
          <p className="mt-2 text-sm italic leading-relaxed text-gray-700">
            &quot;This person writes in short, punchy sentences. Professional
            but warm. They lead with personal experience and end with
            actionable advice. Light emoji use — only for emphasis, never
            decoration. Vocabulary is accessible, not academic. Favorite
            structure: hook, story, lesson.&quot;
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Create PricingSection component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/PricingSection.tsx`:

```tsx
import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    features: [
      "5 posts per month",
      "Unlimited refinements",
      "Writing DNA profile",
      "Full post history",
    ],
    cta: "Start for free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "€29",
    period: "/month",
    features: [
      "Unlimited posts",
      "Unlimited refinements",
      "Writing DNA profile",
      "Full post history",
      "Priority generation speed",
    ],
    cta: "Start for free, upgrade later",
    highlight: true,
  },
];

export default function PricingSection() {
  return (
    <section className="px-4 py-16" id="pricing">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Simple pricing
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 p-6 ${
                plan.highlight
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500"> {plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signin"
                className={`mt-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Create FAQ component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/FAQ.tsx`:

```tsx
"use client";

import { useState } from "react";

const faqs = [
  {
    q: "Is this just ChatGPT with a wrapper?",
    a: "No. We use a proprietary 5-step AI chain that analyzes your intent, selects the optimal structure, writes in your voice, and self-evaluates before delivering. Generic AI tools give you generic output. We give you YOUR voice.",
  },
  {
    q: "Will the posts really sound like me?",
    a: "Yes. Our Writing DNA system learns your tone, sentence patterns, emoji usage, and storytelling style from your past posts or through a guided discovery process. The more you use it, the better it gets.",
  },
  {
    q: "Can I use it in German?",
    a: "Absolutely. NoPersonAI works in both German and English. It auto-detects your input language and generates in the same language. You can also override per post.",
  },
  {
    q: "What about WhatsApp?",
    a: "Our WhatsApp integration is coming soon. You'll be able to send a voice note or text message via WhatsApp and receive a ready-to-post LinkedIn post back. Sign up for early access above.",
  },
  {
    q: "Is my data safe?",
    a: "Your posts and writing profile are stored securely and never shared. We don't use your content to train AI models. You can delete your account and all data at any time.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-lg">
        <h2 className="text-center text-2xl font-bold text-gray-900">FAQ</h2>
        <div className="mt-8 space-y-2">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="text-sm font-medium text-gray-900">
                  {faq.q}
                </span>
                <svg
                  className={`h-4 w-4 shrink-0 text-gray-500 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              {openIndex === i && (
                <div className="px-4 pb-3">
                  <p className="text-sm text-gray-600">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 9: Create FinalCTA component**

Create `/Users/luis/Documents/NoPersonAI/src/components/landing/FinalCTA.tsx`:

```tsx
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="bg-blue-600 px-4 py-16 text-center">
      <h2 className="text-2xl font-bold text-white">
        Ready to sound like yourself?
      </h2>
      <p className="mt-3 text-base text-blue-100">
        Start generating authentic LinkedIn posts in under 2 minutes.
      </p>
      <Link
        href="/auth/signin"
        className="mt-8 inline-block rounded-xl bg-white px-8 py-4 text-base font-medium text-blue-600 hover:bg-blue-50 transition-colors"
      >
        Start for free
      </Link>
    </section>
  );
}
```

- [ ] **Step 10: Assemble landing page**

Replace `/Users/luis/Documents/NoPersonAI/src/app/page.tsx` with:

```tsx
import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatsAppTeaser from "@/components/landing/WhatsAppTeaser";
import PostPreviewSection from "@/components/landing/PostPreviewSection";
import WritingDNASection from "@/components/landing/WritingDNASection";
import PricingSection from "@/components/landing/PricingSection";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";

export default function LandingPage() {
  return (
    <main>
      <Hero />
      <PainPoints />
      <HowItWorks />
      <WhatsAppTeaser />
      <PostPreviewSection />
      <WritingDNASection />
      <PricingSection />
      <FAQ />
      <FinalCTA />
    </main>
  );
}
```

- [ ] **Step 11: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/page.tsx src/components/landing/
git commit -m "feat: add SEO-optimized landing page with all sections and WhatsApp teaser"
```

---

### Task 17: SEO — Meta, Sitemap, Structured Data

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] **Step 1: Add comprehensive metadata to root layout**

Update the metadata export in `/Users/luis/Documents/NoPersonAI/src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: {
    default: "NoPersonAI — LinkedIn Posts That Sound Like You",
    template: "%s | NoPersonAI",
  },
  description:
    "Generate authentic LinkedIn posts with AI that learns your writing style. No generic content. Your voice, amplified. Free to start.",
  keywords: [
    "LinkedIn Post Generator",
    "LinkedIn Post erstellen",
    "KI LinkedIn Posts",
    "LinkedIn Beitrag schreiben",
    "AI LinkedIn writer",
    "LinkedIn content creator",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "de_DE",
    siteName: "NoPersonAI",
    title: "NoPersonAI — LinkedIn Posts That Sound Like You",
    description:
      "AI that learns your voice, not just your topics. Generate authentic LinkedIn posts in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoPersonAI — LinkedIn Posts That Sound Like You",
    description:
      "AI that learns your voice, not just your topics. Generate authentic LinkedIn posts in seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

- [ ] **Step 2: Create sitemap**

Create `/Users/luis/Documents/NoPersonAI/src/app/sitemap.ts`:

```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://nopersonai.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
```

- [ ] **Step 3: Create robots.txt**

Create `/Users/luis/Documents/NoPersonAI/src/app/robots.ts`:

```typescript
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/api/", "/onboarding/"],
    },
    sitemap: "https://nopersonai.com/sitemap.xml",
  };
}
```

- [ ] **Step 4: Add JSON-LD structured data to landing page**

Update `/Users/luis/Documents/NoPersonAI/src/app/page.tsx` — add structured data script before `<main>`:

```tsx
import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatsAppTeaser from "@/components/landing/WhatsAppTeaser";
import PostPreviewSection from "@/components/landing/PostPreviewSection";
import WritingDNASection from "@/components/landing/WritingDNASection";
import PricingSection from "@/components/landing/PricingSection";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NoPersonAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered LinkedIn post generator that learns your writing style",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      name: "Free",
    },
    {
      "@type": "Offer",
      price: "29",
      priceCurrency: "EUR",
      name: "Pro",
      billingIncrement: "P1M",
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <Hero />
        <PainPoints />
        <HowItWorks />
        <WhatsAppTeaser />
        <PostPreviewSection />
        <WritingDNASection />
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}
```

- [ ] **Step 5: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/layout.tsx src/app/page.tsx src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: add SEO metadata, sitemap, robots.txt, and JSON-LD structured data"
```

---

### Task 18: Pricing Page

**Files:**
- Create: `src/app/pricing/page.tsx`

- [ ] **Step 1: Create pricing page with SEO metadata**

Create `/Users/luis/Documents/NoPersonAI/src/app/pricing/page.tsx`:

```tsx
import type { Metadata } from "next";
import PricingSection from "@/components/landing/PricingSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "NoPersonAI pricing plans. Start free with 5 posts per month, or upgrade to Pro for unlimited LinkedIn posts.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-gray-900">
          NoPersonAI
        </Link>
        <Link
          href="/auth/signin"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Sign in
        </Link>
      </header>
      <PricingSection />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/pricing/page.tsx
git commit -m "feat: add dedicated pricing page with SEO metadata"
```

---

### Task 19: Environment Setup + Database Migration

**Files:**
- Modify: `.env.local` (manually by developer)

- [ ] **Step 1: Copy env example to local**

```bash
cd /Users/luis/Documents/NoPersonAI
cp .env.example .env.local
```

- [ ] **Step 2: Set up Neon database**

Go to https://neon.tech, create a project, and copy the connection string into `.env.local` as `DATABASE_URL`.

- [ ] **Step 3: Run database migration**

```bash
cd /Users/luis/Documents/NoPersonAI
npx prisma db push
```

Expected: `Your database is now in sync with your Prisma schema.`

- [ ] **Step 4: Generate Prisma client**

```bash
cd /Users/luis/Documents/NoPersonAI
npx prisma generate
```

- [ ] **Step 5: Add remaining env vars**

Fill in `.env.local`:
- `NEXTAUTH_SECRET`: Run `openssl rand -base64 32` and paste the result
- `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`: From Google Cloud Console → OAuth 2.0 credentials
- `ANTHROPIC_API_KEY`: From console.anthropic.com
- Email settings: Sign up at resend.com for magic link delivery

- [ ] **Step 6: Verify the app starts**

```bash
cd /Users/luis/Documents/NoPersonAI
npm run dev
```

Open http://localhost:3000 — landing page should render.

- [ ] **Step 7: Run tests**

```bash
cd /Users/luis/Documents/NoPersonAI
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 8: Commit any remaining changes**

```bash
cd /Users/luis/Documents/NoPersonAI
git add -A
git commit -m "chore: finalize project setup and verify build"
```

---

### Task 20: Tailwind Scrollbar Hide Utility + Global Styles

**Files:**
- Modify: `tailwind.config.ts`, `src/app/globals.css`

- [ ] **Step 1: Add scrollbar-hide utility**

Add to `/Users/luis/Documents/NoPersonAI/src/app/globals.css` at the end:

```css
/* Hide scrollbar for refinement chips */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Safe area padding for bottom nav on iOS */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/luis/Documents/NoPersonAI
git add src/app/globals.css
git commit -m "feat: add scrollbar-hide and iOS safe area utilities"
```
