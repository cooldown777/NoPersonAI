import type { Metadata } from "next";
import PricingSection from "@/components/landing/PricingSection";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "NoPersonAI pricing plans. Start free with 5 posts per month, or upgrade to Pro for unlimited LinkedIn posts.",
};

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-gray-900">
          NoPersonAI
        </Link>
        <Link
          href="/auth/signin"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Sign in
        </Link>
      </header>
      <PricingSection />
    </div>
  );
}
