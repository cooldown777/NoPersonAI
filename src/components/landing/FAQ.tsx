"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "How is this different from ChatGPT?",
    a: "ChatGPT produces generic output. NoPersonAI trains a Writing DNA profile from your own posts and stylistic preferences, then runs a 5-step generation chain that grades every draft for how human it sounds, how well it matches your voice, and how native it feels on LinkedIn. You get drafts you'd actually post.",
  },
  {
    q: "How does the WhatsApp integration work?",
    a: "Once you're on Pro, connect your phone number inside the app. Send a text message or a voice note to the NoPersonAI WhatsApp number and you'll receive a ready-to-post LinkedIn draft in under 30 seconds — in your voice, in your language. German and English are auto-detected.",
  },
  {
    q: "Is my voice data stored?",
    a: "We transcribe voice notes with industry-standard speech-to-text (OpenAI Whisper), then discard the audio. Only the transcribed text is saved alongside the generated post in your history. You can delete any post (and its source) from your history at any time.",
  },
  {
    q: "What about German (Deutsch)?",
    a: "Full native support. Our AI chain detects the language of your input automatically and writes in that language. You can also set your preferred default in Writing DNA settings.",
  },
  {
    q: "Can LinkedIn detect AI-generated posts?",
    a: "LinkedIn does not penalize AI-assisted writing. But their audiences do penalize obviously generic content. That's the problem NoPersonAI solves — drafts that read like you, not like a template.",
  },
  {
    q: "Is there a free plan?",
    a: "Yes. Free forever, 5 posts per month, Writing DNA included. No credit card required.",
  },
  {
    q: "GDPR / data handling",
    a: "Data is stored on EU-hosted PostgreSQL (Neon). You can export or delete your account and all associated data at any time from the account page.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="bg-white scroll-mt-20">
      <div className="mx-auto max-w-3xl px-4 py-14 md:px-6 md:py-24">
        <div className="text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-brand-600">
            FAQ
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Questions, answered.
          </h2>
        </div>

        <div className="mt-10 divide-y divide-zinc-100 rounded-3xl border border-zinc-200 bg-white">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-zinc-50"
                >
                  <span className="font-display text-base font-semibold text-zinc-900 md:text-lg">
                    {faq.q}
                  </span>
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      isOpen
                        ? "border-brand-200 bg-brand-50 text-brand-600"
                        : "border-zinc-200 text-zinc-500",
                    )}
                  >
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm leading-relaxed text-zinc-600">{faq.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
