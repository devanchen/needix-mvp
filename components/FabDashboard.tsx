// components/FabDashboard.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogIn } from "lucide-react";
import { useSession } from "next-auth/react";

export default function FabDashboard() {
  const { data } = useSession();
  const pathname = usePathname() || "/";
  const isOnDashboard = pathname.startsWith("/dashboard");

  // Hide on dashboard page itself
  if (isOnDashboard) return null;

  const signedIn = !!data?.user;
  const href = signedIn ? "/dashboard" : "/signin";
  const label = signedIn ? "Dashboard" : "Sign in";

  return (
    <div className="fixed bottom-5 right-4 z-[80]">
      <Link
        href={href}
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-lg shadow-black/30 ring-1 ring-black/10 hover:opacity-90"
      >
        {signedIn ? <LayoutDashboard size={16} /> : <LogIn size={16} />}
        {label}
      </Link>
    </div>
  );
}
