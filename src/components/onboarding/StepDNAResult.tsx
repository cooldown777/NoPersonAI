interface StepDNAResultProps {
  profile: string;
  isLoading: boolean;
  adjustment: string;
  onAdjustmentChange: (text: string) => void;
  onRegenerate: () => void;
  onComplete: () => void;
  onBack: () => void;
}

export default function StepDNAResult({
  profile,
  isLoading,
  adjustment,
  onAdjustmentChange,
  onRegenerate,
  onComplete,
  onBack,
}: StepDNAResultProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        <p className="text-sm text-gray-600">Analyzing your writing style...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Your Writing DNA</h2>
        <p className="mt-1 text-sm text-gray-600">
          Here&apos;s how we understand your voice
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm leading-relaxed text-gray-800">{profile}</p>
      </div>

      <div>
        <p className="text-sm text-gray-600">
          Not quite right? Tell us what to adjust:
        </p>
        <textarea
          value={adjustment}
          onChange={(e) => onAdjustmentChange(e.target.value)}
          placeholder="e.g. I'm more casual than that, I use a lot of humor..."
          rows={2}
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {adjustment.trim() && (
          <button
            onClick={onRegenerate}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700"
          >
            Regenerate with adjustments
          </button>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onComplete}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Looks good — let&apos;s go!
        </button>
      </div>
    </div>
  );
}
