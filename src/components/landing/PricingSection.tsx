import Link from "next/link";

const plans = [
  {
    name: "Free",
    price: "\u20AC0",
    period: "forever",
    features: [
      "5 posts per month",
      "Unlimited refinements",
      "Writing DNA profile",
      "Full post history",
    ],
    cta: "Start for free",
    highlight: false,
  },
  {
    name: "Pro",
    price: "\u20AC29",
    period: "/month",
    features: [
      "Unlimited posts",
      "Unlimited refinements",
      "Writing DNA profile",
      "Full post history",
      "Priority generation speed",
    ],
    cta: "Start for free, upgrade later",
    highlight: true,
  },
];

export default function PricingSection() {
  return (
    <section className="px-4 py-16" id="pricing">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Simple pricing
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border-2 p-6 ${
                plan.highlight
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">
                  {plan.price}
                </span>
                <span className="text-sm text-gray-500"> {plan.period}</span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <svg
                      className="h-4 w-4 shrink-0 text-green-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signin"
                className={`mt-6 block w-full rounded-lg px-4 py-3 text-center text-sm font-medium transition-colors ${
                  plan.highlight
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
