// app/settings/page.tsx
"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

const ZONES = [
  "America/Denver",
  "America/Los_Angeles",
  "America/New_York",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
];

type MeResp = { emailReminders: boolean; timezone: string };
type GoogleResp = { linked: boolean; hasRefresh: boolean; email?: string | null };

export default function SettingsPage() {
  // email reminders + tz
  const [emailReminders, setEmailReminders] = useState<boolean>(false);
  const [timezone, setTimezone] = useState<string>("America/Denver");
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string>("");

  // google link status
  const [g, setG] = useState<GoogleResp | null>(null);
  const [gBusy, setGBusy] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [meR, gR] = await Promise.all([
          fetch("/api/settings/me"),
          fetch("/api/settings/google"),
        ]);
        if (meR.ok) {
          const me = (await meR.json()) as MeResp;
          setEmailReminders(me.emailReminders);
          setTimezone(me.timezone);
        }
        if (gR.ok) {
          setG((await gR.json()) as GoogleResp);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function saveEmail(x: boolean) {
    setMsg("");
    setEmailReminders(x);
    const res = await fetch("/api/reminders/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: x }),
    });
    if (!res.ok) setMsg("Failed to update email reminders.");
  }

  async function saveZone(z: string) {
    setMsg("");
    setTimezone(z);
    const res = await fetch("/api/settings/timezone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ timezone: z }),
    });
    if (!res.ok) setMsg("Failed to update timezone.");
  }

  function reconnectGoogle() {
    setGBusy(true);
    // Pass provider-specific params to force a new refresh token
    signIn("google", {
      callbackUrl: "/settings",
      prompt: "consent",
      access_type: "offline",
      scope:
        "openid email profile https://www.googleapis.com/auth/gmail.readonly",
    }).finally(() => setGBusy(false));
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">⚙️ Settings</h1>
      {loading ? (
        <p className="mt-4 text-sm text-white/70">Loading…</p>
      ) : (
        <div className="mt-6 space-y-6">
          {/* Email reminders */}
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold">Email reminders</div>
            <div className="mt-1 text-xs text-white/70">
              Receive renewal reminders to your account email.
            </div>
            <button
              onClick={() => saveEmail(!emailReminders)}
              className="mt-3 rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
            >
              {emailReminders ? "Turn off" : "Turn on"}
            </button>
          </section>

          {/* Timezone */}
          <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold">Timezone</div>
            <div className="mt-1 text-xs text-white/70">Used for reminder timings.</div>
            <select
              value={timezone}
              onChange={(e) => saveZone(e.target.value)}
              className="mt-3 rounded-md border bg-transparent px-3 py-2 text-sm"
            >
              {ZONES.map((z) => (
                <option key={z} value={z} className="bg-[#0b0f1a]">
                  {z}
                </option>
              ))}
            </select>
          </section>

          {/* Google linking */}
            <section className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold">Google connection</div>
            <div className="mt-1 text-xs text-white/70">
                Connect Google to scan your Gmail for subscription receipts.
            </div>

            <div className="mt-3 text-sm">
                Status:{" "}
                <span className={g?.linked ? "text-emerald-300" : "text-white/80"}>
                {g?.linked ? "Linked" : "Not linked"}
                </span>
                {" • "}
                Refresh token:{" "}
                <span className={g?.hasRefresh ? "text-emerald-300" : "text-amber-300"}>
                {g?.hasRefresh ? "OK" : "Missing"}
                </span>
            </div>

            <div className="mt-3 flex gap-2">
                <button
                onClick={reconnectGoogle}
                disabled={gBusy}
                className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm hover:bg-white/[0.09] disabled:opacity-60"
                >
                {g?.linked ? "Reconnect Google" : "Connect Google"}
                </button>

                {g?.linked && (
                <button
                    onClick={async () => {
                    await fetch("/api/settings/google/disconnect", { method: "POST" });
                    // refresh the status
                    const r = await fetch("/api/settings/google");
                    if (r.ok) setG(await r.json());
                    }}
                    className="rounded-md border border-white/15 bg-white/[0.06] px-3 py-1.5 text-sm hover:bg-white/[0.09]"
                >
                    Disconnect
                </button>
                )}
            </div>

            <p className="mt-2 text-[11px] text-white/60">
                If you still don’t see a refresh token, remove the app at{" "}
                <a className="underline" href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">
                Google Account → Security → Third-party access
                </a>{" "}
                and try Reconnect again.
            </p>
            </section>

          {msg && <div className="text-sm text-amber-300">{msg}</div>}
        </div>
      )}
    </main>
  );
}
