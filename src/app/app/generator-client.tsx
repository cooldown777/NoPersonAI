"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import IdeaInput from "@/components/generator/IdeaInput";
import LinkedInPreview from "@/components/generator/LinkedInPreview";
import RefinementChips from "@/components/generator/RefinementChips";
import CustomInstruction from "@/components/generator/CustomInstruction";
import PostCounter from "@/components/generator/PostCounter";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { RefinementAction } from "@/lib/ai/types";

interface GeneratorClientProps {
  plan: "free" | "pro";
  initialPostsUsed: number;
  userName: string;
  userImage?: string | null;
}

interface GeneratedPost {
  id: string;
  post: string;
  language: "de" | "en";
  postsUsed: number;
}

const FREE_LIMIT = 5;

export default function GeneratorClient({
  plan,
  initialPostsUsed,
  userName,
  userImage,
}: GeneratorClientProps) {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [currentPost, setCurrentPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [postsUsed, setPostsUsed] = useState(initialPostsUsed);
  const [isFavorite, setIsFavorite] = useState(false);

  const isPro = plan === "pro";
  const limitReached = !isPro && postsUsed >= FREE_LIMIT;

  const generate = useCallback(async () => {
    if (!input.trim()) return;
    setIsGenerating(true);
    setIsFavorite(false);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });
      if (res.status === 403) {
        setPostsUsed(FREE_LIMIT);
        setIsGenerating(false);
        toast({
          title: "Monthly limit reached",
          description: "Upgrade to Pro for unlimited posts.",
          variant: "error",
        });
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Generation failed", description: data.error, variant: "error" });
      } else {
        setResult(data);
        setCurrentPost(data.post);
        setPostsUsed(data.postsUsed);
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setIsGenerating(false);
    }
  }, [input, toast]);

  async function refine(action: RefinementAction, customInstruction?: string) {
    if (!result) return;
    setIsRefining(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: result.id,
          action,
          customInstruction: customInstruction || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Refinement failed", description: data.error, variant: "error" });
      } else {
        setCurrentPost(data.post);
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setIsRefining(false);
    }
  }

  function handleCopy() {
    if (!currentPost) return;
    navigator.clipboard.writeText(currentPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied to clipboard", variant: "success" });
  }

  async function handleSave() {
    if (!result) return;
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    await fetch(`/api/posts/${result.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: nextFavorite }),
    });
    toast({ title: nextFavorite ? "Saved to favorites" : "Removed from favorites" });
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Create a post
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Drop an idea. Our AI will turn it into a LinkedIn-native draft in your voice.
        </p>
      </div>

      <PostCounter used={postsUsed} limit={FREE_LIMIT} plan={plan} />

      <IdeaInput
        value={input}
        onChange={setInput}
        onGenerate={generate}
        isGenerating={isGenerating}
        disabled={limitReached || !!result}
        isPro={isPro}
      />

      {limitReached && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Lock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div className="flex-1">
            <div className="font-display text-sm font-semibold text-amber-900">
              You&apos;ve used all 5 free posts this month
            </div>
            <p className="mt-1 text-sm text-amber-800">
              Upgrade to Pro for unlimited posts and WhatsApp integration.
            </p>
            <Link href="/app/account" className="mt-3 inline-block">
              <Button size="sm" variant="accent" leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </div>
      )}

      {result && currentPost && (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => { setResult(null); setCurrentPost(""); setInput(""); setIsFavorite(false); }}
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            ← New post
          </button>
          <LinkedInPreview
            post={currentPost}
            userName={userName}
            userImage={userImage}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing((e) => !e)}
            onPostChange={setCurrentPost}
            onCopy={handleCopy}
            onSave={handleSave}
            copied={copied}
            isFavorite={isFavorite}
          />
          {!isEditing && (
            <>
              <RefinementChips
                onRefine={(action) => refine(action)}
                isRefining={isRefining}
                language={result.language}
              />
              <CustomInstruction
                onSubmit={(instruction) => refine("custom", instruction)}
                isRefining={isRefining}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
}
