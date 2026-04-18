import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, invalid, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-[120px] w-full resize-y rounded-2xl border bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400",
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
  },
);
