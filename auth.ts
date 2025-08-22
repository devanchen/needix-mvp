// auth.ts (project root)
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

// Use JWT sessions so middleware doesn't need Prisma
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },          // <-- key change
  secret: process.env.AUTH_SECRET,
  // If you're behind Vercel proxy, this env also helps:
  // Set AUTH_TRUST_HOST=1 in your env vars

  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Demo",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(creds) {
        if (process.env.AUTH_ALLOW_DEMO !== "1") return null;
        const email = String(creds?.email || "").toLowerCase();
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;

        // Create or find the user in Prisma
        const user = await prisma.user.upsert({
          where: { email },
          update: {},
          create: { email, name: "Demo User" },
        });
        return user;
      },
    }),
  ],

  // Optional: add the user id to the JWT & session object
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      if (token?.uid) (session.user as any).id = token.uid;
      return session;
    },
  },
});
