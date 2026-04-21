"use client";

import { useState, useEffect } from "react";
import { Heart, Copy, Check, Trash2, Clock, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import ScheduleButton from "@/components/generator/ScheduleButton";

interface HistoryPost {
  id: string;
  input: string;
  output: string;
  language: "de" | "en";
  isFavorite: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const { toast } = useToast();
  const [posts, setPosts] = useState<HistoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [langFilter, setLangFilter] = useState<"all" | "de" | "en">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const params = new URLSearchParams();
      if (filter === "favorites") params.set("favorites", "true");
      if (langFilter !== "all") params.set("language", langFilter);
      const res = await fetch(`/api/posts?${params}`);
      const data = await res.json();
      if (cancelled) return;
      setPosts(data.posts || []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [filter, langFilter]);

  async function toggleFavorite(id: string, current: boolean) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, isFavorite: !current } : p)));
  }

  async function deletePost(id: string) {
    if (!confirm("Delete this post?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Post deleted" });
  }

  function copyPost(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getHook(text: string): string {
    const firstLine = text.split("\n")[0];
    return firstLine.length > 80 ? firstLine.slice(0, 80) + "…" : firstLine;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          History
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Every post you&apos;ve generated.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {(["all", "favorites"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-zinc-900 text-white"
                : "bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50",
            )}
          >
            {f === "favorites" && <Heart className="h-3.5 w-3.5" />}
            {f === "all" ? "All" : "Favorites"}
          </button>
        ))}
        <div className="flex-1" />
        <div className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-white px-2.5 py-1 text-xs">
          <Languages className="h-3.5 w-3.5 text-zinc-400" />
          <select
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value as "all" | "de" | "en")}
            className="bg-transparent focus:outline-none"
          >
            <option value="all">All</option>
            <option value="en">EN</option>
            <option value="de">DE</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
          <Clock className="mx-auto h-8 w-8 text-zinc-300" />
          <p className="mt-3 font-display text-sm font-semibold text-zinc-900">No posts yet</p>
          <p className="mt-1 text-sm text-zinc-500">Your generated posts will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const expanded = expandedId === post.id;
            return (
              <div key={post.id} className="rounded-2xl border border-zinc-200 bg-white transition-shadow hover:shadow-sm">
                <button
                  onClick={() => setExpandedId(expanded ? null : post.id)}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900">{getHook(post.output)}</p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <span className="uppercase">{post.language}</span>
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(post.id, post.isFavorite);
                    }}
                    className="shrink-0 rounded-full p-1 text-zinc-300 transition-colors hover:bg-zinc-100"
                  >
                    <Heart
                      className={cn(
                        "h-4 w-4",
                        post.isFavorite && "fill-rose-500 text-rose-500",
                      )}
                    />
                  </button>
                </button>
                {expanded && (
                  <div className="space-y-3 border-t border-zinc-100 px-4 py-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-zinc-800">
                      {post.output}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => copyPost(post.id, post.output)}
                        leftIcon={
                          copiedId === post.id ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )
                        }
                      >
                        {copiedId === post.id ? "Copied" : "Copy"}
                      </Button>
                      <ScheduleButton postId={post.id} content={post.output} />
                      <button
                        onClick={() => deletePost(post.id)}
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-zinc-500 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
