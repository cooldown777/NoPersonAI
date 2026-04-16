const painPoints = [
  {
    problem: "Generic AI output",
    solution: "Our Writing DNA system learns YOUR specific voice and patterns",
  },
  {
    problem: "No time to write",
    solution: "Enter one sentence, get a complete post in seconds",
  },
  {
    problem: "Inconsistent posting",
    solution: "Generate weeks of content in one sitting",
  },
];

export default function PainPoints() {
  return (
    <section className="bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          Sound familiar?
        </h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {painPoints.map((item) => (
            <div
              key={item.problem}
              className="rounded-xl border border-gray-200 bg-white p-5"
            >
              <p className="text-sm font-semibold text-red-600">
                {item.problem}
              </p>
              <p className="mt-2 text-sm text-gray-600">{item.solution}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
