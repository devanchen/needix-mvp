// app/subscriptions/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SP = {
  id?: string | string[];
  new?: string | string[];
};

function toNum(v: unknown): number | null {
  if (v == null) return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  // Prisma.Decimal support
  if (typeof v === "object" && v !== null && typeof (v as { toNumber?: unknown }).toNumber === "function") {
    const n = (v as { toNumber: () => number }).toNumber();
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export default async function SubscriptionsPage({
  searchParams,
}: {
  searchParams?: SP;
}) {
  // ✅ Read query on the server; no useSearchParams needed
  const selectedId = typeof searchParams?.id === "string" ? searchParams.id : undefined;
  const createNew = (typeof searchParams?.new === "string" && searchParams?.new === "1") || false;

  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">Subscriptions</h1>
        <p className="mt-3 text-white/80">
          Please{" "}
          <a className="underline" href="/signin">
            sign in
          </a>{" "}
          to manage your subscriptions.
        </p>
      </main>
    );
  }

  const subs = await prisma.subscription.findMany({
    where: { userId },
    orderBy: { nextDate: "asc" },
    select: {
      id: true,
      service: true,
      plan: true,
      price: true,
      nextDate: true,
      manageUrl: true,
      canceled: true,
    },
  });

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your subscriptions</h1>
        <div className="flex gap-2">
          <Link
            href="/subscriptions?new=1"
            className="rounded-md border border-emerald-400/40 bg-emerald-400/10 px-3 py-1.5 text-sm hover:bg-emerald-400/15"
          >
            + New
          </Link>
          <Link
            href="/dashboard"
            className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15"
          >
            Back to dashboard
          </Link>
        </div>
      </div>

      {/* Optional banner if navigated here to edit or create */}
      {(selectedId || createNew) && (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 text-sm text-white/80">
          {selectedId ? (
            <>
              Editing subscription <span className="font-mono">{selectedId}</span>. Scroll to it below
              and click <strong>Edit</strong>.
            </>
          ) : (
            <>Creating a new subscription — fill out the form below.</>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {subs.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-5 text-white/80">
            No subscriptions yet. Click <strong>+ New</strong> to add one, or use{" "}
            <Link className="underline" href="/dashboard">
              Import from Gmail
            </Link>{" "}
            on your dashboard.
          </div>
        )}

        {subs.map((s) => {
          const price = toNum(s.price);
          const selected = selectedId === s.id;
          return (
            <div
              key={s.id}
              id={`sub-${s.id}`}
              className={`rounded-xl border p-4 ${
                selected
                  ? "border-emerald-400/40 bg-emerald-400/10"
                  : "border-white/10 bg-white/[0.04]"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {s.service} {s.canceled ? <span className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-xs">Canceled</span> : null}
                  </div>
                  <div className="text-xs text-white/70">
                    {s.plan ?? "—"} • {price != null ? `$${price.toFixed(2)}` : "—"} •{" "}
                    {s.nextDate ? new Date(s.nextDate).toLocaleDateString() : "No date"}
                  </div>
                  {s.manageUrl && (
                    <div className="mt-1 text-xs">
                      <a
                        className="underline opacity-80 hover:opacity-100"
                        href={s.manageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Manage on provider ↗
                      </a>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/subscriptions?id=${s.id}`}
                    className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs hover:bg-white/15"
                  >
                    Edit
                  </Link>
                  <form action={`/api/subscriptions/${s.id}`} method="post" onSubmit={(e) => {
                    if (!confirm("Delete this subscription?")) e.preventDefault();
                  }}>
                    <input type="hidden" name="_method" value="DELETE" />
                    <button
                      type="submit"
                      className="rounded-md border border-white/15 bg-white/10 px-2 py-1 text-xs text-rose-200 hover:bg-white/15"
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
