"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useI18n } from "@/i18n/use-i18n";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import LinkedInPreview from "@/components/generator/LinkedInPreview";
import { ALLOWED_COUNTS } from "@/lib/bulk";

interface BulkClientProps {
  plan: "free" | "pro";
  initialPostsUsed: number;
  userName: string;
  userImage: string | null;
}

interface GeneratedPost {
  id: string;
  post: string;
  structure: string;
  language: string;
}

const FREE_LIMIT = 5;

export default function BulkClient({
  plan,
  initialPostsUsed,
  userName,
  userImage,
}: BulkClientProps) {
  const { t } = useI18n();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [count, setCount] = useState<(typeof ALLOWED_COUNTS)[number]>(5);
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [postsUsed, setPostsUsed] = useState(initialPostsUsed);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isPro = plan === "pro";
  const remaining = isPro ? Infinity : Math.max(0, FREE_LIMIT - postsUsed);
  const canSubmit =
    !loading && input.trim().length > 0 && (isPro || count <= remaining);

  async function generate() {
    if (!canSubmit) return;
    setLoading(true);
    setPosts([]);
    try {
      const res = await fetch("/api/generate/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, count }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === "quota_exceeded") {
        toast({
          title: t("bulk.quotaExceeded", { remaining: data.remaining }),
          variant: "error",
        });
        return;
      }
      if (!res.ok) {
        toast({ title: data.error || "Generation failed", variant: "error" });
        return;
      }
      setPosts(data.posts);
      setPostsUsed(data.postsUsed);
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setLoading(false);
    }
  }

  function copyPost(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast({ title: "Copied", variant: "success" });
    setTimeout(() => setCopiedId((curr) => (curr === id ? null : curr)), 2000);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          {t("bulk.title")}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">{t("bulk.subtitle")}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4 md:p-5">
        <label className="mb-1.5 block text-xs font-medium text-zinc-700">
          {t("bulk.topicLabel")}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />

        <div className="mt-4">
          <label className="mb-1.5 block text-xs font-medium text-zinc-700">
            {t("bulk.countLabel")}
          </label>
          <div className="flex gap-2">
            {ALLOWED_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setCount(n)}
                className={
                  count === n
                    ? "rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
                    : "rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                }
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 text-xs text-zinc-500">
          {isPro
            ? t("bulk.quotaPro")
            : t("bulk.quotaFree", { n: count, remaining })}
        </div>

        <div className="mt-4">
          <Button
            size="lg"
            fullWidth
            loading={loading}
            disabled={!canSubmit}
            onClick={generate}
            leftIcon={<Sparkles className="h-4 w-4" />}
          >
            {t("bulk.cta", { n: count })}
          </Button>
        </div>
      </div>

      {posts.length > 0 && (
        <div className="space-y-3">
          {posts.map((p) => (
            <LinkedInPreview
              key={p.id}
              post={p.post}
              userName={userName}
              userImage={userImage}
              isEditing={false}
              onEditToggle={() => {}}
              onPostChange={() => {}}
              onCopy={() => copyPost(p.id, p.post)}
              onSave={() => {}}
              onRegenerate={() => {}}
              copied={copiedId === p.id}
              isFavorite={false}
            />
          ))}
        </div>
      )}
    </div>
  );
}
