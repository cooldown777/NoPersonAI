"use client";

import { useState, useEffect } from "react";

const placeholders = [
  "I just closed my first 6-figure deal...",
  "Why cold outreach is broken in 2026...",
  "3 lessons from firing my first employee...",
  "The best advice I ignored for years...",
  "I spent 2 hours on a task AI did in 5 minutes...",
];

interface IdeaInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  disabled: boolean;
}

export default function IdeaInput({
  value,
  onChange,
  onGenerate,
  isGenerating,
  disabled,
}: IdeaInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey && value.trim()) {
      e.preventDefault();
      onGenerate();
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholders[placeholderIndex]}
        rows={3}
        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={onGenerate}
        disabled={!value.trim() || isGenerating || disabled}
        className="w-full rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            Generating...
          </span>
        ) : (
          "Generate post"
        )}
      </button>
    </div>
  );
}
