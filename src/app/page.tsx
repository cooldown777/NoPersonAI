import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import HowItWorks from "@/components/landing/HowItWorks";
import WhatsAppTeaser from "@/components/landing/WhatsAppTeaser";
import PostPreviewSection from "@/components/landing/PostPreviewSection";
import WritingDNASection from "@/components/landing/WritingDNASection";
import PricingSection from "@/components/landing/PricingSection";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "NoPersonAI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "AI-powered LinkedIn post generator that learns your writing style",
  offers: [
    {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      name: "Free",
    },
    {
      "@type": "Offer",
      price: "29",
      priceCurrency: "EUR",
      name: "Pro",
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
      <main>
        <Hero />
        <PainPoints />
        <HowItWorks />
        <WhatsAppTeaser />
        <PostPreviewSection />
        <WritingDNASection />
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </main>
    </>
  );
}
