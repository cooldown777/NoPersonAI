"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ProgressBar from "@/components/onboarding/ProgressBar";
import StepBasics from "@/components/onboarding/StepBasics";
import StepTone from "@/components/onboarding/StepTone";
import StepStyle from "@/components/onboarding/StepStyle";
import StepDNAResult from "@/components/onboarding/StepDNAResult";
import { isLocale, type Locale } from "@/i18n/config";

export default function OnboardingClient() {
  const { data: session } = useSession();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(session?.user?.name || "");
  const [audience, setAudience] = useState("");
  const [language, setLanguage] = useState<Locale>("en");
  const [selectedTones, setSelectedTones] = useState<string[]>([]);
  const [emojiUsage, setEmojiUsage] = useState("light");
  const [samplePosts, setSamplePosts] = useState<string[]>([]);
  const [styleDiscoveryAnswers, setStyleDiscoveryAnswers] = useState<
    Record<string, string>
  >({});
  const [writingExercise, setWritingExercise] = useState("");
  const [dnaProfile, setDnaProfile] = useState("");
  const [dnaLoading, setDnaLoading] = useState(false);
  const [adjustment, setAdjustment] = useState("");

  function handleBasicChange(field: string, value: string) {
    if (field === "name") setName(value);
    if (field === "audience") setAudience(value);
    if (field === "language" && isLocale(value)) setLanguage(value);
  }

  function toggleTone(tone: string) {
    setSelectedTones((prev) => {
      if (prev.includes(tone)) return prev.filter((t) => t !== tone);
      if (prev.length >= 2) return prev;
      return [...prev, tone];
    });
  }

  async function generateDNA() {
    setDnaLoading(true);
    setStep(4);

    const hasSamplePosts = samplePosts.some((p) => p.trim().length > 0);
    const hasDiscovery = Object.keys(styleDiscoveryAnswers).length > 0;

    let onboardingMethod = "sample_posts";
    if (hasSamplePosts && hasDiscovery) onboardingMethod = "both";
    else if (hasDiscovery) onboardingMethod = "style_discovery";

    const discoveryData =
      hasDiscovery || writingExercise.trim()
        ? { pairs: styleDiscoveryAnswers, writingExercise }
        : null;

    const res = await fetch("/api/dna", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tone: selectedTones[0] || "professional",
        audience,
        style: "mixed",
        emojiUsage,
        samplePosts: samplePosts.filter((p) => p.trim()),
        styleDiscoveryAnswers: discoveryData,
        onboardingMethod,
        preferredLanguage: language,
        regenerateProfile: true,
      }),
    });

    const data = await res.json();
    setDnaProfile(data.dna.generatedProfile);
    setDnaLoading(false);
  }

  async function handleRegenerate() {
    setDnaLoading(true);
    const res = await fetch("/api/dna", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tone: selectedTones[0] || "professional",
        audience,
        style: "mixed",
        emojiUsage,
        samplePosts: samplePosts.filter((p) => p.trim()),
        styleDiscoveryAnswers: {
          pairs: styleDiscoveryAnswers,
          writingExercise,
          adjustment,
        },
        preferredLanguage: language,
        regenerateProfile: true,
      }),
    });
    const data = await res.json();
    setDnaProfile(data.dna.generatedProfile);
    setDnaLoading(false);
    setAdjustment("");
  }

  function handleComplete() {
    router.push("/app");
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-center text-sm font-bold leading-8 text-white">
              N
            </div>
            <span className="font-display text-base font-bold tracking-tight text-zinc-900">
              NoPerson<span className="text-brand-600">AI</span>
            </span>
          </div>
        </div>
        <ProgressBar currentStep={step} totalSteps={4} />

        {step === 1 && (
          <StepBasics
            name={name}
            audience={audience}
            language={language}
            onChange={handleBasicChange}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepTone
            selectedTones={selectedTones}
            emojiUsage={emojiUsage}
            onToggleTone={toggleTone}
            onEmojiChange={setEmojiUsage}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}

        {step === 3 && (
          <StepStyle
            samplePosts={samplePosts}
            styleDiscoveryAnswers={styleDiscoveryAnswers}
            onSamplePostsChange={setSamplePosts}
            onStyleDiscoveryAnswer={(pairId, choice) =>
              setStyleDiscoveryAnswers((prev) => ({
                ...prev,
                [pairId]: choice,
              }))
            }
            writingExercise={writingExercise}
            onWritingExerciseChange={setWritingExercise}
            onNext={generateDNA}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <StepDNAResult
            profile={dnaProfile}
            isLoading={dnaLoading}
            adjustment={adjustment}
            onAdjustmentChange={setAdjustment}
            onRegenerate={handleRegenerate}
            onComplete={handleComplete}
            onBack={() => setStep(3)}
          />
        )}
      </div>
    </div>
  );
}
