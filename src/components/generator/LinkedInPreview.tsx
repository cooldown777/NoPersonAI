"use client";

import { useState } from "react";

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
}: LinkedInPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const previewLimit = 210;
  const needsTruncation = !isEditing && post.length > previewLimit && !expanded;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="h-10 w-10 rounded-full bg-gray-300 overflow-hidden">
          {userImage ? (
            <img src={userImage} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-gray-600">
              {userName?.charAt(0)?.toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900">{userName}</div>
          <div className="text-xs text-gray-500">Just now</div>
        </div>
      </div>

      <div className="px-4 py-3">
        {isEditing ? (
          <textarea
            value={post}
            onChange={(e) => onPostChange(e.target.value)}
            rows={10}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        ) : (
          <div className="text-sm leading-relaxed text-gray-900 whitespace-pre-line">
            {needsTruncation ? (
              <>
                {post.slice(0, previewLimit)}...
                <button
                  onClick={() => setExpanded(true)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
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

      <div className="flex items-center gap-2 border-t border-gray-100 px-4 py-3">
        <button
          onClick={onCopy}
          className="flex-1 rounded-lg bg-blue-600 px-3 py-2.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          {copied ? "Copied!" : "Copy to clipboard"}
        </button>
        <button
          onClick={onEditToggle}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {isEditing ? "Done" : "Edit"}
        </button>
        <button
          onClick={onSave}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Save
        </button>
        <button
          onClick={onRegenerate}
          className="rounded-lg border border-gray-300 px-3 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Redo
        </button>
      </div>
    </div>
  );
}
