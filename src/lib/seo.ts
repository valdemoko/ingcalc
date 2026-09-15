import type { Metadata } from "next";
import { siteConfig, absoluteUrl } from "@/config/site";
import type { CategoryDef, ToolDefinition } from "@/lib/types";

/** Canonical + base metadata shared by every page. */
function baseMetadata(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
}): Metadata {
  const url = absoluteUrl(opts.path);
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: siteConfig.name,
      type: opts.type ?? "website",
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary",
      title: opts.title,
      description: opts.description,
    },
  };
}

/** Static page metadata (home, legal, about...). `noindex: true` adds a robots directive. */
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
}): Metadata {
  return {
    ...baseMetadata(opts),
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Tool page metadata. Title/description come from the tool definition, never generated. */
export function toolMetadata(tool: ToolDefinition, categoryPath: string): Metadata {
  const meta = baseMetadata({
    title: tool.title,
    description: tool.description,
    path: `${categoryPath}/${tool.slug}`,
  });
  return {
    ...meta,
    keywords: tool.keywords,
  };
}

/** Category page metadata. */
export function categoryMetadata(category: CategoryDef): Metadata {
  return baseMetadata({
    title: category.title,
    description: category.description,
    path: category.path,
  });
}

export interface Crumb {
  name: string;
  path: string;
}

/** BreadcrumbList JSON-LD. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** WebApplication JSON-LD for a tool. No invented ratings or reviews. */
export function toolJsonLd(tool: ToolDefinition, categoryName: string, categoryPath: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.name,
    description: tool.description,
    url: absoluteUrl(`${categoryPath}/${tool.slug}`),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    isAccessibleForFree: true,
    dateModified: tool.lastUpdated,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    about: categoryName,
  };
}

/** FAQPage JSON-LD — only rendered when the tool has substantive FAQs. */
export function faqJsonLd(faqs: { q: string; a: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Organization + WebSite JSON-LD for the homepage. */
export function siteJsonLd() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: siteConfig.url,
      description: siteConfig.tagline,
    },
  ];
}
