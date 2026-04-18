"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageCircle,
  Phone,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

interface Connection {
  id: string;
  phoneE164: string;
  status: "pending" | "verified" | "revoked";
  verificationCode: string | null;
  verifiedAt: Date | null;
}

interface Message {
  id: string;
  direction: "inbound" | "outbound";
  bodyText: string | null;
  transcription: string | null;
  status: string;
  createdAt: string;
}

interface Props {
  initialConnection: Connection | null;
  sandboxJoinCode: string;
  sandboxNumber: string;
}

export default function WhatsAppClient({
  initialConnection,
  sandboxJoinCode,
  sandboxNumber,
}: Props) {
  const { toast } = useToast();
  const [connection, setConnection] = useState<Connection | null>(initialConnection);
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [disconnecting, setDisconnecting] = useState(false);

  const pollStatus = useCallback(async () => {
    const res = await fetch("/api/whatsapp/connect");
    const data = await res.json();
    if (data.connection) setConnection(data.connection);
  }, []);

  const fetchMessages = useCallback(async () => {
    const res = await fetch("/api/whatsapp/messages");
    const data = await res.json();
    setMessages(data.messages || []);
  }, []);

  useEffect(() => {
    if (connection?.status === "pending") {
      const interval = setInterval(pollStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [connection?.status, pollStatus]);

  useEffect(() => {
    if (connection?.status === "verified") {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [connection?.status, fetchMessages]);

  async function connect(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Could not start connection", description: data.error, variant: "error" });
      } else {
        setConnection({
          id: data.connectionId,
          phoneE164: data.phoneE164,
          status: data.status,
          verificationCode: data.verificationCode,
          verifiedAt: null,
        });
      }
    } catch {
      toast({ title: "Network error", variant: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  async function disconnect() {
    if (!confirm("Disconnect WhatsApp?")) return;
    setDisconnecting(true);
    try {
      await fetch("/api/whatsapp/disconnect", { method: "DELETE" });
      setConnection(null);
      setPhone("");
      toast({ title: "Disconnected" });
    } finally {
      setDisconnecting(false);
    }
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  const joinMessage = sandboxJoinCode ? `join ${sandboxJoinCode}` : "";
  const waLink = sandboxNumber
    ? `https://wa.me/${sandboxNumber.replace("+", "")}?text=${encodeURIComponent(joinMessage)}`
    : null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          WhatsApp
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Send ideas from anywhere. Get LinkedIn posts back.
        </p>
      </div>

      {!connection && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-600" />
              <CardTitle className="text-base">Connect your phone</CardTitle>
            </div>
            <CardDescription>
              Enter the WhatsApp number you&apos;ll use. Use international format (E.164), e.g.
              +4915112345678.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={connect} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+4915112345678"
                inputMode="tel"
                required
                className="flex-1"
              />
              <Button
                type="submit"
                loading={submitting}
                rightIcon={!submitting && <ArrowRight className="h-4 w-4" />}
              >
                Start setup
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {connection?.status === "pending" && (
        <Card className="border-brand-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
              <CardTitle className="text-base">Verify your number</CardTitle>
            </div>
            <CardDescription>
              Two quick steps. We&apos;ll auto-detect when you&apos;re connected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  1
                </span>
                <div className="flex-1">
                  <div className="font-display text-sm font-semibold text-zinc-900">
                    Join the sandbox
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-600">
                    On WhatsApp, message{" "}
                    <span className="font-mono text-zinc-900">{sandboxNumber || "(sandbox number)"}</span>{" "}
                    with:
                  </p>
                  <div className="mt-2 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm">
                    <span className="flex-1 text-zinc-900">{joinMessage || "join <sandbox-code>"}</span>
                    {joinMessage && (
                      <button
                        type="button"
                        onClick={() => copyText("join", joinMessage)}
                        className="rounded-md p-1 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900"
                      >
                        {copied === "join" ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                  {waLink && (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-700 hover:text-accent-800"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      Open in WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-start gap-3">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                  2
                </span>
                <div className="flex-1">
                  <div className="font-display text-sm font-semibold text-zinc-900">
                    Reply with your verification code
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-600">
                    After the sandbox confirms, send this 6-digit code in the same chat:
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="flex-1 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-center font-mono text-2xl font-bold tracking-[0.3em] text-brand-900">
                      {connection.verificationCode}
                    </span>
                    {connection.verificationCode && (
                      <button
                        type="button"
                        onClick={() => copyText("code", connection.verificationCode!)}
                        className="rounded-xl p-3 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                      >
                        {copied === "code" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Twilio sandbox limitation: you must complete step 1 before we can send messages to
                your number. This requirement goes away once the Business account is verified.
              </span>
            </div>

            <button
              type="button"
              onClick={disconnect}
              disabled={disconnecting}
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              Cancel setup
            </button>
          </CardContent>
        </Card>
      )}

      {connection?.status === "verified" && (
        <>
          <Card className="border-accent-200 bg-accent-50/40">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent-500 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-display text-sm font-semibold text-zinc-900">
                    Connected
                  </div>
                  <div className="font-mono text-xs text-zinc-600">{connection.phoneE164}</div>
                </div>
                <Badge variant="success">Verified</Badge>
              </div>
              <p className="mt-4 text-sm text-zinc-600">
                Send any text or voice note to{" "}
                <span className="font-mono text-zinc-900">{sandboxNumber}</span> on WhatsApp.
                You&apos;ll get a LinkedIn post back in under 30 seconds.
              </p>
              <button
                type="button"
                onClick={disconnect}
                disabled={disconnecting}
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Disconnect
              </button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recent messages</CardTitle>
              <CardDescription>The last 20 WhatsApp interactions.</CardDescription>
            </CardHeader>
            <CardContent>
              {messages.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-500">
                  No messages yet. Send a text or voice note to get started.
                </p>
              ) : (
                <ul className="space-y-3">
                  {messages.map((m) => (
                    <li key={m.id} className="rounded-xl border border-zinc-100 bg-zinc-50 p-3">
                      <div className="flex items-center justify-between">
                        <Badge variant={m.status === "sent" ? "success" : m.status === "failed" ? "danger" : "neutral"}>
                          {m.status}
                        </Badge>
                        <span className="text-xs text-zinc-400">
                          {new Date(m.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {(m.bodyText || m.transcription) && (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                          {m.transcription || m.bodyText}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
