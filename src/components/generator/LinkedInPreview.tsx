"use client";

import { useState } from "react";
import { Copy, Check, Pencil, RefreshCw, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface LinkedInPreviewProps {
  post: string;
  userName: string;
  userImage?: string | null;
  isEditing: boolean;
  onEditToggle: () => void;
  onPostChange: (text: string) => void;
  onCopy: () => void;
  onSave: () => void;
  onRegenerate: () => void;
  copied: boolean;
  isFavorite?: boolean;
}

export default function LinkedInPreview({
  post,
  userName,
  userImage,
  isEditing,
  onEditToggle,
  onPostChange,
  onCopy,
  onSave,
  onRegenerate,
  copied,
  isFavorite,
}: LinkedInPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const previewLimit = 210;
  const needsTruncation = !isEditing && post.length > previewLimit && !expanded;

  return (
    <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-5 pt-5">
        <div className="relative h-11 w-11 overflow-hidden rounded-full bg-zinc-200">
          {userImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-zinc-600">
              {userName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-zinc-900">{userName}</div>
          <div className="text-xs text-zinc-500">Just now · 🌐</div>
        </div>
      </div>

      <div className="px-5 pt-3">
        {isEditing ? (
          <textarea
            value={post}
            onChange={(e) => onPostChange(e.target.value)}
            rows={12}
            className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm leading-relaxed text-zinc-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
          />
        ) : (
          <div className="whitespace-pre-line text-[15px] leading-[1.55] text-zinc-900">
            {needsTruncation ? (
              <>
                {post.slice(0, previewLimit)}…
                <button
                  onClick={() => setExpanded(true)}
                  className="ml-1 text-zinc-500 hover:text-zinc-700"
                >
                  see more
                </button>
              </>
            ) : (
              post
            )}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-100 px-3 py-2">
        <button
          onClick={onCopy}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            copied
              ? "bg-accent-50 text-accent-700"
              : "bg-brand-50 text-brand-700 hover:bg-brand-100",
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={onEditToggle}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isEditing
                ? "bg-zinc-900 text-white hover:bg-zinc-800"
                : "text-zinc-600 hover:bg-zinc-100",
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
            {isEditing ? "Done" : "Edit"}
          </button>
          <button
            onClick={onSave}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              isFavorite
                ? "text-rose-600 hover:bg-rose-50"
                : "text-zinc-600 hover:bg-zinc-100",
            )}
            aria-label="Save"
          >
            <Heart className={cn("h-3.5 w-3.5", isFavorite && "fill-current")} />
          </button>
          <button
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
            aria-label="Regenerate"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
