interface PostCounterProps {
  used: number;
  limit: number;
  plan: "free" | "pro";
}

export default function PostCounter({ used, limit, plan }: PostCounterProps) {
  if (plan === "pro") return null;

  const remaining = limit - used;
  const isLow = remaining <= 1;

  return (
    <div
      className={`text-center text-xs ${isLow ? "text-orange-600" : "text-gray-500"}`}
    >
      {remaining > 0
        ? `${used} of ${limit} free posts used this month`
        : "Monthly limit reached"}
    </div>
  );
}
