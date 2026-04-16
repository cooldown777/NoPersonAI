const steps = [
  {
    number: "1",
    title: "Enter your idea",
    description: "Just 1-2 sentences about what you want to share",
  },
  {
    number: "2",
    title: "AI writes in your voice",
    description:
      "Our 5-step engine analyzes, structures, and writes like you would",
  },
  {
    number: "3",
    title: "Copy & post",
    description: "Refine with one tap, then copy straight to LinkedIn",
  },
];

export default function HowItWorks() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                {step.number}
              </div>
              <h3 className="mt-3 text-base font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
