import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { stripe, STRIPE_PRICE_MONTHLY, STRIPE_PRICE_YEARLY } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/stripe-customer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const { interval } = (await req.json().catch(() => ({}))) as { interval?: "month" | "year" };
  const price = interval === "year" ? STRIPE_PRICE_YEARLY : STRIPE_PRICE_MONTHLY;
  if (!price) {
    return NextResponse.json({ error: "Price not configured" }, { status: 500 });
  }

  const customer = await getOrCreateCustomer(user.id);
  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    line_items: [{ price, quantity: 1 }],
    success_url: `${origin}/app/account?checkout=success`,
    cancel_url: `${origin}/app/account?checkout=cancel`,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    tax_id_collection: { enabled: true },
    customer_update: { address: "auto", name: "auto" },
    client_reference_id: user.id,
  });

  return NextResponse.json({ url: session.url });
}
