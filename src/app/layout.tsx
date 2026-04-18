import type { Metadata, Viewport } from "next";
import { Inter, Inter_Tight, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nopersonai.com"),
  title: {
    default: "NoPersonAI — A LinkedIn ghostwriter that sounds exactly like you",
    template: "%s | NoPersonAI",
  },
  description:
    "Generate authentic LinkedIn posts in your voice. Send a text or voice note via WhatsApp, get a ready-to-post LinkedIn post back. Free to start.",
  keywords: [
    "LinkedIn post generator",
    "AI ghostwriter",
    "LinkedIn ghostwriter",
    "WhatsApp to LinkedIn",
    "voice to LinkedIn post",
    "LinkedIn AI tool",
    "personal branding AI",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "de_DE",
    siteName: "NoPersonAI",
    title: "NoPersonAI — A LinkedIn ghostwriter that sounds exactly like you",
    description:
      "Voice notes via WhatsApp turn into LinkedIn posts that sound like you wrote them. Your voice, amplified.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoPersonAI — A LinkedIn ghostwriter that sounds exactly like you",
    description:
      "Voice notes via WhatsApp turn into LinkedIn posts that sound like you wrote them.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${interTight.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
