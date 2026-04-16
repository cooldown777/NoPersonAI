import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "NoPersonAI — LinkedIn Posts That Sound Like You",
    template: "%s | NoPersonAI",
  },
  description:
    "Generate authentic LinkedIn posts with AI that learns your writing style. No generic content. Your voice, amplified. Free to start.",
  keywords: [
    "LinkedIn Post Generator",
    "LinkedIn Post erstellen",
    "KI LinkedIn Posts",
    "LinkedIn Beitrag schreiben",
    "AI LinkedIn writer",
    "LinkedIn content creator",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "de_DE",
    siteName: "NoPersonAI",
    title: "NoPersonAI — LinkedIn Posts That Sound Like You",
    description:
      "AI that learns your voice, not just your topics. Generate authentic LinkedIn posts in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "NoPersonAI — LinkedIn Posts That Sound Like You",
    description:
      "AI that learns your voice, not just your topics. Generate authentic LinkedIn posts in seconds.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
