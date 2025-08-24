"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState(
    process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@needix.app"
  );
  const [password, setPassword] = useState(
    process.env.NEXT_PUBLIC_DEMO_PASSWORD || "demo"
  );
  const [loading, setLoading] = useState<string | null>(null);

  const callbackUrl = "/dashboard";

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-white/75">
        Use GitHub (if enabled) or the demo login.
      </p>

      <div className="mt-6 space-y-3">
        {/* GitHub button (renders even if not configured; will 400 if missing envs) */}
        <button
          onClick={async () => {
            setLoading("github");
            try {
              await signIn("github", { callbackUrl });
            } finally {
              setLoading(null);
            }
          }}
          className="w-full rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:opacity-90 disabled:opacity-50"
          disabled={loading !== null}
        >
          {loading === "github" ? "Redirecting…" : "Continue with GitHub"}
        </button>

        {/* Divider */}
        <div className="relative py-2 text-center text-xs text-white/50">
          <span className="relative z-10 bg-transparent px-2">or</span>
          <div className="absolute inset-x-0 top-1/2 -z-10 h-px bg-white/10" />
        </div>

        {/* Demo credentials form */}
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setLoading("demo");
            try {
              await signIn("credentials", {
                email,
                password,
                callbackUrl,
                redirect: true,
              });
            } finally {
              setLoading(null);
            }
          }}
          className="space-y-3"
        >
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="password"
            className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button
            type="submit"
            className="w-full rounded-xl border border-white/20 px-5 py-2.5 text-sm hover:bg-white/5 disabled:opacity-50"
            disabled={loading !== null}
          >
            {loading === "demo" ? "Signing in…" : "Continue as Demo"}
          </button>
        </form>
      </div>

      <div className="mt-6 text-sm text-white/60">
        <Link href="/" className="underline underline-offset-2">
          ← Back home
        </Link>
      </div>
    </main>
  );
}
