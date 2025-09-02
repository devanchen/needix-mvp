// auth.ts
import NextAuth, { type NextAuthConfig, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Support either naming scheme so dev/prod don't drift
const googleClientId =
  process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID ?? "";
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET ?? "";

const githubClientId =
  process.env.AUTH_GITHUB_ID ?? process.env.GITHUB_ID ?? "";
const githubClientSecret =
  process.env.AUTH_GITHUB_SECRET ?? process.env.GITHUB_SECRET ?? "";

// Build providers immutably and log Google checks so we can verify in Vercel logs
const credentialsProvider = Credentials({
  name: "Credentials",
  credentials: { email: { label: "Email", type: "text" } },
  async authorize(creds) {
    const email = typeof creds?.email === "string" ? creds.email : "";
    if (!email) return null;
    const user =
      (await prisma.user.findUnique({ where: { email } })) ??
      (await prisma.user.create({ data: { email, name: email.split("@")[0] } }));
    return { id: user.id, email: user.email, name: user.name ?? undefined };
  },
});

const googleProvider =
  googleClientId && googleClientSecret
    ? Google({
        clientId: googleClientId,
        clientSecret: googleClientSecret,
        // ✅ Disable PKCE entirely. Keep only state (no nonce).
        checks: ["state"],
        // Request consent to ensure we always get a code (avoids hybrid/implicit)
        authorization: { params: { access_type: "offline", prompt: "consent" } },
      })
    : null;

if (googleProvider) {
  // This will appear in Vercel Runtime Logs when /api/auth/* first runs.
  // We want to see: [auth diag] google checks -> [ 'state' ]
  // If PKCE shows up here, we know the wrong handler is running.
  
  console.log("[auth diag] google checks ->", googleProvider.checks);
}

const githubProvider =
  githubClientId && githubClientSecret
    ? GitHub({ clientId: githubClientId, clientSecret: githubClientSecret })
    : null;

const providers = [
  credentialsProvider,
  ...(googleProvider ? [googleProvider] : []),
  ...(githubProvider ? [githubProvider] : []),
];

const config: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers,
  trustHost: true,
  pages: { signIn: "/signin" },
  callbacks: {
    async session({ session, token }): Promise<Session> {
      if (session.user && token?.sub) session.user.id = token.sub;
      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
export const { GET, POST } = handlers;
