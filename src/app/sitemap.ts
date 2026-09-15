import type { MetadataRoute } from "next";
import { TOOLS, toolPath } from "@/data/tools";
import { LIVE_CATEGORIES } from "@/lib/categories";
import { GUIDES } from "@/data/guides";
import { siteConfig, INSTITUTIONAL_PAGES } from "@/config/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastMod = new Date().toISOString().split("T")[0];

  const institutionalPages: MetadataRoute.Sitemap = INSTITUTIONAL_PAGES.filter(
    (p) => p.indexable,
  ).map((p) => ({
    url: `${siteConfig.url}${p.path}`,
    lastModified: lastMod,
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${siteConfig.url}/`, lastModified: lastMod, changeFrequency: "weekly", priority: 1 },
    { url: `${siteConfig.url}/tools`, lastModified: lastMod, changeFrequency: "weekly", priority: 0.9 },
  ];

  const categoryPages: MetadataRoute.Sitemap = LIVE_CATEGORIES.map((c) => ({
    url: `${siteConfig.url}${c.path}`,
    lastModified: lastMod,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const guidePages: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: `${siteConfig.url}/tools/${g.category}/guide`,
    lastModified: lastMod,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const toolPages: MetadataRoute.Sitemap = TOOLS.map((t) => ({
    url: `${siteConfig.url}${toolPath(t)}`,
    lastModified: t.lastUpdated,
    changeFrequency: "monthly",
    priority: t.priority === "A" ? 0.8 : 0.6,
  }));

  return [...staticPages, ...institutionalPages, ...categoryPages, ...guidePages, ...toolPages];
}
