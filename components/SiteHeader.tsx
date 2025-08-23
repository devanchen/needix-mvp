// components/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import UserButton from "./UserButton"; // if you don't have this, swap with a <Link href="/signin">Sign in</Link>

export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);

  // Lock body scroll when the drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close with Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const links = [
    { href: "/#features", label: "Features", kind: "anchor" as const },
    { href: "/#how-it-works", label: "How it works", kind: "anchor" as const },
    { href: "/#pricing", label: "Pricing", kind: "anchor" as const },
    { href: "/items", label: "Items", kind: "page" as const },
    { href: "/subscriptions", label: "Subscriptions", kind: "page" as const },
    { href: "/dashboard", label: "Dashboard", kind: "page" as const },
  ];

  const isActive = (href: string, kind: "anchor" | "page") => {
    if (kind === "anchor") return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <header className="sticky top-0 z-[50] border-b border-white/10 bg-black/80 backdrop-blur-md">
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
            {/* If you don't have UserButton, use:
            <Link
              href="/signin"
              className="rounded-xl border border-white/20 px-3 py-1.5 text-sm hover:bg-white/5"
            >
              Sign in
            </Link> */}
          </div>

          {/* Mobile menu button */}
          <button
            aria-label="Open menu"
            onClick={() => setOpen(true)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white hover:bg-white/5"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Mobile overlay + drawer */}
      {open && (
        <>
          {/* Solid dark backdrop for contrast */}
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[65] bg-black/80 md:hidden"
          />

          {/* Right-side drawer (above header to avoid overlap) */}
          <div className="fixed top-0 right-0 z-[70] h-full w-[85%] max-w-80 overflow-y-auto border-l border-white/10 bg-black text-white shadow-2xl md:hidden">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <span className="font-semibold">Menu</span>
              <button
                aria-label="Close menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Auth (mobile) */}
            <div className="px-4 py-3 border-b border-white/10">
              <UserButton />
              {/* Or:
              <Link
                href="/signin"
                className="inline-flex rounded-xl border border-white/20 px-3 py-2 text-sm hover:bg-white/10"
              >
                Sign in
              </Link> */}
            </div>

            {/* Links */}
            <nav className="px-2 py-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={`block rounded-lg px-3 py-3 text-[15px] font-medium leading-6 transition
                    ${
                      isActive(l.href, l.kind)
                        ? "bg-white text-gray-900"
                        : "text-white hover:bg-white/10"
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
