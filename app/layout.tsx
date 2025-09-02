// app/layout.tsx
import "./globals.css";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import SiteHeader from "../components/layout/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import StickyCTA from "../components/StickyCTA";
import AuthProvider from "../components/AuthProvider";
import FabDashboard from "../components/FabDashboard";
import Toaster from "@/components/ui/Toaster";
import PwaRegistrar from "@/components/pwa/PwaRegistrar";

/** Normalize to a safe origin string, auto-prepending https:// when needed */
function normalizeSiteUrl(input?: string): string {
  const fallback = "https://localhost:3000";
  if (!input) return fallback;
  const trimmed = input.trim();
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(withProto).origin;
  } catch {
    return fallback;
  }
}

/** Build-time/site-wide origin from env (used by metadata) */
const envSiteUrl = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

/** Next.js Metadata (evaluated at build time) */
export const metadata: Metadata = {
  metadataBase: new URL(envSiteUrl),
  title: {
    default: "Needix — Never run out again",
    template: "%s • Needix",
  },
  description:
    "Automated reorders for essentials. One dashboard. Price ceilings. Cancel anytime.",
  keywords: [
    "subscriptions",
    "auto reorder",
    "automated shopping",
    "Needix",
    "price ceiling",
    "essentials",
    "toilet paper",
    "paper towels",
    "detergent",
    "pet food",
  ],
  authors: [{ name: "Needix" }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    title: "Needix — Never run out again",
    description:
      "Automated reorders for essentials. One dashboard. Price ceilings. Cancel anytime.",
    siteName: "Needix",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Needix — Never run out again" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Needix — Never run out again",
    description:
      "Automated reorders for essentials. One dashboard. Price ceilings. Cancel anytime.",
    images: ["/og.png"],
    creator: "@needix",
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png", sizes: "32x32" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Next.js 15: themeColor belongs in viewport export
export const viewport: Viewport = {
  themeColor: "#0b0f1a",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Runtime-origin fallback: if env var is unset/invalid, use the request Host header
  const hdrs = await headers();
  const host = hdrs.get("x-forwarded-host") ?? hdrs.get("host") ?? null;
  const proto = hdrs.get("x-forwarded-proto") ?? "https";
  const runtimeOrigin = host ? normalizeSiteUrl(`${proto}://${host}`) : envSiteUrl;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Needix",
    url: runtimeOrigin,
    logo: `${runtimeOrigin}/icon.png`,
    sameAs: [] as string[],
  };

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <AuthProvider>
          {/* JSON-LD for search engines */}
          <script
            type="application/ld+json"
            suppressHydrationWarning
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />

          {/* Sticky, button-style top nav */}
          <SiteHeader />

          {/* Add top padding so content isn't hidden under the sticky header */}
          <main className="mx-auto max-w-6xl px-4 pt-16">{children}</main>

          <SiteFooter />
          <StickyCTA heroCtaId="" />
          <FabDashboard />

          {/* Background accents */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute -top-20 -left-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.10),transparent_60%)] blur-2xl" />
            <div className="absolute top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.10),transparent_60%)] blur-2xl" />
          </div>
        </AuthProvider>

        {/* Toasts (top-right, above everything) */}
        <Toaster />

        {/* Registers /sw.js once on the client (PWA) */}
        <PwaRegistrar />
      </body>
    </html>
  );
}
