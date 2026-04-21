"use client";

import { useEffect, useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { LinkedInIcon } from "@/components/brand/LinkedInIcon";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface Props {
  postId?: string;
  content: string;
}

function defaultLocalDatetime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 60);
  now.setSeconds(0);
  now.setMilliseconds(0);
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 16);
}

export default function ScheduleButton({ postId, content }: Props) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [when, setWhen] = useState(defaultLocalDatetime());
  const [submitting, setSubmitting] = useState(false);
  const [connected, setConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/linkedin/status")
      .then((r) => r.json())
      .then((d) => setConnected(!!d.connected))
      .catch(() => setConnected(false));
  }, [open]);

  async function submit() {
    setSubmitting(true);
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const scheduledFor = new Date(when).toISOString();
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, scheduledFor, timezone: tz, postId }),
    });
    const data = await res.json();
    if (res.ok) {
      toast({ title: "Scheduled", description: "We'll publish it for you." });
      setOpen(false);
    } else if (data.error === "linkedin_not_connected") {
      setConnected(false);
    } else {
      toast({ title: data.error || "Could not schedule", variant: "error" });
    }
    setSubmitting(false);
  }

  if (!open) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
        leftIcon={<Calendar className="h-3.5 w-3.5" />}
      >
        Schedule
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-zinc-500" />
        <span className="font-display text-sm font-semibold text-zinc-900">
          Schedule this post
        </span>
      </div>

      {connected === false && (
        <div className="flex items-start gap-2 rounded-xl border border-[#0a66c2]/20 bg-[#0a66c2]/5 p-3 text-sm">
          <LinkedInIcon className="mt-0.5 h-4 w-4 shrink-0 text-[#0a66c2]" />
          <div>
            Connect LinkedIn first.{" "}
            <Link href="/app/account" className="font-medium text-[#0a66c2] underline">
              Open settings
            </Link>
          </div>
        </div>
      )}

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-700">When</label>
        <input
          type="datetime-local"
          value={when}
          min={defaultLocalDatetime().slice(0, 16)}
          onChange={(e) => setWhen(e.target.value)}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <p className="mt-1 text-xs text-zinc-500">
          Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={submit}
          disabled={submitting || connected === false}
          leftIcon={submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : undefined}
        >
          Confirm schedule
        </Button>
        <Button size="sm" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
