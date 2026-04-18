"use client";

import { useState, useEffect } from "react";
import { Pencil, Sparkles, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

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
  const { toast } = useToast();
  const [dna, setDna] = useState<DNAData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

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
    try {
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
      if (!res.ok) throw new Error(data.error || "Failed");
      setDna(data.dna);
      setEditing(false);
      toast({
        title: regenerate ? "DNA regenerated" : "Changes saved",
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  if (!dna) {
    return (
      <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
        <p className="text-sm text-zinc-500">Complete onboarding first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Writing DNA
        </h1>
        <p className="mt-1 text-sm text-zinc-500">Your voice fingerprint. Used for every post.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <CardTitle className="text-base">Voice profile</CardTitle>
          </div>
          <CardDescription>AI-generated description of how you write.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="rounded-2xl bg-brand-50 p-4 text-sm leading-relaxed text-zinc-800">
            {dna.generatedProfile}
          </p>
        </CardContent>
      </Card>

      {!editing ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <Row label="Tone" value={<Badge variant="brand" className="capitalize">{dna.tone}</Badge>} />
                <Row label="Audience" value={<span className="text-sm text-zinc-900">{dna.audience}</span>} />
                <Row label="Style" value={<Badge variant="neutral" className="capitalize">{dna.style}</Badge>} />
                <Row label="Emojis" value={<Badge variant="neutral" className="capitalize">{dna.emojiUsage}</Badge>} />
                <Row label="Sample posts" value={<span className="text-sm text-zinc-900">{dna.samplePosts.length}</span>} />
                <Row label="Language" value={<Badge variant="neutral" className="uppercase">{dna.preferredLanguage}</Badge>} />
              </dl>
            </CardContent>
          </Card>

          <Button
            variant="outline"
            size="lg"
            fullWidth
            onClick={() => setEditing(true)}
            leftIcon={<Pencil className="h-4 w-4" />}
          >
            Edit DNA
          </Button>
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Edit DNA</CardTitle>
            <CardDescription>Regenerate the profile after meaningful changes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700">Tone</label>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="storytelling">Storytelling</option>
                <option value="controversial">Controversial</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700">Target audience</label>
              <Input value={audience} onChange={(e) => setAudience(e.target.value)} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-zinc-700">Emoji usage</label>
              <select
                value={emojiUsage}
                onChange={(e) => setEmojiUsage(e.target.value)}
                className="h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
              >
                <option value="none">None</option>
                <option value="light">Light</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-700">
                  Sample posts ({samplePosts.length}/5)
                </label>
              </div>
              <div className="space-y-2">
                {samplePosts.map((post, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Textarea
                      value={post}
                      onChange={(e) => {
                        const updated = [...samplePosts];
                        updated[i] = e.target.value;
                        setSamplePosts(updated);
                      }}
                      rows={3}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSamplePosts(samplePosts.filter((_, idx) => idx !== i))
                      }
                      className="shrink-0 rounded-md p-2 text-zinc-400 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {samplePosts.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setSamplePosts([...samplePosts, ""])}
                    className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add sample
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => handleSave(false)} loading={saving}>
                Save
              </Button>
              <Button onClick={() => handleSave(true)} loading={saving} leftIcon={<Sparkles className="h-3.5 w-3.5" />}>
                Save &amp; regenerate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-zinc-500">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
