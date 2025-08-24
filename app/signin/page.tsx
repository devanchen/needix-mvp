// app/signin/page.tsx
import type { Metadata } from "next";
import { auth } from "@/auth";
import SignInButtons from "../../components/auth/SignInButtons";


export const metadata: Metadata = {
  title: "Sign in • Needix",
};

export default async function SignInPage() {
  const session = await auth();
  const authed = !!session?.user;

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <h1 className="text-2xl font-bold">Sign in</h1>
      <p className="mt-2 text-white/70">
        {authed ? "You’re already signed in." : "Choose a method below."}
      </p>

      {!authed ? (
        <div className="mt-6 space-y-3">
          {/* Dynamically shows Google/GitHub if configured, plus Demo */}
          <SignInButtons />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm text-white/80">
            You’re signed in as <span className="font-medium">{session.user?.email ?? session.user?.name}</span>.
          </div>
        </div>
      )}
    </main>
  );
}
