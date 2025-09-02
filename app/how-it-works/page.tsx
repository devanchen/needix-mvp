// app/how-it-works/page.tsx
import Subnav from "@/components/marketing/Subnav";

export const metadata = { title: "How it works — Needix" };

export default function HowItWorksPage() {
  return (
    <>
      
      <Subnav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">How it works</h1>
        <ol className="mt-6 list-decimal space-y-3 pl-6 text-white/90">
          <li>Create an account and head to your dashboard.</li>
          <li>Add each subscription: name, plan, price, next date, and the manage/cancel URL.</li>
          <li>We email reminders before renewals.</li>
          <li>Use the dashboard to see what’s coming up and jump to providers.</li>
        </ol>
      </main>
    </>
  );
}
