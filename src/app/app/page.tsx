"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import IdeaInput from "@/components/generator/IdeaInput";
import LinkedInPreview from "@/components/generator/LinkedInPreview";
import RefinementChips from "@/components/generator/RefinementChips";
import CustomInstruction from "@/components/generator/CustomInstruction";
import PostCounter from "@/components/generator/PostCounter";
import type { RefinementAction } from "@/lib/ai/types";

interface GeneratedPost {
  id: string;
  post: string;
  language: "de" | "en";
  postsUsed: number;
}

export default function GeneratorPage() {
  const { data: session } = useSession();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<GeneratedPost | null>(null);
  const [currentPost, setCurrentPost] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [postsUsed, setPostsUsed] = useState(0);
  const [limitReached, setLimitReached] = useState(false);

  const generate = useCallback(async () => {
    setIsGenerating(true);
    setLimitReached(false);

    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });

    if (res.status === 403) {
      setLimitReached(true);
      setIsGenerating(false);
      return;
    }

    const data = await res.json();
    setResult(data);
    setCurrentPost(data.post);
    setPostsUsed(data.postsUsed);
    setIsGenerating(false);
  }, [input]);

  async function refine(action: RefinementAction, customInstruction?: string) {
    if (!result) return;
    setIsRefining(true);

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
    setCurrentPost(data.post);
    setIsRefining(false);
  }

  function handleCopy() {
    navigator.clipboard.writeText(currentPost);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Create a post</h1>

      <PostCounter used={postsUsed} limit={5} plan="free" />

      <IdeaInput
        value={input}
        onChange={setInput}
        onGenerate={generate}
        isGenerating={isGenerating}
        disabled={limitReached}
      />

      {limitReached && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-center">
          <p className="text-sm font-medium text-orange-800">
            You&apos;ve reached your monthly limit
          </p>
          <p className="mt-1 text-xs text-orange-600">
            Upgrade to Pro for unlimited posts
          </p>
          <button className="mt-3 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700 transition-colors">
            Upgrade to Pro
          </button>
        </div>
      )}

      {result && currentPost && (
        <div className="space-y-3">
          <LinkedInPreview
            post={currentPost}
            userName={session?.user?.name || "You"}
            userImage={session?.user?.image}
            isEditing={isEditing}
            onEditToggle={() => setIsEditing(!isEditing)}
            onPostChange={setCurrentPost}
            onCopy={handleCopy}
            onSave={() => {}}
            onRegenerate={generate}
            copied={copied}
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
