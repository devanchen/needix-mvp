// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import UserButton from "./UserButton"; // if you haven't added this yet, swap with a plain <Link href="/signin">Sign in</Link>

export default function SiteHeader() {
  const pathname = usePathname() || "/";

  const links: { href: string; label: string; kind: "anchor" | "page" }[] = [
    { href: "/#features", label: "Features", kind: "anchor" },
    { href: "/#how-it-works", label: "How it works", kind: "anchor" },
    { href: "/#pricing", label: "Pricing", kind: "anchor" },
    { href: "/items", label: "Items", kind: "page" },
    { href: "/subscriptions", label: "Subscriptions", kind: "page" },
    { href: "/dashboard", label: "Dashboard", kind: "page" },
  ];

  const isActive = (href: string, kind: "anchor" | "page") => {
    if (kind === "anchor") return false; // don't try to "active" hash links
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Left: Brand */}
        <Link href="/" className="font-semibold tracking-tight">
          Needix
        </Link>

        {/* Center: Nav */}
        <nav className="hidden gap-5 text-sm md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`transition hover:text-white ${
                isActive(l.href, l.kind) ? "text-white" : "text-white/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center gap-3">
          <UserButton />
          {/* If you don't have UserButton, use:
          <Link
            href="/signin"
            className="rounded-xl border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5"
          >
            Sign in
          </Link> */}
        </div>
      </div>
    </header>
  );
}
