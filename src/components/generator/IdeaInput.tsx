"use client";

import { useState, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import VoiceRecorder from "./VoiceRecorder";

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
  isPro: boolean;
}

export default function IdeaInput({
  value,
  onChange,
  onGenerate,
  isGenerating,
  disabled,
  isPro,
}: IdeaInputProps) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % placeholders.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && value.trim()) {
      e.preventDefault();
      onGenerate();
    }
  }

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white shadow-sm">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholders[placeholderIndex]}
        rows={4}
        className="block w-full resize-none rounded-t-3xl bg-transparent px-5 py-4 text-base text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
      />
      <div className="flex items-center gap-3 border-t border-zinc-100 p-3">
        <VoiceRecorder
          isPro={isPro}
          onTranscribed={(text) =>
            onChange(value ? `${value.trim()}\n\n${text}` : text)
          }
        />
        <div className="flex-1 text-xs text-zinc-400">
          <span className="hidden sm:inline">⌘+Enter to generate · </span>
          {value.length} chars
        </div>
        <Button
          size="md"
          onClick={onGenerate}
          disabled={!value.trim() || isGenerating || disabled}
          loading={isGenerating}
          rightIcon={!isGenerating && <Send className="h-4 w-4" />}
          leftIcon={!isGenerating && <Sparkles className="h-4 w-4" />}
        >
          Generate
        </Button>
      </div>
    </div>
  );
}
