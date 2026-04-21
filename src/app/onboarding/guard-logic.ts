export function shouldRedirectFromOnboarding(ctx: {
  hasSession: boolean;
  hasDna: boolean;
}): "/auth/signin" | "/app" | null {
  if (!ctx.hasSession) return "/auth/signin";
  if (ctx.hasDna) return "/app";
  return null;
}
