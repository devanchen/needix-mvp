// auth.ts (project root)
import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  // If you’re on Vercel, also set AUTH_TRUST_HOST=1 in env

  providers: [
    // GitHub OAuth (optional—only shows if env vars exist)
    GitHub({
      clientId: process.env.GITHUB_ID ?? "",
      clientSecret: process.env.GITHUB_SECRET ?? "",
      allowDangerousEmailAccountLinking: true,
    }),

    // Demo credentials (for local testing / quick sign-in)
    Credentials({
      id: "credentials",
      name: "Demo",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email || "").toString().trim().toLowerCase();
        const password = (creds?.password || "").toString();

        const demoEmail = process.env.DEMO_EMAIL || "demo@needix.app";
        const demoPassword = process.env.DEMO_PASSWORD || "demo";

        if (email === demoEmail && password === demoPassword) {
          // Ensure a real DB user exists for this email
          const user = await prisma.user.upsert({
            where: { email },
            update: { name: "Demo User" },
            create: { email, name: "Demo User" },
          });

          // Return the DB-backed user id so foreign keys work
          return {
            id: user.id,
            email: user.email,
            name: user.name ?? "Demo User",
          };
        }

        // Invalid demo creds
        return null;
      },
    }),
  ],

  pages: {
    signIn: "/signin", // use our custom page
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id ?? token.sub;
      return token;
    },
    async session({ session, token }) {
      if (token?.sub) (session.user as any).id = token.sub;
      if (token?.uid) (session.user as any).id = token.uid;
      return session;
    },
  },
});
