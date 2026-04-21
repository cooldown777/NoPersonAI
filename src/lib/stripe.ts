import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.warn("[stripe] STRIPE_SECRET_KEY not set — Stripe calls will fail");
}

export const stripe = new Stripe(key ?? "sk_test_placeholder", {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
});

export const STRIPE_PRICE_MONTHLY = process.env.STRIPE_PRICE_PRO_MONTHLY ?? "";
export const STRIPE_PRICE_YEARLY = process.env.STRIPE_PRICE_PRO_YEARLY ?? "";
