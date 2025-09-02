// components/auth/SignInButtons.tsx
"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";

type ProvidersMap = Record<
  string,
  {
    id: string;
    name: string;
    type: string;
    signinUrl: string;
    callbackUrl: string;
  }
>;

export default function SignInButtons() {
  const [providers, setProviders] = useState<ProvidersMap | null>(null);
  const demoEmail = process.env.NEXT_PUBLIC_DEMO_EMAIL || "demo@needix.app";
  const demoPassword = process.env.NEXT_PUBLIC_DEMO_PASSWORD || "demo";

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/auth/providers", { cache: "no-store" });
        const json = (await res.json()) as ProvidersMap;
        if (mounted) setProviders(json);
      } catch {
        setProviders({});
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (!providers) {
    return <div className="h-10 w-full rounded-xl border border-white/10 bg-white/5 animate-pulse" />;
  }

  const hasGoogle = !!providers.google;
  const hasGitHub = !!providers.github;
  const hasCredentials = !!providers.credentials;

  return (
    <div className="space-y-3">
      {hasGoogle && (
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full rounded-xl bg-white px-4 py-2 text-sm font-medium text-gray-900 hover:opacity-90"
        >
          Continue with Google
        </button>
      )}

      {hasGitHub && (
        <button
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          Continue with GitHub
        </button>
      )}

      {hasCredentials && (
        <button
          onClick={() =>
            signIn("credentials", {
              email: demoEmail,
              password: demoPassword,
              callbackUrl: "/dashboard",
            })
          }
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          Demo login
        </button>
      )}

      {!hasGoogle && !hasGitHub && !hasCredentials && (
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-3 text-sm text-yellow-200">
          No sign-in providers are configured. Add env vars and restart the server.
        </div>
      )}
    </div>
  );
}
