import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
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
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      maxAge: 24 * 60 * 60,
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url);
        const { subject, html, text } = magicLinkEmail({ url, host });
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
          throw new Error(`Email could not be sent to ${failed.join(", ")}`);
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
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
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
