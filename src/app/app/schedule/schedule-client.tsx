"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Calendar,
  Loader2,
  Trash2,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Pencil,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  ChevronDown,
} from "lucide-react";
import { LinkedInIcon } from "@/components/brand/LinkedInIcon";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import ScheduleButton from "@/components/generator/ScheduleButton";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";

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

function relativeTime(iso: string): string {
  const ms = new Date(iso).getTime() - Date.now();
  const abs = Math.abs(ms);
  const min = Math.round(abs / 60000);
  const hr = Math.round(abs / 3600000);
  const day = Math.round(abs / 86400000);
  const past = ms < 0;
  if (min < 1) return past ? "just now" : "in <1m";
  if (min < 60) return past ? `${min}m ago` : `in ${min}m`;
  if (hr < 24) return past ? `${hr}h ago` : `in ${hr}h`;
  if (day < 30) return past ? `${day}d ago` : `in ${day}d`;
  return formatDateTime(iso);
}

function hookOf(text: string): string {
  const first = text.split("\n").find((l) => l.trim().length > 0) ?? text;
  return first.length > 90 ? first.slice(0, 90) + "…" : first;
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

export default function ScheduleClient({ linkedInConnected, initialSchedules }: Props) {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editWhen, setEditWhen] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [posts, setPosts] = useState<{ id: string; output: string; createdAt: string }[]>([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!pickerOpen || posts.length > 0) return;
    setPostsLoading(true);
    fetch("/api/posts")
      .then((r) => r.json())
      .then((d) => setPosts(d.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setPostsLoading(false));
  }, [pickerOpen, posts.length]);

  const filteredPosts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((p) => p.output.toLowerCase().includes(q));
  }, [posts, query]);

  async function cancel(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSchedules((cur) => cur.filter((s) => s.id !== id));
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

  function startEdit(s: Schedule) {
    setEditingId(s.id);
    setEditContent(s.content);
    setEditWhen(toLocalInput(s.scheduledFor));
  }

  async function saveEdit(id: string) {
    setBusyId(id);
    const res = await fetch(`/api/schedule/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: editContent,
        scheduledFor: new Date(editWhen).toISOString(),
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setSchedules((cur) =>
        cur.map((s) =>
          s.id === id
            ? {
                ...s,
                content: data.schedule.content,
                scheduledFor: data.schedule.scheduledFor,
                status: data.schedule.status,
                failureReason: null,
              }
            : s,
        ),
      );
      setEditingId(null);
      toast({ title: "Updated" });
    } else {
      toast({ title: data.error || "Could not update", variant: "error" });
    }
    setBusyId(null);
  }

  const schedulesByDay = useMemo(() => {
    const map = new Map<string, Schedule[]>();
    for (const s of schedules) {
      if (s.status === "cancelled") continue;
      const d = new Date(s.scheduledFor);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [schedules]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Schedule
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Queue posts to publish on LinkedIn at the right moment.
          </p>
        </div>
        <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1">
          <button
            onClick={() => setView("list")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              view === "list" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50",
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              view === "calendar" ? "bg-zinc-900 text-white" : "text-zinc-600 hover:bg-zinc-50",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Calendar
          </button>
        </div>
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

      {linkedInConnected && (
        <Card>
          <CardContent className="p-4">
            {!pickerOpen ? (
              <Button
                size="sm"
                onClick={() => setPickerOpen(true)}
                leftIcon={<Plus className="h-3.5 w-3.5" />}
              >
                Schedule a post
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="font-display text-sm font-semibold text-zinc-900">
                    Pick a post to schedule
                  </div>
                  <div className="flex-1" />
                  <button
                    onClick={() => setPickerOpen(false)}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    Close
                  </button>
                </div>

                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search your posts…"
                    className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-9 pr-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  />
                </div>

                {postsLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-zinc-200 p-6 text-center text-sm text-zinc-500">
                    {posts.length === 0 ? (
                      <>
                        No posts yet.{" "}
                        <Link href="/app" className="font-medium text-brand-600 underline">
                          Generate one
                        </Link>
                      </>
                    ) : (
                      "No matches."
                    )}
                  </div>
                ) : (
                  <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
                    {filteredPosts.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-xl border border-zinc-200 bg-white p-3"
                      >
                        <p className="line-clamp-2 text-sm text-zinc-800">{p.output}</p>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-[11px] text-zinc-500">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </span>
                          <ScheduleButton postId={p.id} content={p.output} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {view === "calendar" && (
        <CalendarView
          cursor={cursor}
          setCursor={setCursor}
          schedulesByDay={schedulesByDay}
        />
      )}

      {view === "list" && schedules.length === 0 && linkedInConnected && (
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

      {view === "list" && schedules.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {schedules.map((s, i) => {
            const meta = statusMeta[s.status];
            const canAct = s.status === "pending" || s.status === "failed";
            const isEditing = editingId === s.id;
            const isExpanded = expandedId === s.id || isEditing;
            const chars = s.content.length;
            return (
              <div
                key={s.id}
                className={cn(
                  "transition-colors",
                  i !== 0 && "border-t border-zinc-100",
                  isExpanded && "bg-zinc-50/60",
                )}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) return;
                    setExpandedId(isExpanded ? null : s.id);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-zinc-50"
                >
                  <div
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[11px] font-semibold",
                      s.status === "published" && "bg-emerald-100 text-emerald-700",
                      s.status === "failed" && "bg-red-100 text-red-700",
                      s.status === "publishing" && "bg-amber-100 text-amber-700",
                      s.status === "cancelled" && "bg-zinc-100 text-zinc-500",
                      s.status === "pending" && "bg-brand-100 text-brand-700",
                    )}
                    aria-hidden
                  >
                    {new Date(s.scheduledFor).toLocaleDateString(undefined, {
                      day: "2-digit",
                    })}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-zinc-900">
                        {hookOf(s.content)}
                      </span>
                    </div>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
                      <Clock className="h-3 w-3" />
                      <span>{relativeTime(s.scheduledFor)}</span>
                      <span>·</span>
                      <span>{formatDateTime(s.scheduledFor)}</span>
                      <span>·</span>
                      <span>{chars} chars</span>
                    </div>
                  </div>

                  <Badge variant={meta.variant} className="shrink-0 gap-1">
                    {s.status === "published" && <CheckCircle2 className="h-3 w-3" />}
                    {s.status === "failed" && <AlertCircle className="h-3 w-3" />}
                    {s.status === "publishing" && <Loader2 className="h-3 w-3 animate-spin" />}
                    {meta.label}
                  </Badge>

                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-zinc-400 transition-transform",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="space-y-3 border-t border-zinc-100 px-4 py-4">
                    {isEditing ? (
                      <>
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          rows={6}
                          maxLength={3000}
                          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                        />
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-zinc-700">
                            When
                          </label>
                          <input
                            type="datetime-local"
                            value={editWhen}
                            onChange={(e) => setEditWhen(e.target.value)}
                            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => saveEdit(s.id)}
                            disabled={busyId === s.id}
                            leftIcon={
                              busyId === s.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : undefined
                            }
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                            disabled={busyId === s.id}
                          >
                            Cancel
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap rounded-xl bg-white p-3 text-sm text-zinc-800 ring-1 ring-zinc-200">
                          {s.content}
                        </div>
                        {s.failureReason && s.status === "failed" && (
                          <div className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
                            {s.failureReason}
                          </div>
                        )}
                        {canAct && (
                          <div className="flex flex-wrap gap-2">
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
                              onClick={() => startEdit(s)}
                              disabled={busyId === s.id}
                              leftIcon={<Pencil className="h-3.5 w-3.5" />}
                            >
                              Edit
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
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CalendarView({
  cursor,
  setCursor,
  schedulesByDay,
}: {
  cursor: Date;
  setCursor: (d: Date) => void;
  schedulesByDay: Map<string, Schedule[]>;
}) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = firstDay.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  function shift(delta: number) {
    setCursor(new Date(year, month + delta, 1));
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-display text-base font-semibold text-zinc-900">
            {monthLabel}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => shift(-1)}
              className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
              className="rounded-full px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
            >
              Today
            </button>
            <button
              onClick={() => shift(1)}
              className="rounded-full p-1.5 text-zinc-500 hover:bg-zinc-100"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-zinc-400">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (d === null) return <div key={i} className="aspect-square" />;
            const key = `${year}-${month}-${d}`;
            const items = schedulesByDay.get(key) ?? [];
            const isToday = key === todayKey;
            return (
              <div
                key={i}
                className={cn(
                  "flex aspect-square flex-col rounded-xl border p-1.5 text-left",
                  isToday
                    ? "border-brand-500 bg-brand-50"
                    : "border-zinc-200 bg-white",
                )}
              >
                <div
                  className={cn(
                    "text-[11px] font-semibold",
                    isToday ? "text-brand-700" : "text-zinc-700",
                  )}
                >
                  {d}
                </div>
                <div className="mt-auto flex flex-wrap gap-0.5">
                  {items.slice(0, 3).map((s) => (
                    <span
                      key={s.id}
                      title={`${formatDateTime(s.scheduledFor)} — ${s.content.slice(0, 80)}`}
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        s.status === "published"
                          ? "bg-emerald-500"
                          : s.status === "failed"
                          ? "bg-red-500"
                          : s.status === "publishing"
                          ? "bg-amber-500"
                          : "bg-brand-500",
                      )}
                    />
                  ))}
                  {items.length > 3 && (
                    <span className="text-[9px] font-medium text-zinc-500">
                      +{items.length - 3}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-zinc-500">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Scheduled
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Published
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" /> Failed
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
