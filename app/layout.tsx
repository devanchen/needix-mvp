// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";
import StickyCTA from "../components/StickyCTA";
import AuthProvider from "../components/AuthProvider"; // keep relative import
import FabDashboard from "../components/FabDashboard"; // ✅ NEW
import Toaster from "@/components/ui/Toaster";

// Prefer setting NEXT_PUBLIC_SITE_URL in your env (e.g. https://needix.app)
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
  other: { "theme-color": "#0b0f1a" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Needix",
    url: siteUrl,
    logo: `${siteUrl}/icon.png`,
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

          <SiteHeader />

          <main className="mx-auto max-w-6xl px-4">{children}</main>

          <SiteFooter />
          <StickyCTA heroCtaId="" />
          <FabDashboard /> {/* ✅ persistent Dashboard FAB */}

          {/* Background accents */}
          <div className="pointer-events-none fixed inset-0 -z-10">
            <div className="absolute -top-20 -left-40 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.10),transparent_60%)] blur-2xl" />
            <div className="absolute top-40 -right-40 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,rgba(239,68,68,0.10),transparent_60%)] blur-2xl" />
          </div>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
