import { cn } from "@/lib/utils";

export default function ProgressBar({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs font-medium text-zinc-500">
        <span className="font-display uppercase tracking-wider text-zinc-400">
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-700 transition-all duration-500",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
