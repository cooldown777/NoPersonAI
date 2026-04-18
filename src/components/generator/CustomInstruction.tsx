"use client";

import { useState } from "react";
import { Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
        className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
      >
        <Plus className="h-3.5 w-3.5" />
        Custom refinement
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        value={instruction}
        onChange={(e) => setInstruction(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Tell the AI what to change..."
        autoFocus
        className="h-10"
      />
      <Button
        size="md"
        onClick={handleSubmit}
        disabled={!instruction.trim() || isRefining}
        loading={isRefining}
        rightIcon={!isRefining && <ArrowRight className="h-3.5 w-3.5" />}
      >
        Apply
      </Button>
    </div>
  );
}
