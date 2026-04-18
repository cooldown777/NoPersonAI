import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:px-6">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <Logo />
            <p className="mt-3 max-w-sm text-sm text-zinc-500">
              A LinkedIn ghostwriter that sounds exactly like you.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm md:grid-cols-3 md:gap-12">
            <div>
              <div className="font-display text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Product
              </div>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/pricing" className="text-zinc-700 hover:text-zinc-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/#how-it-works" className="text-zinc-700 hover:text-zinc-900">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/#whatsapp" className="text-zinc-700 hover:text-zinc-900">
                    WhatsApp
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-display text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Support
              </div>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/#faq" className="text-zinc-700 hover:text-zinc-900">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/auth/signin" className="text-zinc-700 hover:text-zinc-900">
                    Sign in
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className="font-display text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Legal
              </div>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/terms" className="text-zinc-700 hover:text-zinc-900">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-zinc-700 hover:text-zinc-900">
                    Privacy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-zinc-100 pt-6 text-xs text-zinc-500">
          © {new Date().getFullYear()} NoPersonAI. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
