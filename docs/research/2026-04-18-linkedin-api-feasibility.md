# LinkedIn API Feasibility for NoPersonAI

**Date:** 2026-04-18
**Author:** research (Claude) for NoPersonAI
**Context:** The product generates LinkedIn-native posts from a user's voice. We want to evaluate what deeper LinkedIn integrations are realistic: one-click publishing, post analytics, profile KPIs, DMs, and comment engagement.

---

## 1. Executive summary

Posting on behalf of a signed-in user via `w_member_social` is feasible today for any app with "Sign In with LinkedIn using OpenID Connect" + "Share on LinkedIn" products approved — expect 1–2 weeks from app creation to first live post. Everything more interesting (read post analytics, follower counts, comments/engagement actions, DMs) requires acceptance into the **Marketing Developer Platform (MDP)** or **Community Management API** tracks, both of which require a registered commercial entity, a demonstrated use case, typically an existing ad-platform footprint, and LinkedIn's discretionary approval — realistic timeline is weeks to several months with a non-trivial probability of rejection for indie SaaS. A general-purpose Messaging API (DM sending) is not publicly available; only Page Messaging for MDP partners at enterprise scale.

**Recommended posture for NoPersonAI:** ship one-click publish with `w_member_social` as soon as the "Share on LinkedIn" product is approved; park analytics and engagement behind a "roadmap" pill until we hit the scale LinkedIn cares about.

---

## 2. OAuth basics

LinkedIn uses OAuth 2.0 **authorization-code flow** (three-legged). Flow:

1. Redirect user to `https://www.linkedin.com/oauth/v2/authorization` with `client_id`, `redirect_uri`, `state`, `scope`, `response_type=code`.
2. User consents. LinkedIn redirects back to our `redirect_uri` with `code`.
3. Server exchanges code at `https://www.linkedin.com/oauth/v2/accessToken` for an access token.

**Typical scope set for NoPersonAI:**

| Scope | Purpose | Product required |
| --- | --- | --- |
| `openid` | OIDC sign-in | Sign In with LinkedIn using OpenID Connect |
| `profile` | Basic profile (name, picture) | Sign In with LinkedIn using OpenID Connect |
| `email` | Primary email | Sign In with LinkedIn using OpenID Connect |
| `w_member_social` | Post, comment, like on behalf of member | Share on LinkedIn |
| `w_organization_social` | Post on behalf of a Page | Share on LinkedIn (pages later) |

**Token lifetimes:**

- Access token: **60 days**.
- Refresh token: **365 days**.

We must implement refresh-token rotation before 60 days elapse; otherwise users silently lose the ability to publish.

**App approval steps (owner side):**

1. Create an app at `https://www.linkedin.com/developers/apps`.
2. Associate it with a LinkedIn Company Page (required).
3. Under **Products**, request "Sign In with LinkedIn using OpenID Connect" and "Share on LinkedIn" — these are self-service and typically approved within a few days.
4. Configure OAuth redirect URLs (one for `localhost`, one for production).
5. Verify the app via the dashboard and note `Client ID` + `Client Secret` for env vars.

---

## 3. Posting on the user's behalf

With `w_member_social` granted, we can POST to the `/rest/posts` endpoint (newer) or `/v2/ugcPosts` (older, still supported). Body is JSON with author URN (`urn:li:person:{memberId}`), `lifecycleState: PUBLISHED`, and either plain text commentary or commentary + media.

**User experience:**

- First publish: LinkedIn shows a consent screen listing our app name, Page association, and the scopes requested. Explicit scope shown: "Post, comment, and react on your behalf."
- Once consented, subsequent publishes are silent.
- Users can revoke us at any time at `https://www.linkedin.com/psettings/permitted-services`.

**Rate limits:** ~100 calls per member per day for `w_member_social`-gated endpoints. Far above what NoPersonAI needs — even a Pro user bulk-generating 10 posts/day is well within limits.

**Delivery semantics:** the API returns a post URN on success; the post appears immediately on the member's feed. No preview, no draft-state toggle at the API level — any draft UX has to live in our app until the user hits "Publish."

---

## 4. Reading post analytics (impressions, reactions, clicks)

**Gated behind MDP.** The endpoints exist (`/rest/socialActions/{urn}/likes`, `/rest/posts/{urn}?fields=lifecycleState,socialDetail`, and various analytics endpoints), but calling them for a user's *personal* posts — as opposed to a Page they admin — is not part of the self-serve product line.

For **Page** analytics (follower delta, post impressions on a Page post), the right track is **Community Management API**, which requires:

- Registered legal entity.
- Accepted terms of the Marketing API Program.
- Stated commercial use case.
- Development tier is granted by default after application; **Standard tier** (no rate limits, full feature access) is approved only after a "vetting process" that realistically takes 4–12 weeks.
- Apps on development tier must demonstrate core business use cases within 12 months or access is revoked.

For **personal-post** analytics (what a creator sees on their own post's analytics card), there is **no public API** as of early 2026. This is the single biggest gap between "what our users want" and "what LinkedIn offers."

---

## 5. Reading profile KPIs (follower count, profile views)

**Same MDP gate as above.** Follower count for a Page is available via Community Management API on approved apps. **Profile views** (who viewed your profile) is not a public API product at all — it's a premium LinkedIn feature surfaced only inside LinkedIn's own UI.

Conclusion for NoPersonAI: if we want to show "your posts earned +N followers this week" as a retention hook, it is **not** feasible in the near term for personal profiles.

---

## 6. Messaging API (DMs)

Not generally available. Two narrow exceptions:

- **Page Messaging API** (part of Marketing API Program): lets an approved Marketing App manage *Page* inbox and send messages to people who have initiated contact with the Page. Requires MDP + Standard tier.
- **LinkedIn Sales Navigator API**: separate product, enterprise-only, partner program with its own application.

There is no public API to send a direct message from one LinkedIn user to another. Any "LinkedIn DM automation" product you see advertised is either (a) using unofficial browser automation against LinkedIn's web UI (ToS violation, account bans are common), or (b) restricted to Page Messaging with a consenting Page admin.

**NoPersonAI stance:** DM features are out of scope. We should not advertise them, because even if a user brings a workaround, we'd be helping them violate LinkedIn's ToS.

---

## 7. Community Management API (comments, engagement actions)

Covers: reading comments on Page posts, replying as the Page, reacting, and moderating. Shape is similar to Facebook's Graph API.

- **Development tier:** auto-granted, limited rate, intended for prototyping.
- **Standard tier:** full access after vetting; invite/approval required.
- **12-month clock:** development-tier apps must show a viable use case within 12 months or lose access.

For NoPersonAI's "comment engagement" ambitions (e.g., draft smart replies to comments on user's posts), the right track is Community Management, but again this is **Page-centric**, not personal-post-centric. A creator posting from their personal profile is mostly out of reach via API.

---

## 8. Terms of service considerations

Key points from LinkedIn's Marketing API terms and Platform Guidelines:

- **No scraping, no unofficial automation.** Using Puppeteer/Playwright against `linkedin.com` to simulate clicks is explicitly prohibited; LinkedIn actively bans offending accounts and has pursued cease-and-desist actions (*LinkedIn v. hiQ Labs* is the classic case, decided against scrapers).
- **All reads/writes must go through the documented API.**
- **No storing PII beyond what's necessary.** We can store email + name + LinkedIn member ID, but should not cache profiles or connection data.
- **Consent is per-scope.** Users must see and accept each scope separately; we cannot preconsent or bundle hidden scopes.
- **Revocable.** If a user revokes us, we must immediately stop calling the API on their behalf (token exchange will return 401).

**Practical implication:** stick to documented APIs only. Any "just scrape it" shortcut exposes the whole product to ToS strike.

---

## 9. Rate limits & production reliability

| Scope / surface | Limit | Window |
| --- | --- | --- |
| `w_member_social` | ~100 calls / member / day | 24h rolling |
| `/rest/posts` create | 100 / member / day | 24h rolling |
| Community Management (Dev tier) | Throttled, undocumented exact number | Per app |
| Community Management (Standard) | Generous (no published cap) | Per app |

**Operational notes:**

- Tokens can be revoked silently; the first sign is a 401 on publish. Handle by marking the user's connection as "needs reauth" in our DB and surfacing a banner.
- LinkedIn has scheduled API downtimes — subscribe to `developer.linkedin.com` announcements.
- Retries: use exponential backoff on 429 / 5xx. Do not retry on 4xx other than 429.
- The API is eventually consistent — a post URN returned from `POST /posts` may take a few seconds to be fetchable via `GET /posts/{urn}`. Do not chain reads immediately after writes in user-visible UI.

---

## 10. Feasibility matrix

| Feature | Feasible today? | Gate | Realistic timeline | Notes |
| --- | --- | --- | --- | --- |
| One-click publish from NoPersonAI to user's profile | **Yes** | "Share on LinkedIn" product approval | 1–2 weeks | `w_member_social`, no MDP needed |
| Publish to a Page the user admins | **Yes** | Same | 1–2 weeks | `w_organization_social` |
| Schedule a publish time | **Partial** | We schedule server-side; LinkedIn has no native schedule endpoint | Immediate after publish works | Our cron hits the API at the scheduled time |
| Read personal-post impressions / reactions | **No** | No public API for personal posts | Not on LinkedIn roadmap | Only Page posts via CM API |
| Read Page-post analytics | **Yes, gated** | Community Management API Standard tier | 1–3 months | After vetting |
| Read follower count (Page) | **Yes, gated** | CM API | Same | |
| Read follower count (personal profile) | **No** | No API | — | Profile stats not exposed |
| Read profile views | **No** | No API | — | Premium UI feature only |
| Send DMs on behalf of user | **No** | Not generally available | — | ToS violation to scrape |
| Page Messaging | **Yes, gated** | MDP Standard | 1–3 months | Enterprise-oriented |
| Draft smart comment replies on a Page | **Yes, gated** | CM API Standard | 1–3 months | Page, not personal |
| Draft smart comment replies on personal post | **No** | No API | — | |

---

## 11. Recommended path for NoPersonAI

**Phase A (ship next quarter):**

1. Apply for "Sign In with LinkedIn using OpenID Connect" + "Share on LinkedIn" at app creation — both are self-serve.
2. Build one-click publish: `w_member_social` + store `accessToken`, `refreshToken`, `expiresAt`, `providerMemberId` on the user.
3. Background cron refreshes tokens at `expiresAt - 2d`.
4. UI: existing "Copy to clipboard" keeps working. Add "Publish to LinkedIn" as a second primary action on posts from connected accounts. Show "Reconnect" banner on 401.
5. Users who revoke: catch 401 → `status = revoked` on our side → block future publish attempts until reconnection.

**Phase B (only when we cross ~5k paying users):**

6. Apply for Community Management API (development tier is auto-granted).
7. Launch "Pages" as a separate product surface for users who admin company pages. Show Page analytics.
8. Use the 12-month Development-tier window to apply for Standard.

**Phase C (not committed):**

9. If NoPersonAI demonstrably moves ad spend on LinkedIn, apply for Marketing Partner status. This opens Page Messaging + full analytics.

**Explicitly out of scope:** personal-profile analytics, profile views, DM automation, comment automation on personal posts. These aren't "hard", they're **not available** and pursuing them via scraping is an existential ToS risk.

---

## References

- [Getting Access to LinkedIn APIs (Microsoft Learn)](https://learn.microsoft.com/en-us/linkedin/shared/authentication/getting-access)
- [LinkedIn Marketing API Program Access Tiers](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/marketing-tiers)
- [Community Management – Overview](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview)
- [Community Management API product catalog](https://developer.linkedin.com/product-catalog/marketing/community-management-api)
- [Marketing API Program Terms](https://www.linkedin.com/legal/l/marketing-api-terms)
- [Apply – LinkedIn Developer Network](https://developer.linkedin.com/content/developer/global/en_us/index/partner-programs/apply)
- [Marketing Developer Platform Overview](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/marketing-integrations-overview)
