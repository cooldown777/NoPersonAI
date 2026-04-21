export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

type StandardEvent =
  | "PageView"
  | "Lead"
  | "CompleteRegistration"
  | "Subscribe"
  | "InitiateCheckout"
  | "Purchase"
  | "Contact";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackEvent(event: StandardEvent, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("track", event, params);
}

export function trackCustom(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || !window.fbq) return;
  window.fbq("trackCustom", event, params);
}
