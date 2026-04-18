import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border bg-white px-4 text-sm text-zinc-900 placeholder:text-zinc-400",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1",
        invalid
          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
          : "border-zinc-200 focus:border-brand-500 focus:ring-brand-500/30",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
});
