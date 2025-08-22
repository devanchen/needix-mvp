// app/items/page.tsx
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

// ✅ use relative imports to avoid alias hiccups
import ItemForm from "../../components/items/ItemForm";
import ItemList from "../../components/items/ItemList";

export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Items • Needix",
};

export default async function ItemsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-bold">Items</h1>
        <p className="mt-4 text-white/70">Please sign in to manage your items.</p>
      </main>
    );
  }

  const items = await prisma.item.findMany({
    where: { userId: session.user.id },
    orderBy: [{ nextDate: "asc" }],
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold">Your items</h1>
      <p className="mt-2 text-white/70">
        Track essentials you reorder. We’ll hold orders if current price &gt; your ceiling.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <h2 className="font-semibold">Add a new item</h2>
        <ItemForm />
      </div>

      <div className="mt-8">
        <ItemList initialItems={items} />
      </div>
    </main>
  );
}
