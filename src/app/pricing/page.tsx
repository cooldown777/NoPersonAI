import type { Metadata } from "next";
import Header from "@/components/landing/Header";
import PricingSection from "@/components/landing/PricingSection";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Pricing — Free and Pro plans",
  description:
    "NoPersonAI pricing. Start free with 5 posts per month or upgrade to Pro (€29/mo) for unlimited posts plus WhatsApp text and voice notes.",
};

export default function PricingPage() {
  return (
    <>
      <Header />
      <main>
        <div className="bg-brand-radial">
          <div className="mx-auto max-w-6xl px-4 pt-10 text-center md:px-6 md:pt-16">
            <h1 className="font-display text-3xl font-bold tracking-tight text-zinc-900 md:text-5xl">
              Simple, honest pricing.
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-zinc-600">
              Start free. Upgrade when WhatsApp voice notes become indispensable.
            </p>
          </div>
        </div>
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
