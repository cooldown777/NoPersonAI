export interface WhatsAppProviderMessage {
  messageId: string;
  from: string;
  to: string;
  bodyText: string | null;
  mediaUrl: string | null;
  mediaContentType: string | null;
}

export interface WhatsAppProvider {
  /** Verify the inbound webhook came from the provider. */
  verifySignature(params: {
    rawBody: string;
    signature: string | null;
    url: string;
    form: Record<string, string>;
  }): Promise<boolean>;

  /** Parse provider-specific form data into a normalized message. */
  parseIncoming(form: Record<string, string>): WhatsAppProviderMessage;

  /** Fetch a media URL from the provider (authenticated download). */
  fetchMedia(url: string): Promise<{ data: Buffer; contentType: string }>;

  /** Send an outbound WhatsApp message to a user. */
  sendMessage(params: { to: string; body: string }): Promise<{ messageId: string }>;

  /** The provider's "from" address (e.g., "whatsapp:+14155238886"). */
  fromAddress(): string;

  /** Sandbox "join" instructions shown during connection setup. */
  sandboxInfo(): { joinCode: string; number: string } | null;
}
