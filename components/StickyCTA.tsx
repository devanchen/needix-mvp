// components/StickyCTA.tsx
"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";

export default function StickyCTA({ heroCtaId }: { heroCtaId?: string }) {
  const { status } = useSession();
  const pathname = usePathname();

  // Hide when signed in (Dashboard FAB will show) or on /signin
  if (status === "authenticated" || pathname === "/signin") return null;

  const href = heroCtaId ? `#${heroCtaId}` : "/signin";

  return (
    <div className="fixed bottom-4 right-4 z-30">
      <a
        href={href}
        className="rounded-full border border-white/20 bg-white/[0.06] px-4 py-2 text-sm shadow hover:bg-white/[0.09]"
      >
        🚀 Try Needix
      </a>
    </div>
  );
}
