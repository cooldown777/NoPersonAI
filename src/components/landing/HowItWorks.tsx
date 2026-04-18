import { Fingerprint, PencilLine, Rocket } from "lucide-react";

const steps = [
  {
    icon: Fingerprint,
    title: "Train your Writing DNA",
    body:
      "Paste 3–5 posts you've written or answer a quick style quiz. In two minutes we build a profile that locks in your voice.",
  },
  {
    icon: PencilLine,
    title: "Drop a rough idea",
    body:
      "Type a bullet, record a voice note on WhatsApp, or send a link. No frameworks, no templates. Just the seed.",
  },
  {
    icon: Rocket,
    title: "Get a ready-to-post draft",
    body:
      "Our 5-step AI chain turns it into a LinkedIn post in your voice. Refine with one tap. Post it.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-brand-600">
            How it works
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            From idea to LinkedIn post in under a minute.
          </h2>
        </div>

        <div className="mt-10 md:mt-16">
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative">
                  <div className="rounded-3xl border border-zinc-200 bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                        <Icon className="h-6 w-6" />
                      </div>
                      <span className="font-display text-sm font-semibold text-zinc-300">
                        0{i + 1}
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-lg font-semibold text-zinc-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">{step.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
