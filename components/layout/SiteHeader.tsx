// components/layout/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
        </nav>
      </div>
    </header>
  );
}
