# NoPersonAI

A LinkedIn ghostwriter that sounds exactly like you. Send a rough idea or a WhatsApp voice note — get a ready-to-post LinkedIn post back in your voice.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- **Styling:** Tailwind CSS 4 with design tokens in `src/app/globals.css`
- **Database:** PostgreSQL (Neon) via Prisma 7 + `@prisma/adapter-neon`
- **Auth:** NextAuth 4 — Google OAuth + Email magic link (Resend SMTP)
- **AI:** Anthropic Claude (Sonnet 4.6 for the chain, Opus 4.7 for polish/DNA)
- **Voice:** OpenAI Whisper for transcription
- **WhatsApp:** Twilio WhatsApp Sandbox (provider abstraction in `src/lib/whatsapp/`)

## Local development

```bash
npm install
cp .env.example .env  # fill in all values — see below
npx prisma migrate dev --name init  # first run only
npm run dev
```

Open http://localhost:3000.

## Environment variables

See `.env.example` for the complete list. Required for local dev:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string with `?sslmode=require` |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; production URL on Vercel |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google Cloud Console → OAuth 2.0 Client ID. **Authorized redirect URI:** `${NEXTAUTH_URL}/api/auth/callback/google` |
| `EMAIL_SERVER_*` / `EMAIL_FROM` | Resend SMTP credentials for magic-link emails |
| `ANTHROPIC_API_KEY` | Claude API key |
| `OPENAI_API_KEY` | For Whisper voice transcription |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | From Twilio console |
| `TWILIO_WHATSAPP_FROM` | `whatsapp:+14155238886` for sandbox |
| `TWILIO_WHATSAPP_SANDBOX_JOIN_CODE` | The `join <word>` keyword from your Twilio sandbox |

## WhatsApp setup (Twilio sandbox, 10 min)

1. Sign in to [Twilio Console](https://console.twilio.com) → Messaging → WhatsApp Sandbox.
2. Note the sandbox number (e.g., `+14155238886`) and the **join code** (e.g., `join peculiar-tiger`). Set both in `.env`.
3. Configure **"When a message comes in"** to:
   ```
   https://YOUR_NGROK_OR_DEPLOY/api/whatsapp/webhook
   ```
   Method: `HTTP POST`.
4. For local dev, tunnel with `ngrok http 3000` and paste the HTTPS URL into Twilio.
5. End-users: sign up on the site → go to `/app/whatsapp` → enter their phone → follow the two-step join + verification flow.

Twilio sandbox requires each recipient to opt in once (`join <word>`). This disappears after production Business verification — a documented follow-up for launch.

## Claude model config

All model IDs are centralized in `src/lib/ai/models.ts`:

```ts
export const MODELS = {
  chain: "claude-sonnet-4-6",   // fast, every chain step
  polish: "claude-opus-4-7",    // quality, DNA profile + retry
};
```

The stable preamble (writing profile + sample posts) is passed with `cache_control: { type: "ephemeral" }` to benefit from Anthropic prompt caching across chain steps.

## Deploying to Vercel

1. Push to GitHub, import to Vercel.
2. Set **all** env vars from `.env.example` in Vercel project settings.
3. Add production Google OAuth redirect URI in Google Cloud Console:
   ```
   https://YOUR_DOMAIN/api/auth/callback/google
   ```
4. Update Twilio webhook to `https://YOUR_DOMAIN/api/whatsapp/webhook`.
5. Run the first migration against the prod DB:
   ```bash
   DATABASE_URL="postgres://..." npx prisma migrate deploy
   ```
6. Deploy. `vercel.json` already extends WhatsApp/transcribe/generate routes to 60s.

## Scripts

```bash
npm run dev        # local dev server
npm run build      # prisma generate + next build
npm run start      # production server
npm run lint       # eslint
npm run test:run   # vitest (AI chain unit tests)
```

## Project layout

```
src/
├─ app/
│  ├─ layout.tsx, globals.css          # root + design tokens
│  ├─ page.tsx                          # landing page
│  ├─ pricing/                          # /pricing
│  ├─ auth/{signin, verify-request, error}/
│  ├─ onboarding/                       # 4-step DNA setup
│  ├─ app/                              # authenticated shell
│  │   ├─ layout.tsx                    # session guard + sidebar/bottomnav
│  │   ├─ page.tsx                      # generator
│  │   ├─ whatsapp/                     # WhatsApp connect + upsell
│  │   ├─ history/  dna/  account/
│  ├─ api/
│  │   ├─ auth/[...nextauth]/           # NextAuth
│  │   ├─ generate, refine, dna, posts/ # existing
│  │   ├─ demo/                         # ungated landing-page demo
│  │   ├─ transcribe/                   # browser voice → text
│  │   ├─ whatsapp/{webhook,connect,disconnect,messages}/
│  └─ icon.tsx  apple-icon.tsx  opengraph-image.tsx
├─ components/
│  ├─ ui/                               # Button, Input, Dialog, Toast, Card, …
│  ├─ brand/Logo.tsx
│  ├─ landing/                          # all landing page sections
│  ├─ app/BottomNav.tsx                 # + SideNav for ≥md
│  ├─ generator/                        # IdeaInput, VoiceRecorder, …
│  ├─ onboarding/
├─ lib/
│  ├─ auth.ts, auth-guard.ts, db.ts
│  ├─ ai/{engine, prompts, dna, refine, models, types}.ts
│  ├─ whatsapp/{provider, twilio, index}.ts
│  ├─ transcription.ts
│  ├─ email/templates.ts
│  ├─ utils.ts                          # cn() helper
```

## Follow-ups for launch

- **Stripe**: `/app/account` upgrade CTA is currently a stub. Wire up a Stripe Checkout session and webhook to flip `User.plan` to `pro`.
- **Twilio Business verification**: move off the sandbox so recipients don't need to `join <word>`.
- **Rate limiting at the edge**: the `/api/demo` in-memory rate limit is fine single-region but swap to Upstash or Vercel KV when scaling.
