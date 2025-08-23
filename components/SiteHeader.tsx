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

  const links: { href: string; label: string; kind: "anchor" | "page" }[] = [
    { href: "/#features", label: "Features", kind: "anchor" },
    { href: "/#how-it-works", label: "How it works", kind: "anchor" },
    { href: "/#pricing", label: "Pricing", kind: "anchor" },
    { href: "/items", label: "Items", kind: "page" },
    { href: "/subscriptions", label: "Subscriptions", kind: "page" },
    { href: "/dashboard", label: "Dashboard", kind: "page" },
  ];

  const isActive = (href: string, kind: "anchor" | "page") => {
    if (kind === "anchor") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Close the mobile menu when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="font-semibold tracking-tight">
          Needix
        </Link>

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
          {/* Desktop auth */}
          <div className="hidden md:block">
            <UserButton />
          </div>
          {/* Mobile menu button */}
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 hover:bg-white/5"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-50 w-80 max-w-[85%] transform bg-black/95 p-4 shadow-2xl md:hidden">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/20 hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Auth on mobile */}
            <div className="mb-4">
              <UserButton />
            </div>

            <nav className="grid gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`rounded-lg px-3 py-2 text-sm transition hover:bg-white/5 ${
                    isActive(l.href, l.kind) ? "text-white" : "text-white/80"
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
