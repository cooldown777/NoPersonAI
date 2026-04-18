import Link from "next/link";
import { MessageCircle, Mic, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function WhatsAppUpsell() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          WhatsApp
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Turn voice notes and text messages into LinkedIn posts, on the go.
        </p>
      </div>

      <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
        <CardContent className="p-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-500 text-white">
            <MessageCircle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-zinc-900">
            WhatsApp → LinkedIn, ready in 30 seconds.
          </h2>
          <p className="mt-2 text-sm text-zinc-600">
            Record a voice note on your walk. Type a one-liner on the train. Get a ready-to-post
            LinkedIn draft back in your voice — in German or English.
          </p>

          <ul className="mt-5 space-y-2.5">
            {[
              { icon: Mic, text: "Voice notes up to 2 minutes" },
              { icon: Sparkles, text: "Auto-detected language (DE/EN)" },
              { icon: Check, text: "Uses your trained Writing DNA" },
              { icon: MessageCircle, text: "Chat history synced to the app" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.text} className="flex items-start gap-2.5 text-sm text-zinc-700">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  <span>{item.text}</span>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Link href="/app/account" className="sm:flex-1">
              <Button
                size="lg"
                fullWidth
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Upgrade to Pro — €29/mo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
