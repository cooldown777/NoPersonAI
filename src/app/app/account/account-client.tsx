"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import {
  LogOut,
  Sparkles,
  MessageCircle,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Loader2,
  Receipt,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { LinkedInIcon } from "@/components/brand/LinkedInIcon";
import { trackEvent } from "@/lib/analytics/meta-pixel";

interface BillingInfo {
  billingName: string;
  billingCompany: string;
  billingEmail: string;
  billingAddressLine1: string;
  billingAddressLine2: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  billingVatId: string;
}

interface AccountClientProps {
  plan: "free" | "pro";
  postsUsed: number;
  name: string;
  email: string;
  image?: string | null;
  linkedInConnected: boolean;
  billing: BillingInfo;
}

const FREE_LIMIT = 5;

export default function AccountClient({
  plan,
  postsUsed,
  name,
  email,
  image,
  linkedInConnected,
  billing,
}: AccountClientProps) {
  const { toast } = useToast();
  const isPro = plan === "pro";
  const pct = isPro ? 100 : Math.min(100, (postsUsed / FREE_LIMIT) * 100);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [billingForm, setBillingForm] = useState<BillingInfo>(billing);
  const [billingOpen, setBillingOpen] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);

  function setBillingField<K extends keyof BillingInfo>(key: K, value: string) {
    setBillingForm((prev) => ({ ...prev, [key]: value }));
  }

  async function saveBilling() {
    setSavingBilling(true);
    const res = await fetch("/api/billing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(billingForm),
    });
    if (res.ok) {
      toast({ title: "Billing information saved", variant: "success" });
      setBillingOpen(false);
    } else {
      const data = await res.json().catch(() => ({}));
      toast({ title: data.error || "Could not save", variant: "error" });
    }
    setSavingBilling(false);
  }

  async function handleLinkedInDisconnect() {
    setIsDisconnecting(true);
    try {
      const res = await fetch("/api/linkedin/disconnect", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "LinkedIn disconnected" });
      setTimeout(() => window.location.reload(), 400);
    } catch {
      toast({ title: "Could not disconnect", variant: "error" });
      setIsDisconnecting(false);
    }
  }

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
                  onClick={() =>
                    trackEvent("InitiateCheckout", {
                      value: 29,
                      currency: "EUR",
                      content_name: "pro_plan",
                    })
                  }
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
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a66c2]/10 text-[#0a66c2]">
              <LinkedInIcon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className="font-display text-sm font-semibold text-zinc-900">
                  LinkedIn
                </div>
                {linkedInConnected && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Connected
                  </Badge>
                )}
              </div>
              <div className="text-xs text-zinc-500">
                {linkedInConnected
                  ? "Schedule and publish posts directly"
                  : "Connect to schedule and auto-post"}
              </div>
            </div>
            {linkedInConnected ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleLinkedInDisconnect}
                disabled={isDisconnecting}
                leftIcon={isDisconnecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : undefined}
              >
                Disconnect
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => signIn("linkedin", { callbackUrl: "/app/account" })}
              >
                Connect
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

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

      <Card>
        <CardContent className="p-5">
          {!billingOpen ? (
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-700">
                <Receipt className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-display text-sm font-semibold text-zinc-900">
                  Billing information
                </div>
                <div className="text-xs text-zinc-500">
                  {billing.billingName || billing.billingCompany
                    ? `${billing.billingName || billing.billingCompany}${
                        billing.billingCity ? ` · ${billing.billingCity}` : ""
                      }${billing.billingCountry ? ` · ${billing.billingCountry}` : ""}`
                    : "Add name, address, and VAT ID for your invoices"}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setBillingOpen(true)}>
                {billing.billingName || billing.billingCompany ? "Edit" : "Add"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-zinc-500" />
                <span className="font-display text-sm font-semibold text-zinc-900">
                  Billing information
                </span>
              </div>

              <BillingField
                label="Full name"
                value={billingForm.billingName}
                onChange={(v) => setBillingField("billingName", v)}
                placeholder="Jane Doe"
              />
              <BillingField
                label="Company (optional)"
                value={billingForm.billingCompany}
                onChange={(v) => setBillingField("billingCompany", v)}
                placeholder="Acme GmbH"
              />
              <BillingField
                label="Billing email (optional)"
                value={billingForm.billingEmail}
                onChange={(v) => setBillingField("billingEmail", v)}
                placeholder={email}
                type="email"
              />
              <BillingField
                label="Address line 1"
                value={billingForm.billingAddressLine1}
                onChange={(v) => setBillingField("billingAddressLine1", v)}
                placeholder="Street and number"
              />
              <BillingField
                label="Address line 2 (optional)"
                value={billingForm.billingAddressLine2}
                onChange={(v) => setBillingField("billingAddressLine2", v)}
              />
              <div className="grid grid-cols-2 gap-3">
                <BillingField
                  label="Postal code"
                  value={billingForm.billingPostalCode}
                  onChange={(v) => setBillingField("billingPostalCode", v)}
                />
                <BillingField
                  label="City"
                  value={billingForm.billingCity}
                  onChange={(v) => setBillingField("billingCity", v)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <BillingField
                  label="Country"
                  value={billingForm.billingCountry}
                  onChange={(v) => setBillingField("billingCountry", v)}
                  placeholder="DE"
                />
                <BillingField
                  label="VAT ID (optional)"
                  value={billingForm.billingVatId}
                  onChange={(v) => setBillingField("billingVatId", v)}
                  placeholder="DE123456789"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={saveBilling}
                  disabled={savingBilling}
                  leftIcon={
                    savingBilling ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Save className="h-3.5 w-3.5" />
                    )
                  }
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setBillingForm(billing);
                    setBillingOpen(false);
                  }}
                  disabled={savingBilling}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
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

function BillingField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-zinc-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
      />
    </div>
  );
}
