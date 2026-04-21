import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";
import type Stripe from "stripe";

interface UserBilling {
  id: string;
  email: string;
  name: string | null;
  stripeCustomerId: string | null;
  billingName: string | null;
  billingCompany: string | null;
  billingEmail: string | null;
  billingAddressLine1: string | null;
  billingAddressLine2: string | null;
  billingCity: string | null;
  billingPostalCode: string | null;
  billingCountry: string | null;
  billingVatId: string | null;
}

function buildCustomerPayload(
  user: UserBilling,
): Stripe.CustomerCreateParams & Stripe.CustomerUpdateParams {
  const address: Stripe.AddressParam = {
    line1: user.billingAddressLine1 || undefined,
    line2: user.billingAddressLine2 || undefined,
    city: user.billingCity || undefined,
    postal_code: user.billingPostalCode || undefined,
    country: user.billingCountry || undefined,
  };
  const hasAddress = Object.values(address).some(Boolean);

  return {
    email: user.billingEmail || user.email,
    name: user.billingName || user.name || undefined,
    ...(user.billingCompany ? { name: user.billingCompany } : {}),
    ...(hasAddress ? { address } : {}),
    metadata: { userId: user.id },
  };
}

export async function getOrCreateCustomer(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      stripeCustomerId: true,
      billingName: true,
      billingCompany: true,
      billingEmail: true,
      billingAddressLine1: true,
      billingAddressLine2: true,
      billingCity: true,
      billingPostalCode: true,
      billingCountry: true,
      billingVatId: true,
    },
  });
  if (!user) throw new Error("User not found");
  if (user.stripeCustomerId) return user.stripeCustomerId;

  const customer = await stripe.customers.create(buildCustomerPayload(user));

  await prisma.user.update({
    where: { id: userId },
    data: { stripeCustomerId: customer.id },
  });

  if (user.billingVatId && user.billingCountry) {
    await attachVatId(customer.id, user.billingCountry, user.billingVatId).catch(() => {});
  }

  return customer.id;
}

export async function syncBillingToStripe(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      stripeCustomerId: true,
      billingName: true,
      billingCompany: true,
      billingEmail: true,
      billingAddressLine1: true,
      billingAddressLine2: true,
      billingCity: true,
      billingPostalCode: true,
      billingCountry: true,
      billingVatId: true,
    },
  });
  if (!user?.stripeCustomerId) return;

  await stripe.customers.update(user.stripeCustomerId, buildCustomerPayload(user));

  if (user.billingVatId && user.billingCountry) {
    await replaceVatId(user.stripeCustomerId, user.billingCountry, user.billingVatId).catch(
      (err) => console.warn("[stripe] VAT ID update failed", err),
    );
  }
}

async function attachVatId(customerId: string, country: string, vatId: string) {
  const type = vatTypeForCountry(country);
  if (!type) return;
  await stripe.customers.createTaxId(customerId, { type, value: vatId });
}

async function replaceVatId(customerId: string, country: string, vatId: string) {
  const existing = await stripe.customers.listTaxIds(customerId, { limit: 10 });
  await Promise.all(existing.data.map((t) => stripe.customers.deleteTaxId(customerId, t.id)));
  await attachVatId(customerId, country, vatId);
}

function vatTypeForCountry(country: string): Stripe.TaxIdCreateParams["type"] | null {
  const c = country.trim().toUpperCase();
  const euCountries = new Set([
    "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IE","IT",
    "LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK",
  ]);
  if (euCountries.has(c)) return "eu_vat";
  if (c === "GB") return "gb_vat";
  if (c === "CH") return "ch_vat";
  if (c === "US") return "us_ein";
  return null;
}
