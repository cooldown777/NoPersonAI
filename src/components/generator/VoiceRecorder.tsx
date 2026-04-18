"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";

interface VoiceRecorderProps {
  isPro: boolean;
  onTranscribed: (text: string) => void;
  maxSeconds?: number;
}

type Status = "idle" | "recording" | "uploading";

export default function VoiceRecorder({
  isPro,
  onTranscribed,
  maxSeconds = 120,
}: VoiceRecorderProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [levels, setLevels] = useState<number[]>(Array(24).fill(0.1));
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => stopEverything();
  }, []);

  function stopEverything() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }

  async function start() {
    if (!isPro) {
      toast({
        title: "Pro feature",
        description: "Voice recording is included in the Pro plan.",
      });
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const ctx = new AudioContext();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        analyser.getByteFrequencyData(dataArray);
        const buckets = 24;
        const step = Math.floor(dataArray.length / buckets);
        const next: number[] = [];
        for (let i = 0; i < buckets; i++) {
          const slice = dataArray.slice(i * step, (i + 1) * step);
          const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
          next.push(Math.max(0.08, avg / 255));
        }
        setLevels(next);
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = onStopped;
      recorder.start();

      startTimeRef.current = Date.now();
      setElapsed(0);
      setStatus("recording");
      timerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(seconds);
        if (seconds >= maxSeconds) stop();
      }, 250);
    } catch {
      toast({
        title: "Microphone blocked",
        description: "Allow microphone access in your browser settings.",
        variant: "error",
      });
    }
  }

  function stop() {
    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") recorder.stop();
  }

  async function onStopped() {
    stopEverything();
    setStatus("uploading");
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });
    const formData = new FormData();
    formData.append("audio", blob, "recording.webm");
    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Transcription failed",
          description: data.error || "Try again.",
          variant: "error",
        });
      } else {
        onTranscribed(data.text);
        toast({ title: "Transcribed", variant: "success" });
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setStatus("idle");
      setElapsed(0);
      setLevels(Array(24).fill(0.1));
    }
  }

  if (status === "idle") {
    return (
      <button
        type="button"
        onClick={start}
        className={cn(
          "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border transition-all",
          isPro
            ? "border-brand-200 bg-brand-50 text-brand-600 hover:bg-brand-100"
            : "border-zinc-200 bg-zinc-50 text-zinc-400",
        )}
        title={isPro ? "Record a voice note" : "Pro feature"}
        aria-label={isPro ? "Record voice note" : "Voice recording is a Pro feature"}
      >
        {isPro ? <Mic className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
      </button>
    );
  }

  if (status === "recording") {
    return (
      <div className="flex items-center gap-3 rounded-full border border-brand-200 bg-white px-3 py-1.5">
        <div className="flex h-6 items-end gap-0.5">
          {levels.map((l, i) => (
            <span
              key={i}
              className="w-0.5 rounded-full bg-brand-500 transition-[height]"
              style={{ height: `${Math.max(4, l * 24)}px` }}
            />
          ))}
        </div>
        <span className="font-mono text-xs tabular-nums text-zinc-700">
          {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
        </span>
        <Button size="sm" variant="danger" onClick={stop} leftIcon={<Square className="h-3 w-3 fill-current" />}>
          Stop
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-xs text-zinc-700">
      <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
      Transcribing…
    </div>
  );
}
