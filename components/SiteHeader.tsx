"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-black/50 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10">N</span>
          <span className="font-semibold tracking-tight">Needix</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 text-sm text-white/80 md:flex">
          <Link href="/how-it-works" className="hover:text-white">How it works</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 shadow hover:opacity-90 active:opacity-80 transition"
          >
            Manage subscriptions
          </Link>
        </nav>

        {/* Mobile hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5"
          aria-label="Open menu"
        >
          <span className="block h-0.5 w-5 bg-white" />
        </button>
      </div>

      {/* Drawer + Overlay */}
      {open && (
        <>
          {/* Overlay */}
          <button
            aria-label="Close menu overlay"
            className="fixed inset-0 z-40 bg-black/60"
            onClick={() => setOpen(false)}
          />
          {/* Drawer panel */}
          <div className="fixed right-0 top-0 z-50 h-full w-80 max-w-[80%] border-l border-white/10 bg-[#0b0f1a] p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-white/10">N</span>
                <span className="font-semibold tracking-tight">Needix</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="mt-8 grid gap-4 text-sm">
              <Link href="/how-it-works" className="rounded-lg px-2 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>
                How it works
              </Link>
              <Link href="/pricing" className="rounded-lg px-2 py-2 hover:bg-white/5" onClick={() => setOpen(false)}>
                Pricing
              </Link>
              <Link
                href="/dashboard"
                className="mt-2 inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-gray-900 font-medium shadow hover:opacity-90 active:opacity-80 transition"
                onClick={() => setOpen(false)}
              >
                Manage subscriptions
              </Link>
            </nav>

            <div className="mt-10 border-t border-white/10 pt-6 text-xs text-white/60">
              Support: <a className="underline" href="mailto:hello@needix.app">hello@needix.app</a>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
