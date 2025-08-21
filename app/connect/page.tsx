'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckCircle2, PlugZap, Shield } from "lucide-react";

const PROVIDERS = [
  { id: "netflix",  label: "Netflix"  },
  { id: "spotify",  label: "Spotify"  },
  { id: "adobe",    label: "Adobe"    },
  { id: "amazon",   label: "Amazon"   },
  { id: "apple",    label: "Apple"    },
  { id: "hulu",     label: "Hulu"     },
];

export default function ConnectPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  // read ?connected=<provider> after mock callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("connected");
    if (p) {
      setConnected((prev) => (prev.includes(p) ? prev : [...prev, p]));
      window.history.replaceState({}, "", "/connect");
    }
  }, []);

  const connect = async (provider: string) => {
    setConnecting(provider);
    try {
      window.location.href = `/api/integrations/${provider}/authorize`;
    } finally {
      // let the redirect take over
    }
  };

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-extrabold">Connect subscriptions</h1>
      <p className="mt-2 text-white/75">
        Link services so we can track renewals, parse receipts, and auto‑cancel trials before they bill.
      </p>

      <div className="mt-6 flex items-center gap-4 text-sm text-white/70">
        <Shield className="h-4 w-4" />
        Private by default. We only store what’s needed to track renewals and receipts.
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {PROVIDERS.map((p) => {
          const isConnected = connected.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => connect(p.id)}
              disabled={isConnected || connecting === p.id}
              className={`flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-3 text-sm transition
                ${isConnected ? "opacity-60" : "hover:bg-white/10 active:bg-white/15"}`}
            >
              {isConnected ? <CheckCircle2 className="h-4 w-4 text-green-300" /> : <PlugZap className="h-4 w-4 text-red-300" />}
              {isConnected ? `${p.label} connected` : `Connect ${p.label}`}
            </button>
          );
        })}
      </div>

      <div className="mt-10 text-sm text-white/70">
        Don’t see your service? <Link href="/contact" className="underline underline-offset-2">Tell us</Link>.
      </div>
    </main>
  );
}
