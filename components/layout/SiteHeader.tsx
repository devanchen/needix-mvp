// components/layout/SiteHeader.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import UserMenu from "./UserMenu";

export default function SiteHeader() {
  const pathname = usePathname();
  const { status } = useSession();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <Link href="/" className="group inline-flex items-center gap-2 text-lg font-semibold">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-white/10 text-sm">🧾</span>
          <span className="bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent group-hover:to-white">
            Needix
          </span>
        </Link>

        {/* Top nav (desktop) */}
        <nav className="hidden gap-6 md:flex">
          <HeaderLink href="/features" active={isActive("/features")}>✨ Features</HeaderLink>
          <HeaderLink href="/pricing" active={isActive("/pricing")}>💸 Pricing</HeaderLink>
          <HeaderLink href="/faq" active={isActive("/faq")}>❓ FAQ</HeaderLink>
        </nav>

        {/* Right actions (desktop) */}
        <div className="hidden items-center gap-2 md:flex">
          <CTA href="/subscriptions" tone="neutral">📋 Subscriptions</CTA>
          <CTA href="/dashboard" tone="primary">📊 Dashboard</CTA>
          <UserMenu />
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md border border-white/15 px-2 py-1 text-sm md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Menu"
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {/* Mobile sheet */}
      {open && (
        <div className="border-t border-white/10 bg-background/95 p-3 md:hidden">
          <div className="flex flex-col gap-3">
            <MobileLink href="/features" onClick={() => setOpen(false)}>✨ Features</MobileLink>
            <MobileLink href="/pricing" onClick={() => setOpen(false)}>💸 Pricing</MobileLink>
            <MobileLink href="/faq" onClick={() => setOpen(false)}>❓ FAQ</MobileLink>
            <MobileLink href="/subscriptions" onClick={() => setOpen(false)}>📋 Subscriptions</MobileLink>
            <MobileLink href="/dashboard" onClick={() => setOpen(false)}>📊 Dashboard</MobileLink>
            {status !== "authenticated" ? (
              <button
                className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-left text-sm hover:bg-white/[0.07]"
                onClick={() => {
                  setOpen(false);
                  void signIn(undefined, { callbackUrl: "/dashboard" });
                }}
              >
                🔑 Sign in
              </button>
            ) : (
              <button
                className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-left text-sm hover:bg-white/[0.07]"
                onClick={() => {
                  setOpen(false);
                  void signOut({ callbackUrl: "/" });
                }}
              >
                🔒 Sign out
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function HeaderLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={[
        "relative text-sm transition",
        active ? "text-white" : "text-white/80 hover:text-white",
      ].join(" ")}
    >
      <span className="relative">
        {children}
        <span
          className={[
            "absolute -bottom-1 left-0 h-px w-full transition",
            active ? "bg-white" : "bg-white/30",
          ].join(" ")}
        />
      </span>
    </Link>
  );
}

function CTA({
  href,
  children,
  tone = "primary",
}: {
  href: string;
  children: React.ReactNode;
  tone?: "primary" | "neutral";
}) {
  const base =
    "inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm transition shadow-sm";
  const cls =
    tone === "primary"
      ? "border-emerald-400/40 bg-emerald-400/10 hover:bg-emerald-400/15"
      : "border-white/15 bg-white/[0.04] hover:bg-white/[0.07]";
  return <Link href={href} className={`${base} ${cls}`}>{children}</Link>;
}

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="rounded-md border border-white/15 bg-white/[0.04] px-3 py-2 text-sm hover:bg-white/[0.07]"
    >
      {children}
    </Link>
  );
}
