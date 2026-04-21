import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, unauthorized } from "@/lib/auth-guard";
import { stripe } from "@/lib/stripe";
import { getOrCreateCustomer } from "@/lib/stripe-customer";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const user = await getAuthUser();
  if (!user) return unauthorized();

  const customer = await getOrCreateCustomer(user.id);
  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "";

  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: `${origin}/app/account`,
  });

  return NextResponse.json({ url: session.url });
}
