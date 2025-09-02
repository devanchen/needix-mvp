"use client";
import { signIn, signOut, useSession } from "next-auth/react";

export default function UserButton() {
  const { data: session, status } = useSession();
  if (status === "loading") return null;

  if (!session) {
    return (
      <button
        onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
        className="rounded-xl border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5"
      >
        Sign in
      </button>
    );
  }

  const email = session.user?.email ?? "account";
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-white/70 hidden sm:inline">{email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="rounded-xl bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:opacity-90"
      >
        Sign out
      </button>
    </div>
  );
}
