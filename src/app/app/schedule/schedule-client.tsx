"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Calendar, Loader2, Trash2, Send, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { LinkedInIcon } from "@/components/brand/LinkedInIcon";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

type Status = "pending" | "publishing" | "published" | "failed" | "cancelled";

interface Schedule {
  id: string;
  content: string;
  scheduledFor: string;
  status: Status;
  linkedInUrn: string | null;
  failureReason: string | null;
}

interface Props {
  linkedInConnected: boolean;
  initialSchedules: Schedule[];
}

const statusMeta: Record<Status, { label: string; variant: "neutral" | "success" | "warning" | "danger" | "brand" }> = {
  pending: { label: "Scheduled", variant: "brand" },
  publishing: { label: "Publishing…", variant: "warning" },
  published: { label: "Published", variant: "success" },
  failed: { label: "Failed", variant: "danger" },
  cancelled: { label: "Cancelled", variant: "neutral" },
};

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ScheduleClient({ linkedInConnected, initialSchedules }: Props) {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function cancel(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSchedules((cur) =>
        cur.map((s) => (s.id === id ? { ...s, status: "cancelled" } : s)),
      );
      toast({ title: "Cancelled" });
    } else {
      toast({ title: "Could not cancel", variant: "error" });
    }
    setBusyId(null);
  }

  async function publishNow(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/schedule/${id}/publish`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setSchedules((cur) =>
        cur.map((s) =>
          s.id === id
            ? { ...s, status: "published", linkedInUrn: data.schedule.linkedInUrn }
            : s,
        ),
      );
      toast({ title: "Published to LinkedIn", variant: "success" });
    } else {
      toast({ title: data.error || "Publish failed", variant: "error" });
      setSchedules((cur) =>
        cur.map((s) => (s.id === id ? { ...s, status: "failed", failureReason: data.error } : s)),
      );
    }
    setBusyId(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Schedule
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Queue posts to publish on LinkedIn at the right moment.
        </p>
      </div>

      {!linkedInConnected && (
        <Card className="border-[#0a66c2]/20 bg-[#0a66c2]/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a66c2]/10 text-[#0a66c2]">
                <LinkedInIcon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-display text-base font-semibold text-zinc-900">
                  Connect LinkedIn to schedule posts
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  We&apos;ll publish your posts at the time you set. No manual copy-paste.
                </p>
                <Button
                  size="md"
                  className="mt-4 bg-[#0a66c2] hover:bg-[#084c91]"
                  onClick={() => signIn("linkedin", { callbackUrl: "/app/schedule" })}
                  leftIcon={<LinkedInIcon className="h-4 w-4" />}
                >
                  Connect LinkedIn
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {schedules.length === 0 && linkedInConnected && (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="mx-auto h-8 w-8 text-zinc-400" />
            <div className="mt-3 font-display text-base font-semibold text-zinc-900">
              No scheduled posts yet
            </div>
            <p className="mt-1 text-sm text-zinc-500">
              Generate a post, then pick a time to publish.
            </p>
            <Link href="/app" className="mt-4 inline-block">
              <Button size="sm">Create a post</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {schedules.length > 0 && (
        <div className="space-y-3">
          {schedules.map((s) => {
            const meta = statusMeta[s.status];
            const canAct = s.status === "pending" || s.status === "failed";
            return (
              <Card key={s.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-zinc-500" />
                    <span className="text-sm font-medium text-zinc-700">
                      {formatDateTime(s.scheduledFor)}
                    </span>
                    <Badge variant={meta.variant} className="gap-1">
                      {s.status === "published" && <CheckCircle2 className="h-3 w-3" />}
                      {s.status === "failed" && <AlertCircle className="h-3 w-3" />}
                      {s.status === "publishing" && <Loader2 className="h-3 w-3 animate-spin" />}
                      {meta.label}
                    </Badge>
                  </div>
                  <div className="whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 text-sm text-zinc-800">
                    {s.content}
                  </div>
                  {s.failureReason && s.status === "failed" && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                      {s.failureReason}
                    </div>
                  )}
                  {canAct && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => publishNow(s.id)}
                        disabled={busyId === s.id || !linkedInConnected}
                        leftIcon={<Send className="h-3.5 w-3.5" />}
                      >
                        Publish now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => cancel(s.id)}
                        disabled={busyId === s.id}
                        leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
