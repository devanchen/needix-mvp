// /auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Github from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const hasGithub = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);
const hasGoogle = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: { email: { label: "Email", type: "text" } },
      async authorize(creds) {
        const email = typeof creds?.email === "string" ? creds.email.trim() : "";
        if (!email) return null;
        const user = await prisma.user.findFirst({ where: { email } });
        return user
          ? { id: user.id, email: user.email ?? undefined, name: user.name ?? undefined }
          : null;
      },
    }),
    ...(hasGithub
      ? [Github({ clientId: process.env.GITHUB_ID!, clientSecret: process.env.GITHUB_SECRET! })]
      : []),
    ...(hasGoogle
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
              params: {
                access_type: "offline",
                prompt: "consent",
                scope: [
                  "openid",
                  "email",
                  "profile",
                  "https://www.googleapis.com/auth/gmail.readonly",
                ].join(" "),
              },
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async session({ session, token }) {
      if (session.user && token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET, // REQUIRED in prod
});

export const { GET, POST } = handlers;
