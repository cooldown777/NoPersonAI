"use client";

import { useState } from "react";
import {
  styleDiscoveryPairs,
  type PostPair,
} from "@/data/style-discovery-posts";

interface StepStyleProps {
  samplePosts: string[];
  styleDiscoveryAnswers: Record<string, string>;
  onSamplePostsChange: (posts: string[]) => void;
  onStyleDiscoveryAnswer: (pairId: string, choice: string) => void;
  writingExercise: string;
  onWritingExerciseChange: (text: string) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function StepStyle({
  samplePosts,
  styleDiscoveryAnswers,
  onSamplePostsChange,
  onStyleDiscoveryAnswer,
  writingExercise,
  onWritingExerciseChange,
  onNext,
  onBack,
}: StepStyleProps) {
  const [mode, setMode] = useState<"choose" | "paste" | "discover" | null>(
    null
  );

  function updatePost(index: number, value: string) {
    const updated = [...samplePosts];
    updated[index] = value;
    onSamplePostsChange(updated);
  }

  function addPost() {
    if (samplePosts.length < 5) {
      onSamplePostsChange([...samplePosts, ""]);
    }
  }

  if (!mode) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your style</h2>
          <p className="mt-1 text-sm text-gray-600">
            Help us understand how you write
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => {
              setMode("paste");
              if (samplePosts.length === 0) onSamplePostsChange([""]);
            }}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">
              I have LinkedIn posts
            </div>
            <div className="text-xs text-gray-500">
              Paste 1-5 posts so we can learn your voice
            </div>
          </button>

          <button
            onClick={() => setMode("discover")}
            className="w-full rounded-lg border-2 border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">
              I&apos;m new to LinkedIn
            </div>
            <div className="text-xs text-gray-500">
              We&apos;ll help you find your style
            </div>
          </button>

          <button
            onClick={onNext}
            className="w-full rounded-lg border border-dashed border-gray-200 bg-white px-4 py-4 text-left hover:border-gray-300 transition-colors"
          >
            <div className="text-sm font-medium text-gray-900">
              Skip — train my DNA later
            </div>
            <div className="text-xs text-gray-500">
              We&apos;ll start with sensible defaults
            </div>
          </button>
        </div>

        <button
          onClick={onBack}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
      </div>
    );
  }

  if (mode === "paste") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Paste your LinkedIn posts
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            We&apos;ll analyze your writing patterns
          </p>
        </div>

        <div className="space-y-3">
          {samplePosts.map((post, i) => (
            <textarea
              key={i}
              value={post}
              onChange={(e) => updatePost(i, e.target.value)}
              placeholder={`Post ${i + 1}...`}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ))}
          {samplePosts.length < 5 && (
            <button
              onClick={addPost}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              + Add another post
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setMode(null)}
            className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Analyze my style
          </button>
        </div>
      </div>
    );
  }

  // mode === "discover"
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Find your style</h2>
        <p className="mt-1 text-sm text-gray-600">
          Pick which post feels more like you
        </p>
      </div>

      <div className="space-y-6">
        {styleDiscoveryPairs.map((pair: PostPair) => (
          <div key={pair.id} className="space-y-2">
            <p className="text-sm font-medium text-gray-700">{pair.label}</p>
            <div className="space-y-2">
              {(["optionA", "optionB"] as const).map((key) => {
                const option = pair[key];
                const selected =
                  styleDiscoveryAnswers[pair.id] === option.style;
                return (
                  <button
                    key={key}
                    onClick={() =>
                      onStyleDiscoveryAnswer(pair.id, option.style)
                    }
                    className={`w-full rounded-lg border-2 px-3 py-3 text-left text-xs whitespace-pre-line transition-colors ${
                      selected
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <div>
          <p className="text-sm font-medium text-gray-700">
            Quick exercise: Describe a recent win in 2-3 sentences
          </p>
          <textarea
            value={writingExercise}
            onChange={(e) => onWritingExerciseChange(e.target.value)}
            placeholder="e.g. Last week we landed our biggest client yet..."
            rows={3}
            className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setMode(null)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Generate my DNA
        </button>
      </div>
    </div>
  );
}
