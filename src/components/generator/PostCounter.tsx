import { cn } from "@/lib/utils";

interface PostCounterProps {
  used: number;
  limit: number;
  plan: "free" | "pro";
}

export default function PostCounter({ used, limit, plan }: PostCounterProps) {
  if (plan === "pro") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5">
        <div className="text-xs font-medium text-brand-700">Pro plan · Unlimited posts</div>
        <div className="text-xs text-brand-600">{used} this month</div>
      </div>
    );
  }

  const remaining = Math.max(0, limit - used);
  const pct = Math.min(100, (used / limit) * 100);
  const danger = remaining <= 1;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-zinc-700">
          {remaining} of {limit} free posts left this month
        </span>
        <span className={cn("text-xs", danger ? "text-amber-700" : "text-zinc-500")}>
          {used}/{limit}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            danger ? "bg-amber-500" : "bg-brand-500",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
