import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const raw = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err) {
    console.error("[stripe/webhook] bad signature", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string | null;
        const subscriptionId = session.subscription as string | null;
        const userId = session.client_reference_id;
        if (!customerId) break;

        if (userId) {
          await prisma.user.update({
            where: { id: userId },
            data: { stripeCustomerId: customerId },
          });
        }
        if (subscriptionId) {
          const sub = await stripe.subscriptions.retrieve(subscriptionId);
          await applySubscriptionToUser(customerId, sub);
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        await applySubscriptionToUser(sub.customer as string, sub);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await prisma.user.updateMany({
          where: { stripeCustomerId: sub.customer as string },
          data: {
            plan: "free",
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeStatus: sub.status,
            stripeCurrentPeriodEnd: null,
          },
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string | null;
        if (!customerId) break;
        await prisma.user.updateMany({
          where: { stripeCustomerId: customerId },
          data: { stripeStatus: "past_due" },
        });
        break;
      }

      case "customer.updated": {
        const cust = event.data.object as Stripe.Customer;
        const addr = cust.address;
        await prisma.user.updateMany({
          where: { stripeCustomerId: cust.id },
          data: {
            billingName: cust.name ?? undefined,
            billingEmail: cust.email ?? undefined,
            billingAddressLine1: addr?.line1 ?? undefined,
            billingAddressLine2: addr?.line2 ?? undefined,
            billingCity: addr?.city ?? undefined,
            billingPostalCode: addr?.postal_code ?? undefined,
            billingCountry: addr?.country ?? undefined,
          },
        });
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("[stripe/webhook] handler error", event.type, err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function applySubscriptionToUser(customerId: string, sub: Stripe.Subscription) {
  const active = sub.status === "active" || sub.status === "trialing";
  const item = sub.items.data[0];
  const priceId = item?.price.id ?? null;
  const periodEnd = item?.current_period_end;
  await prisma.user.updateMany({
    where: { stripeCustomerId: customerId },
    data: {
      plan: active ? "pro" : "free",
      stripeSubscriptionId: sub.id,
      stripePriceId: priceId,
      stripeStatus: sub.status,
      stripeCurrentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : null,
    },
  });
}
