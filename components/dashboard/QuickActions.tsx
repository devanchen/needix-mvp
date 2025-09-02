// components/dashboard/QuickActions.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

export default function QuickActions() {
  const [busy, setBusy] = useState<"gmail" | "refresh" | null>(null);
  const [msg, setMsg] = useState<string>("");
  const [showReviewLink, setShowReviewLink] = useState<boolean>(false);

  async function importGmail() {
    setBusy("gmail");
    setMsg("");
    setShowReviewLink(false);

    try {
      const res = await fetch("/api/detections/gmail/ingest", { method: "POST" });
      const data: { ok?: boolean; scanned?: number; created?: number; skipped?: number; error?: string } =
        await res.json();

      if (res.ok && data?.ok) {
        const scanned = data.scanned ?? 0;
        const created = data.created ?? 0;
        const skipped = data.skipped ?? 0;
        setMsg(`Gmail import: scanned ${scanned}, created ${created}, skipped ${skipped}.`);
        // Offer the review link whenever we successfully scanned anything
        setShowReviewLink(scanned > 0);
      } else {
        const err: string = data?.error ?? "Gmail import failed.";
        setMsg(/relink/i.test(err) ? `${err} Go to Settings → reconnect Google.` : err);
        setShowReviewLink(false);
      }
    } catch {
      setMsg("Gmail import failed.");
      setShowReviewLink(false);
    } finally {
      setBusy(null);
    }
  }

  async function refreshMembership() {
    setBusy("refresh");
    setMsg("");
    setShowReviewLink(false);

    try {
      const res = await fetch("/api/stripe/refresh-membership", { method: "POST" });
      const data: { ok?: boolean; active?: boolean; status?: string } = await res.json();
      if (res.ok && data?.ok) {
        setMsg(`Membership: ${data.active ? "Active" : data.status ?? "Unknown"}.`);
      } else {
        setMsg("Refresh failed.");
      }
    } catch {
      setMsg("Refresh failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Link
        href="/subscriptions"
        className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 hover:bg-white/[0.07]"
      >
        <div className="text-2xl">➕</div>
        <div className="mt-1 font-medium">Add subscription</div>
        <div className="text-xs text-white/70">Create or edit your services.</div>
      </Link>

      <button
        onClick={importGmail}
        disabled={busy === "gmail"}
        className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left hover:bg-white/[0.07] disabled:opacity-60"
      >
        <div className="text-2xl">📧</div>
        <div className="mt-1 font-medium">Import from Gmail</div>
        <div className="text-xs text-white/70">Scan inbox for receipts.</div>
      </button>

      <button
        onClick={refreshMembership}
        disabled={busy === "refresh"}
        className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left hover:bg-white/[0.07] disabled:opacity-60"
      >
        <div className="text-2xl">🔄</div>
        <div className="mt-1 font-medium">Refresh membership</div>
        <div className="text-xs text-white/70">Sync Stripe subscription.</div>
      </button>

      {(msg || showReviewLink) && (
        <div className="sm:col-span-3">
          <div className="mt-2 flex flex-wrap items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-xs text-white/80">
            <span>{msg}</span>
            {showReviewLink && (
              <Link
                href="/inbox"
                className="rounded-md border border-white/15 bg-white/[0.06] px-2 py-1 hover:bg-white/[0.09]"
              >
                Review detections
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
