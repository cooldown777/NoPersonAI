import { twilioProvider } from "./twilio";
import type { WhatsAppProvider } from "./provider";

export const whatsapp: WhatsAppProvider = twilioProvider;

export function toE164(raw: string): string | null {
  const trimmed = raw.trim().replace(/[\s()\-]/g, "");
  if (!/^\+\d{8,15}$/.test(trimmed)) return null;
  return trimmed;
}

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}
