"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default function SignInPage() {
  const [email, setEmail] = useState("");

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-extrabold">Sign in</h1>
      <p className="mt-2 text-white/75">Use GitHub (if enabled) or the demo login.</p>

      <div className="mt-6 space-y-3">
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full rounded-xl bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:opacity-90"
        >
          Continue with GitHub
        </button>

        {/* Always render demo form; server enforces AUTH_ALLOW_DEMO */}
        <form
          className="space-y-2"
          onSubmit={async (e) => {
            e.preventDefault();
            await signIn("credentials", { email, callbackUrl: "/dashboard" });
          }}
        >
          <label className="block text-sm text-white/70">Email (demo)</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            placeholder="you@example.com"
            className="w-full rounded-xl border border-white/20 bg-transparent px-3 py-2 text-sm outline-none"
          />
          <button className="w-full rounded-xl border border-white/20 px-5 py-2.5 text-sm hover:bg-white/5">
            Continue as Demo
          </button>
        </form>
      </div>

      <div className="mt-6 text-sm text-white/60">
        <Link href="/" className="underline underline-offset-2">← Back home</Link>
      </div>
    </main>
  );
}
