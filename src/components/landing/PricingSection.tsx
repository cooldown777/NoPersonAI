"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, MessageCircle, Mic, Sparkles, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/i18n/use-i18n";
import PricingToggle, { type BillingPeriod } from "./PricingToggle";
import {
  computeYearlyPrice,
  formatMonthlyEquivalent,
} from "./pricing-math";

const STORAGE_KEY = "np:pricing-period";
const MONTHLY_PRO_EUR = 29;
const YEARLY_TOTAL = computeYearlyPrice(MONTHLY_PRO_EUR);

export default function PricingSection() {
  const { t, tArray } = useI18n();
  const [period, setPeriod] = useState<BillingPeriod>("monthly");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "monthly" || saved === "yearly") setPeriod(saved);
  }, []);

  function handleChange(v: BillingPeriod) {
    setPeriod(v);
    localStorage.setItem(STORAGE_KEY, v);
  }

  const proPrice = period === "monthly"
    ? { big: "€29", small: t("pricing.perMonth"), sub: null }
    : {
        big: formatMonthlyEquivalent(YEARLY_TOTAL),
        small: t("pricing.perMonth"),
        sub: t("pricing.billedYearly", { total: YEARLY_TOTAL }),
      };

  const tiers: Array<{
    name: string;
    priceBig: string;
    priceSmall: string;
    priceSub: string | null;
    description: string;
    features: string[];
    featureIcons: (LucideIcon | null)[];
    cta: string;
    featured: boolean;
    badge: string | null;
  }> = [
    {
      name: "Free",
      priceBig: "€0",
      priceSmall: t("pricing.forever"),
      priceSub: null,
      description: t("pricing.free.description"),
      features: tArray("pricing.free.features"),
      featureIcons: [],
      cta: t("pricing.free.cta"),
      featured: false,
      badge: null,
    },
    {
      name: "Pro",
      priceBig: proPrice.big,
      priceSmall: proPrice.small,
      priceSub: proPrice.sub,
      description: t("pricing.pro.description"),
      features: tArray("pricing.pro.features"),
      featureIcons: [null, MessageCircle, Mic, null, null, null],
      cta: t("pricing.pro.cta"),
      featured: true,
      badge: t("pricing.pro.badge"),
    },
  ];

  const ctaBase =
    "inline-flex h-12 w-full items-center justify-center rounded-xl px-5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white";
  const ctaPrimary =
    "bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500";
  const ctaOutline =
    "border border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 active:bg-zinc-100 focus-visible:ring-zinc-400";

  return (
    <section id="pricing" className="relative bg-zinc-50 scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-sm font-semibold uppercase tracking-wider text-brand-600">
            {t("pricing.eyebrow")}
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-4xl">
            {t("pricing.title")}
          </h2>
          <p className="mt-3 text-base text-zinc-600">
            {t("pricing.subtitle")}
          </p>
          <div className="mt-6 flex justify-center">
            <PricingToggle
              value={period}
              onChange={handleChange}
              discountLabel={t("pricing.save15")}
            />
          </div>
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
                  {tier.priceBig}
                </span>
                <span className="text-sm text-zinc-500">{tier.priceSmall}</span>
              </div>
              {tier.priceSub && (
                <p className="mt-1 text-xs text-zinc-500">{tier.priceSub}</p>
              )}

              <div className="mt-6">
                <Link
                  href="/auth/signin"
                  className={cn(ctaBase, tier.featured ? ctaPrimary : ctaOutline)}
                >
                  {tier.cta}
                </Link>
              </div>

              <ul className="mt-6 space-y-3">
                {tier.features.map((f, idx) => {
                  const Icon = tier.featureIcons[idx] ?? null;
                  return (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-700">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" />
                      <span>
                        {Icon && (
                          <Icon className="mr-1 inline-block h-3.5 w-3.5 text-accent-600" />
                        )}
                        {f}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
