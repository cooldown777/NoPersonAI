"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { I18nProvider } from "@/i18n/provider";
import { ToastProvider } from "@/components/ui/Toast";
import type { Dictionary } from "@/i18n/en";
import type { Locale } from "@/i18n/config";

export default function Providers({
  children,
  locale,
  dict,
}: {
  children: ReactNode;
  locale: Locale;
  dict: Dictionary;
}) {
  return (
    <SessionProvider>
      <I18nProvider locale={locale} dict={dict}>
        <ToastProvider>{children}</ToastProvider>
      </I18nProvider>
    </SessionProvider>
  );
}
