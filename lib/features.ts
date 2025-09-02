export type FeatureSlug =
  | "dashboard"
  | "ceilings"
  | "trials"
  | "pause"
  | "rewards"
  | "updates";

export const FEATURES: Record<
  FeatureSlug,
  {
    title: string;
    tagline: string;
    points: string[];
    proofs: string[];
    ctaLabel?: string;
  }
> = {
  dashboard: {
    title: "All subs in one place",
    tagline:
      "Netflix, Spotify, Adobe + every delivery. One screen for renewals, upcoming orders and total spend.",
    points: [
      "200+ services recognized automatically",
      "Unified view of physical deliveries + digital renewals",
      "Live receipts and line‑item parsing (vendor, amount, date)",
      "Export to CSV; monthly rollups by category",
    ],
    proofs: ["3k+ auto‑orders placed", "1.8k+ subscriptions tracked", "9k+ receipts processed"],
    ctaLabel: "Start your plan",
  },
  ceilings: {
    title: "Price ceiling control",
    tagline: "Never overpay: we hold orders when prices spike past your limit.",
    points: [
      "Set per‑item or per‑category ceilings",
      "Smart retry when price normalizes",
      "Alerts only when intervention is needed",
    ],
    proofs: ["Avg. 18% price spike blocked", "Zero mark‑ups from Needix"],
  },
  trials: {
    title: "Auto‑cancel trials",
    tagline: "Try things without the ‘forgot to cancel’ tax.",
    points: [
      "Track trial end dates automatically",
      "Auto‑cancel or prompt for 1‑tap cancel",
      "Email + SMS reminders before renewal",
    ],
    proofs: ["Zero surprise renewals reported by pilot users"],
  },
  pause: {
    title: "Pause with one click",
    tagline: "Trip or budget week? Freeze everything instantly.",
    points: [
      "Global pause or per‑item/per‑service pause",
      "Auto‑resume schedule",
      "Works for both deliveries and subscriptions",
    ],
    proofs: ["<1s to pause", "Granular controls"],
  },
  rewards: {
    title: "Loyalty rewards",
    tagline: "Get a free essential every 6 months of use.",
    points: [
      "Points on every automated order",
      "Redeem for staples you actually need",
      "Bonus streaks for perfect on‑time confirmations",
    ],
    proofs: ["6‑month freebie included"],
  },
  updates: {
    title: "Smart updates",
    tagline: "Only the pings you actually need—nothing noisy.",
    points: [
      "Low‑noise digest for the week",
      "Critical alerts for spikes, declines, and trials",
      "Choose email, SMS, or push (coming soon)",
    ],
    proofs: ["High signal → fewer taps"],
  },
};
