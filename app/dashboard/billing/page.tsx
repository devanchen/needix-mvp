// app/dashboard/billing/page.tsx
import { redirect } from "next/navigation";

export const runtime = "nodejs";

export default function DashboardBillingRedirect() {
  redirect("/billing");
}
