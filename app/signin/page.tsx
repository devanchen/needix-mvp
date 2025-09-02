// app/signin/page.tsx
"use client";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <div className="mt-6 space-y-3">
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full rounded-md border border-white/15 bg-white/10 px-4 py-2 hover:bg-white/15"
        >
          Continue with Google
        </button>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const email = new FormData(e.currentTarget).get("email") as string;
            if (!email) return;
            signIn("credentials", { email, callbackUrl: "/dashboard" });
          }}
          className="rounded-md border border-white/15 p-3"
        >
          <label className="block text-sm">Email (dev only)</label>
          <input
            name="email"
            type="email"
            className="mt-1 w-full rounded-md border border-white/20 bg-transparent px-3 py-2"
            placeholder="you@example.com"
            required
          />
          <button
            type="submit"
            className="mt-3 w-full rounded-md bg-black px-4 py-2 text-white"
          >
            Continue with Email
          </button>
        </form>
      </div>
    </main>
  );
}
