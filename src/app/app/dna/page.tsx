"use client";

import { useState, useEffect } from "react";

interface DNAData {
  tone: string;
  audience: string;
  style: string;
  emojiUsage: string;
  samplePosts: string[];
  generatedProfile: string;
  onboardingMethod: string;
  preferredLanguage: string;
}

export default function DNAPage() {
  const [dna, setDna] = useState<DNAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  // Edit state
  const [tone, setTone] = useState("");
  const [audience, setAudience] = useState("");
  const [emojiUsage, setEmojiUsage] = useState("");
  const [samplePosts, setSamplePosts] = useState<string[]>([]);

  useEffect(() => {
    fetchDNA();
  }, []);

  async function fetchDNA() {
    const res = await fetch("/api/dna");
    const data = await res.json();
    setDna(data.dna);
    if (data.dna) {
      setTone(data.dna.tone);
      setAudience(data.dna.audience);
      setEmojiUsage(data.dna.emojiUsage);
      setSamplePosts(data.dna.samplePosts);
    }
    setLoading(false);
  }

  async function handleSave(regenerate: boolean) {
    setSaving(true);
    const res = await fetch("/api/dna", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tone,
        audience,
        style: dna?.style || "mixed",
        emojiUsage,
        samplePosts: samplePosts.filter((p) => p.trim()),
        preferredLanguage: dna?.preferredLanguage || "en",
        regenerateProfile: regenerate,
      }),
    });
    const data = await res.json();
    setDna(data.dna);
    setSaving(false);
    setEditing(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!dna) {
    return (
      <p className="py-8 text-center text-sm text-gray-500">
        Complete onboarding first.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-gray-900">Your Writing DNA</h1>

      {/* Profile summary */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm leading-relaxed text-gray-800">
          {dna.generatedProfile}
        </p>
      </div>

      {/* Current settings */}
      {!editing ? (
        <div className="space-y-3">
          <div className="rounded-xl border border-gray-200 bg-white p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Tone</span>
              <span className="font-medium text-gray-900 capitalize">
                {dna.tone}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Audience</span>
              <span className="font-medium text-gray-900">{dna.audience}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Emojis</span>
              <span className="font-medium text-gray-900 capitalize">
                {dna.emojiUsage}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sample posts</span>
              <span className="font-medium text-gray-900">
                {dna.samplePosts.length}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Method</span>
              <span className="font-medium text-gray-900 capitalize">
                {dna.onboardingMethod.replace("_", " ")}
              </span>
            </div>
          </div>

          <button
            onClick={() => setEditing(true)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Edit settings
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="storytelling">Storytelling</option>
              <option value="controversial">Controversial</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Target audience
            </label>
            <input
              type="text"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Emoji usage
            </label>
            <select
              value={emojiUsage}
              onChange={(e) => setEmojiUsage(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm"
            >
              <option value="none">None</option>
              <option value="light">Light</option>
              <option value="heavy">Heavy</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sample posts ({samplePosts.length}/5)
            </label>
            {samplePosts.map((post, i) => (
              <textarea
                key={i}
                value={post}
                onChange={(e) => {
                  const updated = [...samplePosts];
                  updated[i] = e.target.value;
                  setSamplePosts(updated);
                }}
                rows={3}
                className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
            ))}
            {samplePosts.length < 5 && (
              <button
                onClick={() => setSamplePosts([...samplePosts, ""])}
                className="mt-1 text-xs text-blue-600"
              >
                + Add post
              </button>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
            >
              Save
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex-1 rounded-xl bg-blue-600 px-4 py-3 text-sm font-medium text-white"
            >
              {saving ? "..." : "Save & regenerate DNA"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
