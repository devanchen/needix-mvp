// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import UserButton from "./UserButton"; // or swap with a <Link href="/signin">Sign in</Link>

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  // Lock/unlock scroll (iOS-friendly)
  useEffect(() => {
    const el = document.documentElement; // lock <html> to be safe on iOS
    if (open) {
      const prev = el.style.overflow;
      el.style.overflow = "hidden";
      return () => {
        el.style.overflow = prev;
      };
    } else {
      // ensure unlock on close
      document.documentElement.style.overflow = "";
    }
  }, [open]);

  // Close with Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close when route changes
  useEffect(() => setOpen(false), [pathname]);

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
        {/* Brand */}
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
            {/* Or:
            <Link href="/signin" className="rounded-xl border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5">Sign in</Link>
            */}
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

      {/* Mobile FULL-SCREEN drawer */}
      {open && (
        <div className="fixed inset-0 z-[80] md:hidden">
          {/* Solid backdrop */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70"
          />
          {/* Panel */}
          <div className="absolute inset-0 left-0 bg-neutral-950 text-white shadow-2xl">
            {/* Top bar (safe-area padding) */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10"
                 style={{ paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
              <span className="font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="h-[calc(100vh-56px)] overflow-y-auto px-3 py-3">
              {/* Auth */}
              <div className="px-1 pb-3 border-b border-white/10 mb-3">
                <UserButton />
              </div>

              {/* Links – big, high-contrast pills */}
              <nav className="grid gap-2">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={`block rounded-xl px-4 py-3 text-base font-semibold tracking-tight transition
                      ${
                        isActive(l.href, l.kind)
                          ? "bg-white text-gray-900"
                          : "bg-white/6 text-white hover:bg-white/10"
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
