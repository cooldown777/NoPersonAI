import Link from "next/link";
import { Check, MessageCircle, Mic, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";

const tiers = [
  {
    name: "Free",
    price: "€0",
    period: "forever",
    description: "Try NoPersonAI and ship a few posts.",
    features: [
      "5 posts / month",
      "Writing DNA profile",
      "5-step AI generation chain",
      "10+ one-tap refinements",
      "Post history",
    ],
    cta: "Start free",
    featured: false,
  },
  {
    name: "Pro",
    price: "€29",
    period: "/month",
    description: "For founders and operators posting weekly.",
    features: [
      "Unlimited posts",
      "WhatsApp integration (text + voice)",
      "Browser voice recording",
      "Priority generation speed",
      "Priority support",
      "Everything in Free",
    ],
    cta: "Upgrade to Pro",
    featured: true,
    badge: "Most popular",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="relative bg-zinc-50 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-brand-600">
            Pricing
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            Start free. Upgrade when you&apos;re hooked.
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            Simple, honest pricing. Cancel anytime. No per-post fees.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:mt-14 md:grid-cols-2">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={
                tier.featured
                  ? "relative rounded-3xl border-2 border-brand-500 bg-white p-7 shadow-xl shadow-brand-600/10"
                  : "relative rounded-3xl border border-zinc-200 bg-white p-7"
              }
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    {tier.badge}
                  </span>
                </div>
              )}
              <div>
                <h3 className="font-display text-lg font-semibold text-zinc-900">{tier.name}</h3>
                <p className="mt-1 text-sm text-zinc-500">{tier.description}</p>
              </div>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="font-display text-5xl font-bold tracking-tight text-zinc-900">
                  {tier.price}
                </span>
                <span className="text-sm text-zinc-500">{tier.period}</span>
              </div>

              <div className="mt-6">
                <Link href="/auth/signin">
                  <Button
                    variant={tier.featured ? "primary" : "outline"}
                    size="lg"
                    fullWidth
                  >
                    {tier.cta}
                  </Button>
                </Link>
              </div>

              <ul className="mt-6 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                    <span>
                      {f.includes("WhatsApp") && (
                        <MessageCircle className="mr-1 inline-block h-3.5 w-3.5 text-accent-600" />
                      )}
                      {f.includes("voice recording") && (
                        <Mic className="mr-1 inline-block h-3.5 w-3.5 text-accent-600" />
                      )}
                      {f}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
