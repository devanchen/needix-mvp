// components/layout/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

function btnClasses(active: boolean) {
  const base =
    "inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium transition shadow";
  return active
    ? `${base} bg-white text-gray-900 hover:opacity-90`
    : `${base} border border-white/15 bg-white/5 text-white hover:bg-white/10`;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const isDash = pathname?.startsWith("/dashboard") ?? false;
  const isSubs = pathname?.startsWith("/subscriptions") ?? false;

  const { data: session, status } = useSession();
  const authed = status === "authenticated" && !!session?.user;
  const displayName =
    (session?.user?.name && session.user.name.trim()) ||
    (session?.user?.email && session.user.email.trim()) ||
    "Account";

  // simple dropdown for sign out
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/30 backdrop-blur supports-[backdrop-filter]:bg-black/20">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Needix
        </Link>

        <nav className="flex items-center gap-2">
          <Link href="/dashboard" className={btnClasses(isDash)}>
            Dashboard
          </Link>
          <Link href="/subscriptions" className={btnClasses(isSubs)}>
            Subscriptions
          </Link>

          {status === "loading" ? (
            // skeleton while session loads
            <div className="h-9 w-28 rounded-xl border border-white/10 bg-white/5 animate-pulse" />
          ) : authed ? (
            <div className="relative">
              <button
                onClick={() => setOpen((v) => !v)}
                className="inline-flex max-w-[200px] items-center gap-2 truncate rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="truncate">{displayName}</span>
                <svg
                  className="h-4 w-4 opacity-70"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.126l3.71-3.895a.75.75 0 011.08 1.04l-4.24 4.45a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-black/80 p-1 text-sm shadow-xl backdrop-blur"
                >
                  <button
                    onClick={() => {
                      setOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="block w-full rounded-lg px-3 py-2 text-left text-white hover:bg-white/10"
                    role="menuitem"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
