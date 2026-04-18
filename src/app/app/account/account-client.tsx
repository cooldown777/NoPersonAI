"use client";

import { signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Sparkles, MessageCircle, ArrowRight, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

interface AccountClientProps {
  plan: "free" | "pro";
  postsUsed: number;
  name: string;
  email: string;
  image?: string | null;
}

const FREE_LIMIT = 5;

export default function AccountClient({ plan, postsUsed, name, email, image }: AccountClientProps) {
  const isPro = plan === "pro";
  const pct = isPro ? 100 : Math.min(100, (postsUsed / FREE_LIMIT) * 100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Account
        </h1>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-zinc-200">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-600">
                  {name.charAt(0).toUpperCase() || "?"}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-display text-base font-semibold text-zinc-900">
                {name || "User"}
              </div>
              <div className="truncate text-sm text-zinc-500">{email}</div>
            </div>
            <Badge variant={isPro ? "brand" : "neutral"} className="uppercase">
              {plan}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Usage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-zinc-500">Posts this month</span>
            <span className="font-display font-semibold text-zinc-900">
              {postsUsed}
              {!isPro && ` / ${FREE_LIMIT}`}
              {isPro && " · unlimited"}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {!isPro && (
        <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-display text-base font-semibold text-zinc-900">
                  Upgrade to Pro — €29/mo
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  Unlimited posts, WhatsApp text &amp; voice notes, browser voice recording, priority speed.
                </p>
                <Button
                  size="md"
                  className="mt-4"
                  leftIcon={<CreditCard className="h-4 w-4" />}
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                >
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <Link href="/app/whatsapp" className="flex items-center gap-3 group">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="font-display text-sm font-semibold text-zinc-900">WhatsApp</div>
              <div className="text-xs text-zinc-500">
                {isPro ? "Manage your connection" : "Upgrade to Pro to enable"}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-zinc-900" />
          </Link>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        size="lg"
        fullWidth
        onClick={() => signOut({ callbackUrl: "/" })}
        leftIcon={<LogOut className="h-4 w-4" />}
      >
        Sign out
      </Button>
    </div>
  );
}
