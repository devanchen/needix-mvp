// components/layout/UserMenu.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export default function UserMenu() {
  const { data, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const email = data?.user?.email ?? "";
  const name = data?.user?.name ?? "";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.05] px-3 py-1.5 text-sm hover:bg-white/[0.08]"
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10">👤</span>
        <span className="hidden sm:inline">{status === "authenticated" ? (name || email || "Account") : "Account"}</span>
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/15 bg-[#0b0f1a] shadow-xl"
        >
          {status === "authenticated" ? (
            <div>
              <div className="border-b border-white/10 p-3 text-xs text-white/70">
                Signed in as <span className="text-white">{email || name || "you"}</span>
              </div>
              <MenuLink href="/dashboard">📊 Dashboard</MenuLink>
              <MenuLink href="/subscriptions">📋 Subscriptions</MenuLink>
              <MenuLink href="/billing">💳 Billing</MenuLink>
              <MenuLink href="/settings">⚙️ Settings</MenuLink>
              <MenuLink href="/faq">🧠 Help / FAQ</MenuLink>
              <button
                role="menuitem"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-white/[0.06]"
              >
                🔒 Sign out
              </button>
            </div>
          ) : (
            <div>
              <MenuLink href="/features">✨ Features</MenuLink>
              <MenuLink href="/pricing">💸 Pricing</MenuLink>
              <MenuLink href="/faq">❓ FAQ</MenuLink>
              <button
                role="menuitem"
                onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
                className="block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-white/[0.06]"
              >
                🔑 Sign in
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      role="menuitem"
      href={href}
      className="block px-4 py-2 text-sm hover:bg-white/[0.06]"
    >
      {children}
    </Link>
  );
}
