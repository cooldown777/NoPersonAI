import twilio from "twilio";
import type { WhatsAppProvider, WhatsAppProviderMessage } from "./provider";

type TwilioClient = ReturnType<typeof twilio>;

let _client: TwilioClient | null = null;
function getClient(): TwilioClient {
  if (!_client) {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      throw new Error("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set");
    }
    _client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  }
  return _client;
}

function normalizeFrom(raw: string): string {
  return raw.trim();
}

function stripWaPrefix(raw: string): string {
  return raw.startsWith("whatsapp:") ? raw.slice("whatsapp:".length) : raw;
}

export const twilioProvider: WhatsAppProvider = {
  async verifySignature({ signature, url, form }) {
    if (!signature) return false;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!authToken) return false;
    return twilio.validateRequest(authToken, signature, url, form);
  },

  parseIncoming(form): WhatsAppProviderMessage {
    const from = stripWaPrefix(normalizeFrom(form.From || ""));
    const to = stripWaPrefix(normalizeFrom(form.To || ""));
    const bodyText = form.Body?.trim() || null;
    const mediaCount = Number(form.NumMedia || "0");
    const mediaUrl = mediaCount > 0 ? form.MediaUrl0 || null : null;
    const mediaContentType = mediaCount > 0 ? form.MediaContentType0 || null : null;
    return {
      messageId: form.MessageSid || form.SmsMessageSid || "",
      from,
      to,
      bodyText,
      mediaUrl,
      mediaContentType,
    };
  },

  async fetchMedia(url: string) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const basic = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const res = await fetch(url, { headers: { Authorization: `Basic ${basic}` } });
    if (!res.ok) throw new Error(`Failed to fetch media: ${res.status}`);
    const arrayBuffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") || "audio/ogg";
    return { data: Buffer.from(arrayBuffer), contentType };
  },

  async sendMessage({ to, body }) {
    const from = this.fromAddress();
    const toAddr = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
    const msg = await getClient().messages.create({ from, to: toAddr, body });
    return { messageId: msg.sid };
  },

  fromAddress() {
    const from = process.env.TWILIO_WHATSAPP_FROM;
    if (!from) throw new Error("TWILIO_WHATSAPP_FROM is not set");
    return from;
  },

  sandboxInfo() {
    const joinCode = process.env.TWILIO_WHATSAPP_SANDBOX_JOIN_CODE || null;
    const number = process.env.TWILIO_WHATSAPP_FROM
      ? stripWaPrefix(process.env.TWILIO_WHATSAPP_FROM)
      : null;
    if (!joinCode || !number) return null;
    return { joinCode, number };
  },
};

export default twilioProvider;
