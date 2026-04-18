import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
  withWordmark?: boolean;
}

export function LogoMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="np-logo-grad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#np-logo-grad)" />
      <path
        d="M10 22V10h2.2l5.6 8.2V10H20v12h-2.2l-5.6-8.2V22H10Z"
        fill="white"
      />
      <circle cx="23.5" cy="11" r="2.2" fill="#10B981" stroke="white" strokeWidth="1.2" />
    </svg>
  );
}

export function Logo({ size = 28, className, withWordmark = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark size={size} />
      {withWordmark && (
        <span className="font-display text-base font-bold tracking-tight text-zinc-900">
          NoPerson<span className="text-brand-600">AI</span>
        </span>
      )}
    </div>
  );
}
