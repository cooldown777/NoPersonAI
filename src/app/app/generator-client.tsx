"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Lock } from "lucide-react";
import IdeaInput from "@/components/generator/IdeaInput";
import LinkedInPreview from "@/components/generator/LinkedInPreview";
import RefinementChips from "@/components/generator/RefinementChips";
import CustomInstruction from "@/components/generator/CustomInstruction";
import PostCounter from "@/components/generator/PostCounter";
import VariantSelector, { type VariantCount } from "@/components/generator/VariantSelector";
import ScheduleButton from "@/components/generator/ScheduleButton";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import type { RefinementAction } from "@/lib/ai/types";
import { trackEvent } from "@/lib/analytics/meta-pixel";

interface GeneratorClientProps {
  plan: "free" | "pro";
  initialPostsUsed: number;
  userName: string;
  userImage?: string | null;
}

interface SingleResult {
  id: string;
  post: string;
  language: "de" | "en";
  postsUsed: number;
}

interface BulkResultItem {
  id: string;
  post: string;
  structure: string;
  language: string;
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
  const [count, setCount] = useState<VariantCount>(1);
  const [single, setSingle] = useState<SingleResult | null>(null);
  const [currentPost, setCurrentPost] = useState("");
  const [bulk, setBulk] = useState<BulkResultItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [postsUsed, setPostsUsed] = useState(initialPostsUsed);
  const [isFavorite, setIsFavorite] = useState(false);

  const isPro = plan === "pro";
  const remaining = isPro ? null : Math.max(0, FREE_LIMIT - postsUsed);
  const limitReached = !isPro && postsUsed >= FREE_LIMIT;
  const hasResult = single !== null || bulk.length > 0;
  const unaffordable = !isPro && remaining !== null && count > remaining;

  function resetResults() {
    setSingle(null);
    setCurrentPost("");
    setBulk([]);
    setIsFavorite(false);
    setIsEditing(false);
  }

  const generate = useCallback(async () => {
    if (!input.trim() || unaffordable) return;
    setIsGenerating(true);
    resetResults();
    try {
      if (count === 1) {
        const res = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input }),
        });
        if (res.status === 403) {
          setPostsUsed(FREE_LIMIT);
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
          setSingle(data);
          setCurrentPost(data.post);
          setPostsUsed(data.postsUsed);
          trackEvent("Lead", { content_name: "post_generated", count: 1 });
        }
      } else {
        const res = await fetch("/api/generate/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ input, count }),
        });
        const data = await res.json();
        if (res.status === 403 && data.error === "quota_exceeded") {
          toast({
            title: "Not enough free posts left",
            description: `You have ${data.remaining} remaining. Upgrade to Pro for unlimited.`,
            variant: "error",
          });
          return;
        }
        if (!res.ok) {
          toast({ title: data.error || "Generation failed", variant: "error" });
          return;
        }
        setBulk(data.posts);
        setPostsUsed(data.postsUsed);
        trackEvent("Lead", { content_name: "post_generated", count });
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setIsGenerating(false);
    }
  }, [input, count, unaffordable, toast]);

  async function refine(action: RefinementAction, customInstruction?: string) {
    if (!single) return;
    setIsRefining(true);
    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: single.id,
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

  function copyBulk(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied", variant: "success" });
    setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
  }

  async function handleSave() {
    if (!single) return;
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    await fetch(`/api/posts/${single.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: nextFavorite }),
    });
    toast({ title: nextFavorite ? "Saved to favorites" : "Removed from favorites" });
  }

  const generateLabel = count === 1 ? "Generate" : `Generate ${count} variants`;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Create a post
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Drop an idea. Pick how many variants you want. We&apos;ll turn it into LinkedIn-native drafts in your voice.
        </p>
      </div>

      <PostCounter used={postsUsed} limit={FREE_LIMIT} plan={plan} />

      <IdeaInput
        value={input}
        onChange={setInput}
        onGenerate={generate}
        isGenerating={isGenerating}
        disabled={limitReached || hasResult || unaffordable}
        isPro={isPro}
        generateLabel={generateLabel}
      />

      <VariantSelector
        value={count}
        onChange={setCount}
        disabled={isGenerating || hasResult}
        remaining={remaining}
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

      {hasResult && (
        <button
          type="button"
          onClick={() => { resetResults(); setInput(""); }}
          className="text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          ← New post
        </button>
      )}

      {single && currentPost && (
        <div className="space-y-3">
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
                language={single.language}
              />
              <CustomInstruction
                onSubmit={(instruction) => refine("custom", instruction)}
                isRefining={isRefining}
              />
              <ScheduleButton postId={single.id} content={currentPost} />
            </>
          )}
        </div>
      )}

      {bulk.length > 0 && (
        <div className="space-y-3">
          {bulk.map((p) => (
            <LinkedInPreview
              key={p.id}
              post={p.post}
              userName={userName}
              userImage={userImage}
              isEditing={false}
              onEditToggle={() => {}}
              onPostChange={() => {}}
              onCopy={() => copyBulk(p.id, p.post)}
              onSave={() => {}}
              copied={copiedId === p.id}
              isFavorite={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
