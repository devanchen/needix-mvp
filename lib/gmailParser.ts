// lib/gmailParser.ts

type Parsed = {
  service: string;
  plan: string | null;
  price: number | null;
  nextDate: string | null; // YYYY-MM-DD
  intervalDays: number | null;
  manageUrl: string | null;
  confidence: number; // 0..1
};

const manageUrls: Record<string, string> = {
  Netflix: "https://www.netflix.com/youraccount",
  Spotify: "https://www.spotify.com/account/",
  "YouTube Premium": "https://myaccount.google.com/subscriptions",
  Hulu: "https://secure.hulu.com/account",
  "Disney+": "https://www.disneyplus.com/account",
  Adobe: "https://account.adobe.com/plans",
  "Amazon Prime": "https://www.amazon.com/yourmembershipsandsubscriptions",
  Microsoft: "https://account.microsoft.com/services",
  Apple: "https://apps.apple.com/account/subscriptions",
};

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Identify service by From/Subject/body hints */
function identifyService(from?: string, subject?: string, body?: string): { name: string; score: number } {
  const hay = `${from || ""} ${subject || ""} ${body || ""}`.toLowerCase();

  const rules: Array<{ k: RegExp | string; name: string; score: number }> = [
    { k: /netflix/, name: "Netflix", score: 0.95 },
    { k: /spotify/, name: "Spotify", score: 0.95 },
    { k: /(youtube|yt premium)/, name: "YouTube Premium", score: 0.9 },
    { k: /hulu/, name: "Hulu", score: 0.9 },
    { k: /(disney\+|disney plus)/, name: "Disney+", score: 0.9 },
    { k: /adobe/, name: "Adobe", score: 0.9 },
    { k: /(amazon\.com|amazon prime|prime membership)/, name: "Amazon Prime", score: 0.85 },
    { k: /microsoft|xbox|office 365|m365/, name: "Microsoft", score: 0.8 },
    { k: /apple|itunes|app store/, name: "Apple", score: 0.8 },
  ];

  for (const r of rules) {
    if (typeof r.k === "string" ? hay.includes(r.k) : r.k.test(hay)) {
      return { name: r.name, score: r.score };
    }
  }

  // fallback: domain from From:
  const dom = from?.match(/@([a-z0-9\-\.]+)/i)?.[1]?.split(".")[0];
  if (dom && dom.length > 1) return { name: cap(dom), score: 0.5 };
  return { name: "Subscription", score: 0.3 };
}

function extractPlan(text: string): { plan: string | null; score: number } {
  const m = text.match(/\b(Premium|Family|Basic|Standard|Pro|Individual|Student|Annual|Monthly|Essentials)\b/i);
  if (!m) return { plan: null, score: 0 };
  return { plan: cap(m[1].toLowerCase()), score: 0.6 };
}

function extractPrice(text: string): { price: number | null; score: number } {
  // $12.34 or 12.34 USD
  const m =
    text.match(/\$\s?(\d{1,4}(?:\.\d{2})?)/) ||
    text.match(/\b(\d{1,4}(?:\.\d{2}))\s?(USD|usd|dollars)\b/);
  if (!m) return { price: null, score: 0 };
  const n = Number(m[1]);
  if (!Number.isFinite(n)) return { price: null, score: 0 };
  return { price: n, score: 0.7 };
}

function monthNameToNumber(name: string) {
  const m = [
    "january","february","march","april","may","june",
    "july","august","september","october","november","december"
  ];
  const idx = m.indexOf(name.toLowerCase());
  return idx >= 0 ? idx : null;
}

function extractNextDate(text: string): { iso: string | null; score: number } {
  // Common phrases: renews on, next billing date, renews xx/yy, etc.
  const phrases = [
    /renews on ([A-Za-z]+) (\d{1,2}), (\d{4})/i,
    /renews on (\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    /next (billing|payment) date[:\s]+([A-Za-z]+) (\d{1,2}), (\d{4})/i,
    /next (billing|payment) date[:\s]+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/i,
    /will renew on ([A-Za-z]+) (\d{1,2}), (\d{4})/i,
  ];
  for (const rx of phrases) {
    const m = text.match(rx);
    if (!m) continue;
    let y = 0, mo = 0, d = 0;
    if (m.length === 4) {
      mo = monthNameToNumber(m[1]) ?? 0;
      d = Number(m[2]);
      y = Number(m[3].length === 2 ? `20${m[3]}` : m[3]);
    } else if (m.length === 5) {
      if (isNaN(Number(m[2]))) {
        mo = monthNameToNumber(m[2]) ?? 0; d = Number(m[3]); y = Number(m[4]);
      } else {
        const mm = Number(m[2]); const dd = Number(m[3]); const yy = Number(m[4]);
        y = yy < 100 ? 2000 + yy : yy; mo = mm - 1; d = dd;
      }
    }
    const dt = new Date(y, mo, d);
    if (!Number.isNaN(dt.getTime())) {
      const iso = dt.toISOString().slice(0, 10);
      return { iso, score: 0.75 };
    }
  }

  // fallback: any date-looking token
  const m2 =
    text.match(/\b(\d{4})-(\d{2})-(\d{2})\b/) ||
    text.match(/\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/);
  if (m2) {
    let y = 0, mo = 0, d = 0;
    if (m2.length === 4) {
      y = Number(m2[1]); mo = Number(m2[2]) - 1; d = Number(m2[3]);
    } else {
      const a = m2.slice(1).map(Number);
      y = a[2] < 100 ? 2000 + a[2] : a[2]; mo = a[0] - 1; d = a[1];
    }
    const dt = new Date(y, mo, d);
    if (!Number.isNaN(dt.getTime())) return { iso: dt.toISOString().slice(0, 10), score: 0.4 };
  }

  return { iso: null, score: 0 };
}

function detectInterval(text: string, service: string): number | null {
  const low = text.toLowerCase();
  if (/(monthly|per month|each month)/.test(low)) return 30;
  if (/(annual|yearly|per year)/.test(low)) return 365;
  // sensible defaults by service
  if (["Netflix","Spotify","YouTube Premium","Hulu","Disney+","Adobe","Amazon Prime","Microsoft","Apple"].includes(service)) {
    return 30;
  }
  return null;
}

export function parseGmailReceipt(args: {
  from?: string;
  subject?: string;
  body?: string;
}): Parsed {
  const { from, subject, body } = args;
  const bodyText = `${subject || ""}\n${body || ""}`;

  const svc = identifyService(from, subject, bodyText);
  const plan = extractPlan(bodyText);
  const price = extractPrice(bodyText);
  const date = extractNextDate(bodyText);
  const interval = detectInterval(bodyText, svc.name);

  const manageUrl = manageUrls[svc.name] ?? null;

  // crude confidence
  const confidence = Math.max(
    svc.score * 0.6 + price.score * 0.2 + date.score * 0.2,
    0.1
  );

  return {
    service: svc.name,
    plan: plan.plan,
    price: price.price,
    nextDate: date.iso,
    intervalDays: interval,
    manageUrl,
    confidence: Number(confidence.toFixed(2)),
  };
}
