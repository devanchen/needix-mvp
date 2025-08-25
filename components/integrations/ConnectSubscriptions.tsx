// components/integrations/ConnectSubscriptions.tsx
"use client";

import { signIn } from "next-auth/react";

export default function ConnectSubscriptions() {
  // Toggle via env if you want to hide it on some environments
  const enabled =
    typeof process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "string"
      ? process.env.NEXT_PUBLIC_GOOGLE_ENABLED === "1"
      : true; // default: show

  function onConnectGmail() {
    // After OAuth, land on the connected page
    signIn("google", { callbackUrl: "/integrations/gmail/connected" });
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
      <h2 className="text-lg font-semibold">Connect subscriptions</h2>
      <p className="mt-1 text-white/70 text-sm">
        Link your Gmail to auto-detect subscriptions from receipts. Read-only, can be disconnected anytime.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {/* Gmail card */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Gmail</div>
              <div className="text-xs text-white/60">Read receipts (read-only)</div>
            </div>
            <button
              onClick={onConnectGmail}
              disabled={!enabled}
              className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-900 hover:opacity-90 disabled:opacity-50"
            >
              {enabled ? "Connect" : "Unavailable"}
            </button>
          </div>
        </div>

        {/* Placeholder for Outlook */}
        <div className="rounded-xl border border-white/10 bg-black/20 p-4 opacity-70">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Outlook</div>
              <div className="text-xs text-white/60">Coming soon</div>
            </div>
            <button disabled className="rounded-lg border border-white/20 px-3 py-1.5 text-xs">
              Soon
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
