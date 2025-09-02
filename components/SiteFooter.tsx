// components/SiteFooter.tsx
import NewsletterForm from "./marketing/NewsletterForm";

export default function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-white/10">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-2">
          <NewsletterForm />
          <div className="text-sm text-white/70">
            <div className="font-semibold text-white">Needix</div>
            <p className="mt-2">
              Keep every subscription under control — reminders, manage links, and a single dashboard.
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs">
              <a className="underline" href="/pricing">Pricing</a>
              <a className="underline" href="/faq">FAQ</a>
              <a className="underline" href="/subscriptions">Subscriptions</a>
              <a className="underline" href="/dashboard">Dashboard</a>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/50">
          © {new Date().getFullYear()} Needix. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
