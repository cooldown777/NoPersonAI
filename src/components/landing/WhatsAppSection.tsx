import Link from "next/link";
import { Mic, MessageCircle, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function WhatsAppSection() {
  return (
    <section id="whatsapp" className="relative overflow-hidden bg-zinc-950 text-white scroll-mt-20">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-500/30 blur-3xl" />
        <div className="absolute right-0 top-0 h-[400px] w-[400px] rounded-full bg-brand-500/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <Badge variant="accent" className="mb-4 bg-accent-500/20 text-accent-300">
              <MessageCircle className="h-3 w-3" />
              Core feature
            </Badge>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
              Voice notes in. <br />
              <span className="bg-gradient-to-br from-accent-300 to-accent-500 bg-clip-text text-transparent">
                LinkedIn posts out.
              </span>
            </h2>
            <p className="mt-4 max-w-lg text-base text-zinc-400 md:text-lg">
              Talking is faster than typing. Record a WhatsApp voice note on the way to
              your next meeting. Get a ready-to-post LinkedIn post back in seconds —
              in your voice, in your language.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Send a 30-second voice note → receive a full post",
                "German, English, or both — auto-detected",
                "Replies with your draft in under 30 seconds",
                "Same Writing DNA you trained in the app",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-zinc-300">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/auth/signin?callbackUrl=/app/whatsapp">
                <Button size="lg" variant="accent" leftIcon={<MessageCircle className="h-4 w-4" />}>
                  Connect WhatsApp
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="ghost" className="text-zinc-300 hover:bg-white/10 hover:text-white">
                  See Pro pricing
                </Button>
              </Link>
            </div>
            <p className="mt-3 text-xs text-zinc-500">
              WhatsApp integration is included on the Pro plan.
            </p>
          </div>

          {/* Phone mockup */}
          <div className="mx-auto w-full max-w-sm">
            <div className="relative rounded-[2.5rem] border-[10px] border-zinc-800 bg-zinc-900 p-3 shadow-2xl">
              <div className="overflow-hidden rounded-[2rem] bg-[#0b141a]">
                <div className="flex items-center gap-3 bg-[#202c33] px-4 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-500">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">NoPersonAI</div>
                    <div className="text-[11px] text-zinc-400">online</div>
                  </div>
                </div>
                <div className="space-y-2 px-3 py-4 text-sm">
                  {/* User voice note */}
                  <div className="ml-auto flex max-w-[80%] justify-end">
                    <div className="rounded-lg rounded-tr-sm bg-[#005c4b] px-3 py-2">
                      <div className="flex items-center gap-2 text-white/90">
                        <Mic className="h-4 w-4 text-white" />
                        <div className="flex items-end gap-0.5 py-1">
                          {[3, 5, 7, 4, 8, 6, 9, 5, 3, 6, 4, 7].map((h, i) => (
                            <span
                              key={i}
                              className="w-0.5 rounded-full bg-white/70"
                              style={{ height: `${h * 2}px` }}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-white/80">0:24</span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-auto text-[10px] text-zinc-500">✓✓ read</div>

                  {/* NoPersonAI reply */}
                  <div className="max-w-[85%]">
                    <div className="rounded-lg rounded-tl-sm bg-[#202c33] px-3 py-2 text-zinc-100">
                      <div className="text-[11px] font-medium text-accent-400">NoPersonAI</div>
                      <div className="mt-1 text-[13px] leading-relaxed">
                        The best hire I ever made showed up with a 2-page PDF and no resume.
                        <br />
                        <br />
                        She&apos;d read every blog post, built a tiny prototype, and listed three things we should stop doing.
                        <br />
                        <br />
                        Most founders would have passed. I almost did.
                        <br />
                        <br />
                        The lesson: effort before access beats credentials every time.
                      </div>
                    </div>
                    <div className="mt-0.5 text-[10px] text-zinc-500">just now</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
