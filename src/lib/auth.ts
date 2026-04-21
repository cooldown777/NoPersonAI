import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import LinkedInProvider from "next-auth/providers/linkedin";
import EmailProvider from "next-auth/providers/email";
import { createTransport } from "nodemailer";
import { prisma } from "@/lib/db";
import { magicLinkEmail } from "@/lib/email/templates";

// Expected Google Cloud Console redirect URI:
//   ${NEXTAUTH_URL}/api/auth/callback/google
// Set in: Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Authorized redirect URIs

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
      allowDangerousEmailAccountLinking: true,
    }),
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
      authorization: {
        params: {
          scope: "openid profile email w_member_social",
        },
      },
      issuer: "https://www.linkedin.com/oauth",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      allowDangerousEmailAccountLinking: true,
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
      },
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier, url, provider }) {
        if (!process.env.EMAIL_SERVER_HOST || !process.env.EMAIL_SERVER_PASSWORD) {
          console.error("[auth/email] Missing EMAIL_SERVER_* env vars. Magic link not sent.");
          throw new Error("Email service is not configured.");
        }
        if (!process.env.EMAIL_FROM) {
          console.error("[auth/email] Missing EMAIL_FROM env var.");
          throw new Error("Email service is not configured.");
        }
        const { host } = new URL(url);
        const { subject, html, text } = magicLinkEmail({ url, host });
        try {
          const transport = createTransport(provider.server);
          const result = await transport.sendMail({
            to: identifier,
            from: provider.from,
            subject,
            text,
            html,
          });
          const failed = result.rejected.concat(result.pending).filter(Boolean);
          if (failed.length) {
            console.error("[auth/email] SMTP rejected/pending", {
              failed,
              response: result.response,
            });
            throw new Error(`Email could not be sent to ${failed.join(", ")}`);
          }
        } catch (err) {
          console.error("[auth/email] sendMail failed", {
            identifier,
            host: process.env.EMAIL_SERVER_HOST,
            port: process.env.EMAIL_SERVER_PORT,
            err: err instanceof Error ? err.message : err,
          });
          throw err;
        }
      },
    }),
  ],
  cookies: {
    state: {
      name: "next-auth.state",
      options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: { httpOnly: true, sameSite: "none", path: "/", secure: true },
    },
  },
  session: {
    strategy: "database",
    maxAge: 60 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};
