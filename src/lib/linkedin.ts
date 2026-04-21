import { prisma } from "@/lib/db";

export interface LinkedInAccount {
  accessToken: string;
  refreshToken: string | null;
  expiresAt: number | null;
  providerAccountId: string;
}

export async function getLinkedInAccount(userId: string): Promise<LinkedInAccount | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "linkedin" },
    select: {
      access_token: true,
      refresh_token: true,
      expires_at: true,
      providerAccountId: true,
    },
  });
  if (!account?.access_token) return null;
  return {
    accessToken: account.access_token,
    refreshToken: account.refresh_token,
    expiresAt: account.expires_at,
    providerAccountId: account.providerAccountId,
  };
}

export async function isLinkedInConnected(userId: string): Promise<boolean> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "linkedin" },
    select: { id: true, expires_at: true },
  });
  if (!account) return false;
  if (account.expires_at && account.expires_at * 1000 < Date.now()) return false;
  return true;
}

export async function disconnectLinkedIn(userId: string): Promise<void> {
  await prisma.account.deleteMany({ where: { userId, provider: "linkedin" } });
}

/**
 * Publishes a text-only post to LinkedIn using the REST Posts API.
 * Returns the share URN on success, throws on failure.
 */
export async function publishToLinkedIn(
  userId: string,
  content: string,
): Promise<string> {
  const account = await getLinkedInAccount(userId);
  if (!account) throw new Error("LinkedIn not connected");
  if (account.expiresAt && account.expiresAt * 1000 < Date.now()) {
    throw new Error("LinkedIn token expired — please reconnect");
  }

  const author = `urn:li:person:${account.providerAccountId}`;

  const body = {
    author,
    commentary: content,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
  };

  const res = await fetch("https://api.linkedin.com/rest/posts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${account.accessToken}`,
      "Content-Type": "application/json",
      "LinkedIn-Version": "202401",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`LinkedIn API ${res.status}: ${errText.slice(0, 200)}`);
  }

  const urn = res.headers.get("x-restli-id") ?? res.headers.get("x-linkedin-id");
  if (!urn) throw new Error("LinkedIn did not return a share URN");
  return urn;
}
