import type { MetadataRoute } from "next";
import { FEATURES } from "@/lib/features";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://needix.com";
  const staticRoutes = ["", "/pricing", "/how-it-works", "/privacy", "/terms", "/features"].map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));

  const featureRoutes = Object.keys(FEATURES).map((slug) => ({
    url: `${base}/features/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...featureRoutes];
}
