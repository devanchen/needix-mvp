// components/FabDashboard.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

export default function FabDashboard() {
  const { status } = useSession();
  const pathname = usePathname();

  // Only for signed-in users and not on /dashboard
  if (status !== "authenticated" || pathname === "/dashboard") return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm shadow hover:bg-emerald-400/15"
        aria-label="Open dashboard"
      >
        📊 <span>Dashboard</span>
      </Link>
    </div>
  );
}
