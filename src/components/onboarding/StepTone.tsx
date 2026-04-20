interface StepToneProps {
  selectedTones: string[];
  emojiUsage: string;
  onToggleTone: (tone: string) => void;
  onEmojiChange: (usage: string) => void;
  onNext: () => void;
  onBack: () => void;
}

const toneOptions = [
  {
    id: "professional",
    label: "Professional & polished",
    description: "Clear, authoritative, credible",
  },
  {
    id: "casual",
    label: "Casual & conversational",
    description: "Friendly, approachable, relatable",
  },
  {
    id: "storytelling",
    label: "Storytelling & personal",
    description: "Narrative-driven, emotional, authentic",
  },
  {
    id: "controversial",
    label: "Bold & controversial",
    description: "Opinionated, provocative, thought-provoking",
  },
];

const emojiOptions = [
  { id: "none", label: "None", example: "Clean text only" },
  { id: "light", label: "Light", example: "Occasional emphasis" },
  { id: "heavy", label: "Heavy", example: "Expressive & visual" },
];

export default function StepTone({
  selectedTones,
  emojiUsage,
  onToggleTone,
  onEmojiChange,
  onNext,
  onBack,
}: StepToneProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your tone</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pick 1-2 that match how you want to sound (optional)
        </p>
      </div>

      <div className="space-y-3">
        {toneOptions.map((tone) => {
          const selected = selectedTones.includes(tone.id);
          return (
            <button
              key={tone.id}
              onClick={() => onToggleTone(tone.id)}
              className={`w-full rounded-lg border-2 px-4 py-4 text-left transition-colors ${
                selected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">
                {tone.label}
              </div>
              <div className="text-xs text-gray-500">{tone.description}</div>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Emoji usage
        </label>
        <div className="mt-2 flex gap-3">
          {emojiOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onEmojiChange(opt.id)}
              className={`flex-1 rounded-lg border-2 px-3 py-3 text-center transition-colors ${
                emojiUsage === opt.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="text-sm font-medium text-gray-900">
                {opt.label}
              </div>
              <div className="text-xs text-gray-500">{opt.example}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
