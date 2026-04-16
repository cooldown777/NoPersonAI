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
