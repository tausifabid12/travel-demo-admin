import type { MetadataRoute } from "next";
import {
  getPackageSlugs,
  getCaseStudySlugs,
  getInsightSlugs,
  getRoleSlugs,
  getOfferingSlugs,
  getDestinationSlugs,
} from "@/lib/queries";
import { SITE_URL } from "@/lib/seo";

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1, changeFrequency: "weekly" },
  { path: "/travelxl", priority: 0.9, changeFrequency: "weekly" },
  { path: "/destinations", priority: 0.9, changeFrequency: "weekly" },
  { path: "/deals", priority: 0.8, changeFrequency: "daily" },
  { path: "/destinations", priority: 0.9, changeFrequency: "weekly" },
  { path: "/deals", priority: 0.85, changeFrequency: "daily" },
  { path: "/experia", priority: 0.8, changeFrequency: "monthly" },
  { path: "/offerings", priority: 0.8, changeFrequency: "monthly" },
  { path: "/work", priority: 0.8, changeFrequency: "weekly" },
  { path: "/about", priority: 0.7, changeFrequency: "monthly" },
  { path: "/insights", priority: 0.7, changeFrequency: "weekly" },
  { path: "/careers", priority: 0.7, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.6, changeFrequency: "yearly" },
  { path: "/privacy", priority: 0.2, changeFrequency: "yearly" },
  { path: "/terms", priority: 0.2, changeFrequency: "yearly" },
  { path: "/cookies", priority: 0.2, changeFrequency: "yearly" },
];

// Offerings with a hand-built page are listed under their own route instead.
const DEDICATED_OFFERINGS = new Set(["travelxl", "experia"]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [packages, caseStudies, insights, roles, offerings, destinations] =
    await Promise.all([
      getPackageSlugs(),
      getCaseStudySlugs(),
      getInsightSlugs(),
      getRoleSlugs(),
      getOfferingSlugs(),
      getDestinationSlugs(),
    ]);

  const entry = (
    path: string,
    updatedAt?: string,
    priority = 0.7,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  ) => ({
    url: `${SITE_URL}${path}`,
    lastModified: updatedAt ? new Date(updatedAt) : new Date(),
    changeFrequency,
    priority,
  });

  return [
    ...STATIC_ROUTES.map((r) =>
      entry(r.path, undefined, r.priority, r.changeFrequency),
    ),
    ...packages.map((p) => entry(`/travelxl/${p.slug}`, p.updatedAt, 0.8, "weekly")),
    ...destinations.map((d) =>
      entry(
        `/destinations/${d.slug ?? d.name.toLowerCase().replace(/\s+/g, "-")}`,
        d.updatedAt,
        0.8,
        "weekly",
      ),
    ),
    ...caseStudies.map((c) => entry(`/work/${c.slug}`, c.updatedAt, 0.7)),
    ...insights.map((i) => entry(`/insights/${i.slug}`, i.updatedAt, 0.6)),
    ...roles.map((r) => entry(`/careers/${r.slug}`, r.updatedAt, 0.6, "weekly")),
    ...offerings
      .filter((o) => !DEDICATED_OFFERINGS.has(o.slug))
      .map((o) => entry(`/offerings/${o.slug}`, o.updatedAt, 0.7)),
    ...destinations.map((d) =>
      entry(
        `/destinations/${d.slug ?? d.name.toLowerCase().replace(/\s+/g, "-")}`,
        d.updatedAt,
        0.8,
        "weekly",
      ),
    ),
  ];
}
