import { Dna, Sparkles, BookOpen, Target } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Audience match",
    body: "We tune vocabulary to the people you're actually trying to reach.",
  },
  {
    icon: BookOpen,
    title: "Structure pick",
    body: "Hook / story / lesson vs. contrarian vs. list — chosen per idea.",
  },
  {
    icon: Sparkles,
    title: "Self-evaluation",
    body: "Every draft is graded by AI on human-ness, voice match, and LinkedIn fit.",
  },
];

export default function WritingDNASection() {
  return (
    <section id="dna" className="relative bg-white scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
              <Dna className="h-3.5 w-3.5" />
              Writing DNA
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              We learn your voice. Then we never lose it.
            </h2>
            <p className="mt-4 text-base text-zinc-600">
              Writing DNA is a voice fingerprint built from your real posts, the way you
              answer a short quiz, and the words you choose. Every post we generate
              passes through it before you see it.
            </p>

            <ul className="mt-6 space-y-4">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <li key={f.title} className="flex items-start gap-3">
                    <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <div className="font-display text-sm font-semibold text-zinc-900">
                        {f.title}
                      </div>
                      <div className="mt-0.5 text-sm text-zinc-600">{f.body}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 md:p-8">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Your Writing DNA · Sample
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-xs text-zinc-500">Tone</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {["Storytelling", "Casual"].map((t) => (
                    <span key={t} className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Audience</div>
                <div className="mt-1 text-sm text-zinc-900">Founders and operators building B2B software</div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Style</div>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                    Mixed length
                  </span>
                  <span className="rounded-full bg-zinc-200 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                    No emojis
                  </span>
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-500">Voice</div>
                <div className="mt-1 rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-700">
                  Writes in first person with a grounded, reflective voice. Opens with a
                  concrete moment, then widens to an insight. Short sentences. Avoids
                  corporate language and buzzwords. Ends with a reusable one-line
                  takeaway rather than a rhetorical question.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
