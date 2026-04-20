interface StepBasicsProps {
  name: string;
  audience: string;
  language: "de" | "en";
  onChange: (field: string, value: string) => void;
  onNext: () => void;
}

export default function StepBasics({
  name,
  audience,
  language,
  onChange,
  onNext,
}: StepBasicsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Let&apos;s get started
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Your name <span className="text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => onChange("name", e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred language
          </label>
          <div className="mt-2 flex gap-3">
            {(["en", "de"] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => onChange("language", lang)}
                className={`flex-1 rounded-lg border-2 px-4 py-3 text-sm font-medium transition-colors ${
                  language === lang
                    ? "border-blue-600 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                }`}
              >
                {lang === "en" ? "English" : "Deutsch"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Who is your target audience? <span className="text-gray-400">(optional)</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">
            e.g. &quot;startup founders&quot;, &quot;HR managers&quot;,
            &quot;tech leads&quot;
          </p>
          <input
            type="text"
            value={audience}
            onChange={(e) => onChange("audience", e.target.value)}
            placeholder="founders, entrepreneurs, business owners"
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        Continue
      </button>
    </div>
  );
}
