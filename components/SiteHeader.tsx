// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import UserButton from "./UserButton"; // or replace with a <Link href="/signin">Sign in</Link>

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  // Close on route change or Esc
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const links = [
    { href: "/#features", label: "Features", kind: "anchor" as const },
    { href: "/#how-it-works", label: "How it works", kind: "anchor" as const },
    { href: "/#pricing", label: "Pricing", kind: "anchor" as const },
    { href: "/items", label: "Items", kind: "page" as const },
    { href: "/subscriptions", label: "Subscriptions", kind: "page" as const },
    { href: "/dashboard", label: "Dashboard", kind: "page" as const },
  ];
  const isActive = (href: string, kind: "anchor" | "page") =>
    kind === "page" && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <header className="sticky top-0 z-[50] border-b border-white/10 bg-black/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="font-semibold tracking-tight">Needix</Link>

        {/* Desktop nav */}
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

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden md:block">
            <UserButton />
          </div>
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/5"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* MOBILE: full-screen solid black overlay */}
      {open && (
        <div className="fixed inset-0 z-[80] md:hidden">
          {/* Solid backdrop (closes on tap) */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black"
          />

          {/* Content layer */}
          <div className="absolute inset-0 flex flex-col overscroll-contain">
            {/* Top bar — padded for iOS safe area so nothing clips */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-black"
              style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}
            >
              <span className="text-white font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable nav area (100dvh avoids iOS 100vh bugs) */}
            <div className="min-h-[calc(100dvh-56px)] flex-1 overflow-y-auto bg-black px-3 pb-8">
              {/* Auth */}
              <div className="px-1 py-3 border-b border-white/15 mb-2">
                <UserButton />
              </div>

              {/* High-contrast link list (no translucent pills) */}
              <nav className="grid">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block border-b border-white/12 px-2 py-4 text-lg font-semibold tracking-tight
                      ${
                        isActive(l.href, l.kind)
                          ? "text-white"
                          : "text-white/90 hover:text-white"
                      }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
