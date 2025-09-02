// lib/emails/RenewalReminder.tsx
import * as React from "react";

type Sub = {
  service: string;
  plan?: string | null;
  price?: number | null;
  nextDate?: string | null; // ISO
  manageUrl?: string | null;
};

export default function RenewalReminderEmail({
  name,
  whenLabel,
  subs,
}: {
  name?: string | null;
  whenLabel: "today" | "tomorrow" | "in 7 days";
  subs: Sub[];
}) {
  return (
    <div style={{ fontFamily: "sans-serif", color: "#111" }}>
      <h2>Heads up — {subs.length} renewal{subs.length === 1 ? "" : "s"} {whenLabel}</h2>
      {name ? <p>Hi {name},</p> : null}
      <p>The following subscriptions are due {whenLabel}:</p>
      <ul>
        {subs.map((s, i) => (
          <li key={i} style={{ marginBottom: 8 }}>
            <strong>{s.service}</strong>
            {s.plan ? ` — ${s.plan}` : ""} {s.price != null ? ` • $${Number(s.price).toFixed(2)}` : ""}
            {s.manageUrl ? (
              <>
                {" "}
                • <a href={s.manageUrl}>Manage / Cancel</a>
              </>
            ) : null}
          </li>
        ))}
      </ul>
      <p style={{ marginTop: 16 }}>
        Tip: set a <em>Next date</em> and <em>Manage link</em> for each sub in your Needix dashboard.
      </p>
      <p style={{ marginTop: 24 }}>— Needix</p>
    </div>
  );
}
