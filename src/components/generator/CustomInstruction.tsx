"use client";

import { useState } from "react";

interface CustomInstructionProps {
  onSubmit: (instruction: string) => void;
  isRefining: boolean;
}

export default function CustomInstruction({
  onSubmit,
  isRefining,
}: CustomInstructionProps) {
  const [expanded, setExpanded] = useState(false);
  const [instruction, setInstruction] = useState("");

  function handleSubmit() {
    if (instruction.trim()) {
      onSubmit(instruction.trim());
      setInstruction("");
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="text-xs text-blue-600 hover:text-blue-700"
      >
        Custom instruction...
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Tell the AI what to change..."
        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <button
        onClick={handleSubmit}
        disabled={!instruction.trim() || isRefining}
        className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        Apply
      </button>
    </div>
  );
}
