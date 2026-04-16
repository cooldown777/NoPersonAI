"use client";

import { useState, useEffect } from "react";

interface HistoryPost {
  id: string;
  input: string;
  output: string;
  language: "de" | "en";
  isFavorite: boolean;
  createdAt: string;
}

export default function HistoryPage() {
  const [posts, setPosts] = useState<HistoryPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "favorites">("all");
  const [langFilter, setLangFilter] = useState<"all" | "de" | "en">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, [filter, langFilter]);

  async function fetchPosts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === "favorites") params.set("favorites", "true");
    if (langFilter !== "all") params.set("language", langFilter);

    const res = await fetch(`/api/posts?${params}`);
    const data = await res.json();
    setPosts(data.posts);
    setLoading(false);
  }

  async function toggleFavorite(id: string, current: boolean) {
    await fetch(`/api/posts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isFavorite: !current }),
    });
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFavorite: !current } : p))
    );
  }

  function copyPost(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  function getHook(text: string): string {
    const firstLine = text.split("\n")[0];
    return firstLine.length > 80 ? firstLine.slice(0, 80) + "..." : firstLine;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">History</h1>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "all"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("favorites")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            filter === "favorites"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Favorites
        </button>
        <div className="flex-1" />
        <select
          value={langFilter}
          onChange={(e) => setLangFilter(e.target.value as "all" | "de" | "en")}
          className="rounded-full border border-gray-300 px-3 py-1.5 text-xs"
        >
          <option value="all">All languages</option>
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : posts.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-500">
          No posts yet. Create your first one!
        </p>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="rounded-xl border border-gray-200 bg-white"
            >
              <button
                onClick={() =>
                  setExpandedId(expandedId === post.id ? null : post.id)
                }
                className="flex w-full items-center gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {getHook(post.output)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}{" "}
                    <span className="uppercase">{post.language}</span>
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(post.id, post.isFavorite);
                  }}
                  className="shrink-0 text-lg"
                >
                  {post.isFavorite ? (
                    <span className="text-yellow-500">&#9733;</span>
                  ) : (
                    <span className="text-gray-300">&#9734;</span>
                  )}
                </button>
              </button>

              {expandedId === post.id && (
                <div className="border-t border-gray-100 px-4 py-3">
                  <p className="whitespace-pre-line text-sm text-gray-800">
                    {post.output}
                  </p>
                  <button
                    onClick={() => copyPost(post.id, post.output)}
                    className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
                  >
                    {copiedId === post.id ? "Copied!" : "Copy to clipboard"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
