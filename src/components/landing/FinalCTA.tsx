import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 to-brand-800 text-white">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent-500/40 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-brand-300/30 blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-4xl px-4 py-16 text-center md:px-6 md:py-24">
        <h2 className="font-display text-3xl font-bold tracking-tight md:text-5xl">
          Stop sounding like everyone else.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-brand-100 md:text-lg">
          Join the founders and operators writing LinkedIn posts that finally sound
          like them. Free to start. 5 posts a month on us.
        </p>
        <div className="mt-8 flex justify-center">
          <Link href="/auth/signin">
            <Button
              size="xl"
              variant="accent"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Start for free
            </Button>
          </Link>
        </div>
        <p className="mt-3 text-xs text-brand-200">
          No credit card · Cancel anytime · 60-second sign-up
        </p>
      </div>
    </section>
  );
}
