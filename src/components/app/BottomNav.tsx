"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PenSquare, Clock, Dna, User, MessageCircle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/Logo";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useI18n } from "@/i18n/use-i18n";

function useTabs() {
  const { t } = useI18n();
  return [
    { label: t("appShell.navCreate"), href: "/app", icon: PenSquare, match: (p: string) => p === "/app" },
    {
      label: t("appShell.navBulk"),
      href: "/app/bulk",
      icon: Layers,
      match: (p: string) => p.startsWith("/app/bulk"),
    },
    {
      label: t("appShell.navWhatsApp"),
      href: "/app/whatsapp",
      icon: MessageCircle,
      match: (p: string) => p.startsWith("/app/whatsapp"),
    },
    {
      label: t("appShell.navHistory"),
      href: "/app/history",
      icon: Clock,
      match: (p: string) => p.startsWith("/app/history"),
    },
    { label: t("appShell.navDna"), href: "/app/dna", icon: Dna, match: (p: string) => p.startsWith("/app/dna") },
    {
      label: t("appShell.navAccount"),
      href: "/app/account",
      icon: User,
      match: (p: string) => p.startsWith("/app/account"),
    },
  ];
}

export default function BottomNav() {
  const pathname = usePathname();
  const tabs = useTabs();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 pb-safe backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center py-2 text-xs transition-colors",
                active ? "text-brand-600" : "text-zinc-500 hover:text-zinc-900",
              )}
            >
              <Icon className={cn("h-5 w-5", active && "stroke-[2.25]")} />
              <span className="mt-0.5 text-[10px] font-medium">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const tabs = useTabs();
  return (
    <aside className="hidden w-60 shrink-0 border-r border-zinc-200 bg-white md:flex md:flex-col">
      <div className="flex h-16 items-center border-b border-zinc-100 px-5">
        <Link href="/" className="inline-flex">
          <Logo />
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-4">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-zinc-100 px-3 py-3">
        <LanguageSwitcher />
      </div>
    </aside>
  );
}
