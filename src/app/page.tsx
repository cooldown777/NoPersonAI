import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatsAppSection from "@/components/landing/WhatsAppSection";
import PostPreviewSection from "@/components/landing/PostPreviewSection";
import WritingDNASection from "@/components/landing/WritingDNASection";
import PricingSection from "@/components/landing/PricingSection";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NoPersonAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, iOS, Android (via WhatsApp)",
  description:
    "AI-powered LinkedIn post generator with WhatsApp voice-note support. Learns your writing style and produces posts that sound human.",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      name: "Free",
      description: "5 posts per month, Writing DNA, refinements",
    },
    {
      "@type": "Offer",
      price: "29",
      priceCurrency: "EUR",
      name: "Pro",
      description: "Unlimited posts, WhatsApp integration with voice notes, browser voice recording, priority support",
      billingIncrement: "P1M",
    },
  ],
};

export default function LandingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <main>
        <Hero />
        <PainPoints />
        <HowItWorks />
        <WhatsAppSection />
        <PostPreviewSection />
        <WritingDNASection />
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
