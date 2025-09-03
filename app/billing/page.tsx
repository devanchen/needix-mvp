// app/billing/page.tsx
import BillingButtons from "@/components/billing/BillingButtons";

export const runtime = "nodejs";

export default function BillingPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-xl font-semibold">Billing</h1>
      <p className="text-sm text-white/70">
        Open your Stripe customer portal to update payment methods, cancel, or view invoices.
      </p>
      <BillingButtons />
    </div>
  );
}
