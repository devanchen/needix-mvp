// components/SessionRefresher.tsx
"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type Status = "loading" | "authenticated" | "unauthenticated";

/**
 * Refreshes the current route once when the auth status changes.
 * Fixes the "still looks logged out until I refresh" issue.
 */
export default function SessionRefresher() {
  const { status, data } = useSession();
  const router = useRouter();
  const prev = useRef<Status | null>(null);
  const didRefreshForUser = useRef<string | null>(null);

  // Refresh when status changes (e.g., login redirect completes)
  useEffect(() => {
    if (prev.current === null) {
      prev.current = status;
      return;
    }
    if (prev.current !== status) {
      prev.current = status;
      router.refresh();
    }
  }, [status, router]);

  // Also refresh once when a user id appears (guards HMR edge cases)
  useEffect(() => {
    const id = data?.user?.id ?? null;
    if (id && didRefreshForUser.current !== id) {
      didRefreshForUser.current = id;
      router.refresh();
    }
  }, [data?.user?.id, router]);

  return null;
}
