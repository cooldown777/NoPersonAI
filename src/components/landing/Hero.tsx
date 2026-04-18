"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function Hero() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function onGenerate() {
    if (input.trim().length < 4) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Generation failed");
      } else {
        setResult(data.post);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="relative overflow-hidden bg-brand-radial">
      <div className="absolute inset-0 bg-grid opacity-60" />
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-10 md:px-6 md:pb-24 md:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="brand" className="mb-5">
            <Sparkles className="h-3 w-3" />
            Now with WhatsApp voice notes
          </Badge>
          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-zinc-900 md:text-6xl">
            A LinkedIn ghostwriter that{" "}
            <span className="relative inline-block">
              <span className="relative z-10 bg-gradient-to-br from-brand-600 to-brand-800 bg-clip-text text-transparent">
                sounds exactly like you
              </span>
            </span>
            .
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-zinc-600 md:text-lg">
            Send a rough idea or a voice note via WhatsApp. Get a ready-to-post
            LinkedIn post in your voice — not generic AI slop.
          </p>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth/signin" className="w-full sm:w-auto">
              <Button size="xl" rightIcon={<ArrowRight className="h-4 w-4" />} fullWidth>
                Start free — 5 posts/month
              </Button>
            </Link>
            <Link href="#demo" className="w-full sm:w-auto">
              <Button size="xl" variant="outline" fullWidth>
                See the demo
              </Button>
            </Link>
          </div>
          <p className="mt-3 text-xs text-zinc-500">No credit card · 60-second sign-up</p>
        </div>

        <div id="demo" className="mx-auto mt-14 max-w-2xl scroll-mt-20">
          <div className="rounded-3xl border border-zinc-200 bg-white/80 p-3 shadow-xl shadow-brand-600/5 backdrop-blur md:p-4">
            <div className="mb-2 flex items-center gap-2 px-2 pt-1 text-xs text-zinc-500">
              <div className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-accent-400" />
              </div>
              <span className="ml-2">Live preview · uses a generic voice profile</span>
            </div>
            <div className="rounded-2xl border border-zinc-100 bg-white">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a rough idea — e.g. 'Lessons from my worst hire'"
                className="block h-28 w-full resize-none rounded-t-2xl px-4 py-3 text-sm focus:outline-none"
                maxLength={400}
              />
              <div className="flex items-center justify-between border-t border-zinc-100 p-2">
                <span className="pl-2 text-xs text-zinc-400">{input.length}/400</span>
                <Button
                  size="sm"
                  loading={loading}
                  disabled={input.trim().length < 4}
                  onClick={onGenerate}
                  rightIcon={!loading && <ArrowRight className="h-3.5 w-3.5" />}
                >
                  Generate preview
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-center text-sm text-red-800">
              {error}
            </div>
          )}

          {result && (
            <div className="mt-4 rounded-3xl border border-brand-200 bg-white p-5 shadow-xl shadow-brand-600/10">
              <div className="flex items-center justify-between">
                <Badge variant="brand">Generated</Badge>
                <button
                  type="button"
                  onClick={copy}
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-accent-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <pre className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-900">
                {result}
              </pre>
              <div className="mt-4 border-t border-zinc-100 pt-3 text-xs text-zinc-500">
                This used a generic voice profile.{" "}
                <Link href="/auth/signin" className="font-medium text-brand-600 hover:text-brand-700">
                  Train your own Writing DNA →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
